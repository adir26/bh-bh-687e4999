import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Image, Video, Loader2 } from 'lucide-react';
import { useUploadInspectionMedia } from '@/hooks/useInspectionMedia';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

interface MediaUploadZoneProps {
  reportId: string;
  itemId?: string;
  type: 'photo' | 'video';
}

export default function MediaUploadZone({ reportId, itemId, type }: MediaUploadZoneProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const uploadMedia = useUploadInspectionMedia();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      setUploading(true);
      setProgress(0);

      try {
        const totalFiles = acceptedFiles.length;
        let completed = 0;

        for (const file of acceptedFiles) {
          // Validate file size (max 10MB for photos, 50MB for videos)
          const maxSize = type === 'photo' ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
          if (file.size > maxSize) {
            toast.error(`הקובץ ${file.name} גדול מדי`);
            continue;
          }

          await uploadMedia.mutateAsync({
            file,
            reportId,
            itemId,
            type,
          });

          completed++;
          setProgress((completed / totalFiles) * 100);
        }

        toast.success(`${completed} קבצים הועלו בהצלחה`);
      } catch (error) {
        console.error('Upload error:', error);
        toast.error('שגיאה בהעלאת קבצים');
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
    [reportId, itemId, type, uploadMedia]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: type === 'photo' 
      ? { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] }
      : { 'video/*': ['.mp4', '.mov', '.avi', '.webm'] },
    multiple: true,
    disabled: uploading,
  });

  return (
    <Card>
      <CardContent className="p-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-primary/50'
          } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />

          {uploading ? (
            <div className="space-y-4">
              <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">מעלה קבצים...</p>
              <Progress value={progress} className="w-full max-w-xs mx-auto" />
            </div>
          ) : (
            <div className="space-y-4">
              {type === 'photo' ? (
                <Image className="h-12 w-12 mx-auto text-muted-foreground" />
              ) : (
                <Video className="h-12 w-12 mx-auto text-muted-foreground" />
              )}

              {isDragActive ? (
                <p className="text-sm font-medium">שחרר כאן...</p>
              ) : (
                <>
                  <p className="text-sm font-medium">
                    גרור קבצים לכאן או לחץ לבחירה
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {type === 'photo'
                      ? 'תמונות: PNG, JPG, JPEG, GIF, WEBP (עד 10MB)'
                      : 'סרטונים: MP4, MOV, AVI, WEBM (עד 50MB)'}
                  </p>
                </>
              )}

              <Button type="button" variant="outline" size="sm">
                <Upload className="ml-2 h-4 w-4" />
                בחר קבצים
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
