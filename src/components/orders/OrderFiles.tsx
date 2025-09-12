import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileIcon, Download, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { orderService, OrderFile } from '@/services/orderService';
import { useAuth } from '@/contexts/AuthContext';

interface OrderFilesProps {
  orderId: string;
}

export function OrderFiles({ orderId }: OrderFilesProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: files = [], isLoading } = useQuery({
    queryKey: ['order-files', orderId],
    queryFn: () => orderService.getOrderFiles(orderId),
  });

  const uploadFileMutation = useMutation({
    mutationFn: (file: File) => orderService.uploadOrderFile(orderId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-files', orderId] });
      toast({
        title: 'File uploaded successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to upload file',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select a file smaller than 10MB',
          variant: 'destructive'
        });
        return;
      }
      
      uploadFileMutation.mutate(file);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return FileIcon;
    
    if (mimeType.startsWith('image/')) return FileIcon;
    if (mimeType.startsWith('video/')) return FileIcon;
    if (mimeType.includes('pdf')) return FileIcon;
    if (mimeType.includes('document')) return FileIcon;
    if (mimeType.includes('spreadsheet')) return FileIcon;
    
    return FileIcon;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileIcon className="h-5 w-5" />
            Files & Attachments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileIcon className="h-5 w-5" />
          Files & Attachments
          <Badge variant="secondary" className="ml-auto">
            {files.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Upload Button */}
          <div>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileUpload}
              accept="*/*"
            />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={uploadFileMutation.isPending}
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploadFileMutation.isPending ? 'Uploading...' : 'Upload File'}
            </Button>
          </div>

          {/* Files List */}
          {files.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <FileIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No files uploaded yet</p>
              <p className="text-sm">Upload files to share with the other party</p>
            </div>
          ) : (
            <div className="space-y-3">
              {files.map((file) => {
                const FileIconComponent = getFileIcon(file.mime_type);
                const isOwnFile = file.uploaded_by === user?.id;
                
                return (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <FileIconComponent className="h-8 w-8 text-muted-foreground" />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium truncate">{file.file_name}</h4>
                        {isOwnFile && (
                          <Badge variant="outline" className="text-xs">
                            You
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(file.created_at), 'MMM d, yyyy')}
                        </div>
                        
                        {file.file_size && (
                          <span>{formatFileSize(file.file_size)}</span>
                        )}
                        
                        {!isOwnFile && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Other party
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(file.file_url, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}