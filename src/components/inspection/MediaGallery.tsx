import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Eye, Download, Video, FileVideo, Loader2 } from 'lucide-react';
import { useInspectionMedia, useDeleteInspectionMedia } from '@/hooks/useInspectionMedia';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import MediaPreviewModal from './MediaPreviewModal';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface MediaGalleryProps {
  reportId: string;
  itemId?: string;
  showItemFilter?: boolean;
}

export default function MediaGallery({ reportId, itemId, showItemFilter }: MediaGalleryProps) {
  const { data: media = [], isLoading } = useInspectionMedia(reportId, itemId);
  const deleteMedia = useDeleteInspectionMedia();
  const [previewMedia, setPreviewMedia] = useState<any>(null);

  const handleDelete = (mediaItem: any) => {
    deleteMedia.mutate({
      id: mediaItem.id,
      reportId,
      url: mediaItem.url,
    });
  };

  const handleDownload = (mediaItem: any) => {
    const link = document.createElement('a');
    link.href = mediaItem.url;
    link.download = `${mediaItem.type}-${mediaItem.id}`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (media.length === 0) {
    return (
      <Card>
        <CardContent className="text-center p-12">
          <p className="text-muted-foreground">אין קבצי מדיה</p>
        </CardContent>
      </Card>
    );
  }

  const photos = media.filter((m) => m.type === 'photo');
  const videos = media.filter((m) => m.type === 'video');

  return (
    <>
      <div className="space-y-6">
        {/* Photos */}
        {photos.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">תמונות ({photos.length})</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <Card key={photo.id} className="overflow-hidden group">
                  <AspectRatio ratio={1}>
                    <img
                      src={photo.url}
                      alt={photo.caption || 'תמונה'}
                      className="object-cover w-full h-full"
                    />
                  </AspectRatio>

                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-white hover:bg-white/20"
                      onClick={() => setPreviewMedia(photo)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-white hover:bg-white/20"
                      onClick={() => handleDownload(photo)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-white hover:bg-white/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="z-[120]">
                        <AlertDialogHeader>
                          <AlertDialogTitle>מחיקת תמונה</AlertDialogTitle>
                          <AlertDialogDescription>
                            האם אתה בטוח שברצונך למחוק תמונה זו?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>ביטול</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(photo)}>
                            מחק
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  {photo.caption && (
                    <div className="p-2 bg-background border-t">
                      <p className="text-xs text-muted-foreground truncate">
                        {photo.caption}
                      </p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Videos */}
        {videos.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">סרטונים ({videos.length})</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map((video) => (
                <Card key={video.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <FileVideo className="h-6 w-6 text-primary" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {video.caption || 'סרטון'}
                        </p>
                        <Badge variant="secondary" className="mt-1">
                          <Video className="h-3 w-3 ml-1" />
                          וידאו
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setPreviewMedia(video)}
                      >
                        <Eye className="ml-2 h-4 w-4" />
                        צפה
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(video)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="z-[120]">
                          <AlertDialogHeader>
                            <AlertDialogTitle>מחיקת סרטון</AlertDialogTitle>
                            <AlertDialogDescription>
                              האם אתה בטוח שברצונך למחוק סרטון זה?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>ביטול</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(video)}>
                              מחק
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {previewMedia && (
        <MediaPreviewModal
          media={previewMedia}
          open={!!previewMedia}
          onClose={() => setPreviewMedia(null)}
        />
      )}
    </>
  );
}
