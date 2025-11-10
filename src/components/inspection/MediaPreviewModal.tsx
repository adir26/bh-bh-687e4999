import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';

interface MediaPreviewModalProps {
  media: {
    id: string;
    type: 'photo' | 'video';
    url: string;
    caption?: string;
  };
  open: boolean;
  onClose: () => void;
}

export default function MediaPreviewModal({ media, open, onClose }: MediaPreviewModalProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = media.url;
    link.download = `${media.type}-${media.id}`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle>{media.caption || 'תצוגה מקדימה'}</DialogTitle>
              <Badge variant="secondary" className="mt-2">
                {media.type === 'photo' ? 'תמונה' : 'סרטון'}
              </Badge>
            </div>

            <div className="flex gap-2">
              <Button size="icon" variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="p-6 pt-4 overflow-auto">
          {media.type === 'photo' ? (
            <img
              src={media.url}
              alt={media.caption || 'תמונה'}
              className="w-full h-auto rounded-lg"
            />
          ) : (
            <video
              src={media.url}
              controls
              className="w-full h-auto rounded-lg"
              autoPlay
            >
              הדפדפן שלך אינו תומך בתצוגת סרטונים
            </video>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
