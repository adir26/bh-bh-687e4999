import { useState, Suspense, lazy } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, AlertCircle, Upload, Camera, Eye } from 'lucide-react';
import { getPublicImageUrl } from '@/utils/imageUrls';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const PhotoUploadModal = lazy(() => import('@/components/inspiration/PhotoUploadModal').then(m => ({ default: m.PhotoUploadModal })));

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
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [showUpload, setShowUpload] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null);

  // Get company_id for supplier
  const { data: company } = useQuery({
    queryKey: ['my-company', user?.id],
    enabled: !!user?.id && profile?.role === 'supplier',
    queryFn: async () => {
      const { data } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user!.id)
        .maybeSingle();
      return data;
    },
  });

  const { data: photos, isLoading, refetch } = useQuery({
    queryKey: ['my-photos', activeTab, user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      let query = supabase
        .from('photos')
        .select('*, photo_tags (tag)')
        .eq('uploader_id', user!.id)
        .order('created_at', { ascending: false });

      if (activeTab !== 'all') {
        query = query.eq('status', activeTab);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Photo[];
    },
  });

  const allPhotos = photos || [];
  const stats = {
    all: allPhotos.length,
    pending: allPhotos.filter(p => p.status === 'pending').length,
    approved: allPhotos.filter(p => p.status === 'approved').length,
    rejected: allPhotos.filter(p => p.status === 'rejected').length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge className="bg-amber-500 text-white border-0 text-xs"><Clock className="h-3 w-3 mr-1" />ממתין לאישור</Badge>;
      case 'approved': return <Badge className="bg-green-500 text-white border-0 text-xs"><CheckCircle className="h-3 w-3 mr-1" />מאושר</Badge>;
      case 'rejected': return <Badge variant="destructive" className="text-xs"><XCircle className="h-3 w-3 mr-1" />נדחה</Badge>;
      default: return null;
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 pt-[max(env(safe-area-inset-top),32px)] pb-nav-safe">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">התמונות שלי</h1>
            <p className="text-muted-foreground text-sm mt-1">
              נהל את התמונות שהעלאת לגלריית ההשראה
            </p>
          </div>
          <Button onClick={() => setShowUpload(true)} className="gap-2">
            <Camera className="h-4 w-4" />
            העלה תמונות חדשות
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'סה"כ', value: stats.all, color: 'text-foreground' },
            { label: 'ממתינות', value: stats.pending, color: 'text-amber-600' },
            { label: 'מאושרות', value: stats.approved, color: 'text-green-600' },
            { label: 'נדחו', value: stats.rejected, color: 'text-destructive' },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-4 text-center">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">הכל</TabsTrigger>
            <TabsTrigger value="pending">ממתינות</TabsTrigger>
            <TabsTrigger value="approved">מאושרות</TabsTrigger>
            <TabsTrigger value="rejected">נדחו</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3" />
                <p className="text-muted-foreground">טוען תמונות...</p>
              </div>
            ) : allPhotos.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">אין תמונות להצגה</h3>
                  <p className="text-muted-foreground text-sm mb-4 text-center max-w-xs">
                    העלה תמונות של הפרויקטים שלך כדי להופיע בגלריית ההשראה ולקבל חשיפה
                  </p>
                  <Button onClick={() => setShowUpload(true)}>
                    <Camera className="h-4 w-4 mr-2" />
                    העלה תמונה ראשונה
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {allPhotos.map((photo) => (
                  <Card key={photo.id} className="overflow-hidden group">
                    <div className="aspect-square relative bg-muted">
                      <img
                        src={getPublicImageUrl(photo.storage_path)}
                        alt={photo.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute top-2 right-2">{getStatusBadge(photo.status)}</div>
                      
                      {/* Preview overlay */}
                      <button
                        onClick={() => setPreviewPhoto(photo)}
                        className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center"
                      >
                        <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </div>
                    <CardContent className="p-3 space-y-2">
                      <h3 className="font-semibold text-sm line-clamp-1">{photo.title}</h3>
                      
                      <div className="flex flex-wrap gap-1">
                        {photo.room && <Badge variant="outline" className="text-xs py-0">{photo.room}</Badge>}
                        {photo.style && <Badge variant="outline" className="text-xs py-0">{photo.style}</Badge>}
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {format(new Date(photo.created_at), 'dd/MM/yyyy')}
                      </div>

                      {photo.rejection_reason && (
                        <div className="flex items-start gap-1.5 p-2 bg-destructive/10 rounded-md">
                          <AlertCircle className="h-3.5 w-3.5 text-destructive flex-shrink-0 mt-0.5" />
                          <div className="text-xs text-destructive">
                            <div className="font-medium mb-0.5">סיבת דחייה:</div>
                            <div className="line-clamp-2">{photo.rejection_reason}</div>
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

      {/* Upload Modal */}
      <Suspense fallback={null}>
        {showUpload && (
          <PhotoUploadModal
            isOpen={showUpload}
            onOpenChange={setShowUpload}
            onUploadComplete={() => refetch()}
            companyId={company?.id}
          />
        )}
      </Suspense>

      {/* Preview Dialog */}
      <Dialog open={!!previewPhoto} onOpenChange={() => setPreviewPhoto(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          {previewPhoto && (
            <div>
              <img
                src={getPublicImageUrl(previewPhoto.storage_path)}
                alt={previewPhoto.title}
                className="w-full max-h-[70vh] object-contain bg-black"
              />
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">{previewPhoto.title}</h3>
                  {getStatusBadge(previewPhoto.status)}
                </div>
                {previewPhoto.description && <p className="text-sm text-muted-foreground">{previewPhoto.description}</p>}
                <div className="flex flex-wrap gap-1">
                  {previewPhoto.room && <Badge variant="outline">{previewPhoto.room}</Badge>}
                  {previewPhoto.style && <Badge variant="outline">{previewPhoto.style}</Badge>}
                  {previewPhoto.photo_tags?.map((t, i) => <Badge key={i} variant="secondary">#{t.tag}</Badge>)}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
