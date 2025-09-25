import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Image as ImageIcon, FileIcon, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { SupplierFile } from '@/services/filesService';

interface FilePreviewProps {
  file: SupplierFile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload: (file: SupplierFile) => void;
}

export const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  open,
  onOpenChange,
  onDownload
}) => {
  if (!file) return null;

  const getFileIcon = () => {
    const mimeType = file.mime_type || '';
    if (mimeType.startsWith('image/')) return ImageIcon;
    if (mimeType.includes('pdf') || mimeType.includes('document')) return FileText;
    return FileIcon;
  };

  const FileIconComponent = getFileIcon();
  const isImage = file.mime_type?.startsWith('image/');

  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileIconComponent className="h-6 w-6" />
              {file.file_name}
            </div>
            <Button onClick={() => onDownload(file)} size="sm">
              <Download className="h-4 w-4 ml-2" />
              הורד
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="space-y-1">
              <p className="text-sm font-medium">גודל קובץ</p>
              <p className="text-sm text-muted-foreground">{formatFileSize(file.file_size)}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium">סוג קובץ</p>
              <p className="text-sm text-muted-foreground">{file.mime_type || 'לא ידוע'}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium">תאריך העלאה</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(file.created_at), 'dd/MM/yyyy HH:mm')}
              </p>
            </div>
          </div>

          {/* Order Info */}
          {file.order && (
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">פרטי הזמנה</h4>
                <Badge variant="outline">
                  {file.order.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {file.order.title || `הזמנה ${file.order.id.slice(-6)}`}
              </p>
              {file.order.client_name && (
                <p className="text-sm text-muted-foreground">
                  לקוח: {file.order.client_name}
                </p>
              )}
            </div>
          )}

          {/* File Preview */}
          <div className="border rounded-lg overflow-hidden">
            {isImage ? (
              <div className="flex justify-center p-4">
                <img 
                  src={file.file_url} 
                  alt={file.file_name}
                  className="max-w-full max-h-96 object-contain rounded"
                />
              </div>
            ) : file.mime_type?.includes('pdf') ? (
              <div className="p-8 text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">תצוגה מקדימה של PDF</p>
                <iframe
                  src={`${file.file_url}#toolbar=0&navpanes=0&scrollbar=0`}
                  className="w-full h-96 border rounded"
                  title={file.file_name}
                />
              </div>
            ) : (
              <div className="p-8 text-center">
                <FileIconComponent className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  תצוגה מקדימה לא זמינה עבור סוג קובץ זה
                </p>
                <Button onClick={() => onDownload(file)} variant="outline">
                  <Download className="h-4 w-4 ml-2" />
                  הורד קובץ כדי לצפות
                </Button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              סגור
            </Button>
            <Button onClick={() => onDownload(file)}>
              <Download className="h-4 w-4 ml-2" />
              הורד קובץ
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};