import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MediaUploadZone from './MediaUploadZone';
import MediaGallery from './MediaGallery';
import { Image, Video } from 'lucide-react';

interface ReportMediaTabProps {
  reportId: string;
}

export default function ReportMediaTab({ reportId }: ReportMediaTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>מדיה</CardTitle>
          <CardDescription>
            העלה תמונות וסרטונים שמתעדים את הממצאים בדוח
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="photos" dir="rtl">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="photos" className="gap-2">
            <Image className="h-4 w-4" />
            תמונות
          </TabsTrigger>
          <TabsTrigger value="videos" className="gap-2">
            <Video className="h-4 w-4" />
            סרטונים
          </TabsTrigger>
        </TabsList>

        <TabsContent value="photos" className="space-y-6">
          <MediaUploadZone reportId={reportId} type="photo" />
          <MediaGallery reportId={reportId} />
        </TabsContent>

        <TabsContent value="videos" className="space-y-6">
          <MediaUploadZone reportId={reportId} type="video" />
          <MediaGallery reportId={reportId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
