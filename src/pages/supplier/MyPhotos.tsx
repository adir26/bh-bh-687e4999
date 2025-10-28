import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, AlertCircle, Upload } from 'lucide-react';
import { getPublicImageUrl } from '@/utils/imageUrls';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Photo {
  id: string;
  title: string;
  description?: string;
  storage_path: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  room?: string;
  style?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  photo_tags?: Array<{ tag: string }>;
}

export default function MyPhotos() {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const { data: photos, isLoading } = useQuery({
    queryKey: ['my-photos', activeTab],
    queryFn: async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');

      let query = supabase
        .from('photos')
        .select(`
          *,
          photo_tags (tag)
        `)
        .eq('uploader_id', user.id)
        .order('created_at', { ascending: false });

      if (activeTab !== 'all') {
        query = query.eq('status', activeTab);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Photo[];
    },
  });

  const stats = {
    all: photos?.length || 0,
    pending: photos?.filter((p) => p.status === 'pending').length || 0,
    approved: photos?.filter((p) => p.status === 'approved').length || 0,
    rejected: photos?.filter((p) => p.status === 'rejected').length || 0,
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">התמונות שלי</h1>
            <p className="text-muted-foreground mt-2">
              כל התמונות שהעלאת לגלריית ההשראה
            </p>
          </div>
          <Button onClick={() => window.location.href = '/inspiration'}>
            <Upload className="h-4 w-4 mr-2" />
            העלה תמונה חדשה
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.all}</div>
              <div className="text-sm text-muted-foreground">סה"כ תמונות</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-warning">{stats.pending}</div>
              <div className="text-sm text-muted-foreground">ממתינות</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-success">{stats.approved}</div>
              <div className="text-sm text-muted-foreground">מאושרות</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-destructive">{stats.rejected}</div>
              <div className="text-sm text-muted-foreground">נדחו</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">הכל ({stats.all})</TabsTrigger>
            <TabsTrigger value="pending">ממתינות ({stats.pending})</TabsTrigger>
            <TabsTrigger value="approved">מאושרות ({stats.approved})</TabsTrigger>
            <TabsTrigger value="rejected">נדחו ({stats.rejected})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">טוען תמונות...</p>
              </div>
            ) : !photos || photos.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">אין תמונות להצגה</p>
                  <Button onClick={() => window.location.href = '/inspiration'}>
                    העלה תמונה ראשונה
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {photos.map((photo) => (
                  <Card key={photo.id} className="overflow-hidden">
                    <div className="aspect-square relative bg-muted">
                      <img
                        src={getPublicImageUrl(photo.storage_path)}
                        alt={photo.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        {photo.status === 'pending' && (
                          <Badge variant="secondary" className="bg-warning text-warning-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            ממתין לאישור
                          </Badge>
                        )}
                        {photo.status === 'approved' && (
                          <Badge variant="secondary" className="bg-success text-success-foreground">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            מאושר
                          </Badge>
                        )}
                        {photo.status === 'rejected' && (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            נדחה
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-4 space-y-2">
                      <div>
                        <h3 className="font-semibold line-clamp-1">{photo.title}</h3>
                        {photo.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {photo.description}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {photo.room && (
                          <Badge variant="outline" className="text-xs">
                            {photo.room}
                          </Badge>
                        )}
                        {photo.style && (
                          <Badge variant="outline" className="text-xs">
                            {photo.style}
                          </Badge>
                        )}
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {format(new Date(photo.created_at), 'dd/MM/yyyy')}
                      </div>

                      {photo.rejection_reason && (
                        <div className="flex items-start gap-2 p-2 bg-destructive/10 rounded-md">
                          <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                          <div className="text-xs text-destructive">
                            <div className="font-medium mb-1">סיבת דחייה:</div>
                            <div>{photo.rejection_reason}</div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
