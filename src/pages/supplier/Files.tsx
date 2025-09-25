import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  Filter, 
  Upload, 
  Download, 
  FileText, 
  Image, 
  FileIcon, 
  Trash2,
  Calendar,
  FolderIcon,
  Grid3X3,
  List,
  ChevronDown,
  ArrowUpDown,
  Eye
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { filesService, FileFilters, SupplierFile } from '@/services/filesService';
import { FilePreview } from '@/components/files/FilePreview';
import { FileUploadModal } from '@/components/files/FileUploadModal';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ViewMode = 'grid' | 'list';
type SortBy = 'date' | 'name' | 'size' | 'type';

const Files: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FileFilters>({
    fileType: 'all'
  });
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<SupplierFile | null>(null);

  // Fetch files
  const { 
    data: filesData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['supplier-files', user?.id, filters, searchTerm, sortBy],
    queryFn: () => {
      if (!user?.id) throw new Error('User not authenticated');
      return filesService.getSupplierFiles(user.id, {
        ...filters,
        search: searchTerm || undefined
      });
    },
    enabled: !!user?.id,
  });

  // File statistics
  const { data: fileStats } = useQuery({
    queryKey: ['file-stats', user?.id],
    queryFn: () => {
      if (!user?.id) throw new Error('User not authenticated');
      return filesService.getFileStats(user.id);
    },
    enabled: !!user?.id,
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: (data: { orderId: string; file: File }) => 
      filesService.uploadFile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-files'] });
      queryClient.invalidateQueries({ queryKey: ['file-stats'] });
      setUploadDialogOpen(false);
      toast({
        title: 'קובץ הועלה בהצלחה',
        description: 'הקובץ נוסף לספריית הקבצים'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'שגיאה בהעלאת קובץ',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (fileId: string) => filesService.deleteFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-files'] });
      queryClient.invalidateQueries({ queryKey: ['file-stats'] });
      setSelectedFiles(new Set());
      toast({
        title: 'קובץ נמחק בהצלחה'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'שגיאה במחיקת קובץ',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // File upload handler
  const handleFileUpload = useCallback(async (orderId: string, file: File) => {
    await uploadMutation.mutateAsync({ orderId, file });
  }, [uploadMutation]);

  // Download file
  const handleDownload = useCallback(async (file: SupplierFile) => {
    try {
      const downloadUrl = await filesService.getDownloadUrl(file.id);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = file.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error: any) {
      toast({
        title: 'שגיאה בהורדת קובץ',
        description: error.message,
        variant: 'destructive'
      });
    }
  }, [toast]);

  // Get file type icon
  const getFileIcon = (file: SupplierFile) => {
    const mimeType = file.mime_type || '';
    
    if (mimeType.startsWith('image/')) return Image;
    if (mimeType.includes('pdf') || mimeType.includes('document')) return FileText;
    return FileIcon;
  };

  // Format file size
  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  // Filter files by type
  const getFilteredFiles = () => {
    let files = filesData?.files || [];
    
    // Sort files
    files = [...files].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.file_name.localeCompare(b.file_name);
        case 'size':
          return (b.file_size || 0) - (a.file_size || 0);
        case 'type':
          return (a.mime_type || '').localeCompare(b.mime_type || '');
        case 'date':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return files;
  };

  const filteredFiles = getFilteredFiles();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6" dir="rtl">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">ספריית קבצים ותוכניות</h1>
              <p className="text-muted-foreground">
                ניהול כל הקבצים והתוכניות שלך במקום אחד
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* View toggle */}
              <div className="flex items-center border rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-l-lg rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-r-lg rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              <FileUploadModal
                open={uploadDialogOpen}
                onOpenChange={setUploadDialogOpen}
                onUpload={handleFileUpload}
                isUploading={uploadMutation.isPending}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6 space-y-6">
        {/* Stats Cards */}
        {fileStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">סך הכל קבצים</p>
                    <p className="text-2xl font-bold">{fileStats.totalFiles}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <FolderIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">נפח כולל</p>
                    <p className="text-2xl font-bold">{formatFileSize(fileStats.totalSize)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Upload className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">הועלו השבוע</p>
                    <p className="text-2xl font-bold">{fileStats.recentUploads}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Image className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">תמונות</p>
                    <p className="text-2xl font-bold">{fileStats.byType.image || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="חיפוש קבצים..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>

              {/* File type filter */}
              <Select 
                value={filters.fileType || 'all'} 
                onValueChange={(value: any) => setFilters(prev => ({ ...prev, fileType: value }))}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="סוג קובץ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל הקבצים</SelectItem>
                  <SelectItem value="image">תמונות</SelectItem>
                  <SelectItem value="document">מסמכים</SelectItem>
                  <SelectItem value="drawing">תוכניות</SelectItem>
                  <SelectItem value="other">אחר</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-40">
                    <ArrowUpDown className="h-4 w-4 ml-2" />
                    מיון לפי
                    <ChevronDown className="h-4 w-4 mr-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSortBy('date')}>
                    תאריך עדכון
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('name')}>
                    שם הקובץ
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('size')}>
                    גודל קובץ
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('type')}>
                    סוג קובץ
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        {/* Files Display */}
        {error ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-destructive">שגיאה בטעינת הקבצים</p>
              <Button onClick={() => refetch()} variant="outline" className="mt-4">
                נסה שוב
              </Button>
            </CardContent>
          </Card>
        ) : filteredFiles.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">אין קבצים להצגה</h3>
              <p className="text-muted-foreground mb-4">
                העלה קבצים או שנה את מסנני החיפוש
              </p>
              <Button onClick={() => setUploadDialogOpen(true)}>
                <Upload className="h-4 w-4 ml-2" />
                העלה קובץ ראשון
              </Button>
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredFiles.map((file) => {
              const FileIconComponent = getFileIcon(file);
              return (
                <Card key={file.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-center justify-between">
                        <FileIconComponent className="h-8 w-8 text-blue-600" />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDownload(file)}>
                              <Download className="h-4 w-4 ml-2" />
                              הורד
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setPreviewFile(file)}>
                              <Eye className="h-4 w-4 ml-2" />
                              תצוגה מקדימה
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => deleteMutation.mutate(file.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 ml-2" />
                              מחק
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div>
                        <h4 className="font-medium truncate" title={file.file_name}>
                          {file.file_name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.file_size)}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 ml-1" />
                          {format(new Date(file.created_at), 'dd/MM/yyyy')}
                        </div>
                        
                        {file.order && (
                          <Badge variant="outline" className="text-xs">
                            {file.order.title || `הזמנה ${file.order.id.slice(-6)}`}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-right p-4 font-medium">שם הקובץ</th>
                      <th className="text-right p-4 font-medium">גודל</th>
                      <th className="text-right p-4 font-medium">סוג</th>
                      <th className="text-right p-4 font-medium">הזמנה</th>
                      <th className="text-right p-4 font-medium">תאריך</th>
                      <th className="text-center p-4 font-medium">פעולות</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFiles.map((file) => {
                      const FileIconComponent = getFileIcon(file);
                      return (
                        <tr key={file.id} className="border-b hover:bg-muted/50">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <FileIconComponent className="h-5 w-5 text-muted-foreground" />
                              <span className="font-medium">{file.file_name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {formatFileSize(file.file_size)}
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {file.mime_type?.split('/')[0] || 'אחר'}
                          </td>
                          <td className="p-4">
                            {file.order ? (
                              <Badge variant="outline">
                                {file.order.title || `הזמנה ${file.order.id.slice(-6)}`}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {format(new Date(file.created_at), 'dd/MM/yyyy HH:mm')}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => handleDownload(file)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => deleteMutation.mutate(file.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {filesData && filesData.hasMore && (
          <div className="flex justify-center">
            <Button variant="outline" onClick={() => {/* Implement pagination */}}>
              טען עוד קבצים
            </Button>
          </div>
        )}

        {/* File Preview */}
        <FilePreview
          file={previewFile}
          open={!!previewFile}
          onOpenChange={() => setPreviewFile(null)}
          onDownload={handleDownload}
        />
      </div>
    </div>
  );
};

export default Files;