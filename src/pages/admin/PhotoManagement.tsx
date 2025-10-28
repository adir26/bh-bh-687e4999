import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, Image as ImageIcon, Edit, AlertCircle } from 'lucide-react';
import { getPublicImageUrl } from '@/utils/imageUrls';
import { format } from 'date-fns';

interface Photo {
  id: string;
  title: string;
  description?: string;
  storage_path: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  uploader_id: string;
  room?: string;
  style?: string;
  reviewed_at?: string;
  reviewed_by?: string;
  rejection_reason?: string;
  profiles?: {
    full_name?: string;
    email: string;
  };
  photo_tags?: Array<{ tag: string }>;
}

export default function PhotoManagement() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const { data: photos, isLoading } = useQuery({
    queryKey: ['admin-photos', activeTab],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('photos')
        .select(`
          *,
          profiles:uploader_id (
            full_name,
            email
          ),
          photo_tags (tag)
        `)
        .eq('status', activeTab)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Photo[];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (photoId: string) => {
      const { error } = await supabase
        .from('photos')
        .update({
          status: 'approved',
          is_public: true,
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', photoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-photos'] });
      queryClient.invalidateQueries({ queryKey: ['photos'] });
      toast({
        title: 'התמונה אושרה',
        description: 'התמונה עכשיו גלויה בגלריה הציבורית',
      });
    },
    onError: () => {
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לאשר את התמונה',
        variant: 'destructive',
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ photoId, reason }: { photoId: string; reason: string }) => {
      const { error } = await supabase
        .from('photos')
        .update({
          status: 'rejected',
          is_public: false,
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: reason,
        })
        .eq('id', photoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-photos'] });
      setRejectDialogOpen(false);
      setRejectionReason('');
      setSelectedPhoto(null);
      toast({
        title: 'התמונה נדחתה',
        description: 'הסיבה נשלחה למעלה',
      });
    },
    onError: () => {
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לדחות את התמונה',
        variant: 'destructive',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ photoId, title, description }: { photoId: string; title: string; description?: string }) => {
      const { error } = await supabase
        .from('photos')
        .update({ title, description })
        .eq('id', photoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-photos'] });
      setEditDialogOpen(false);
      setSelectedPhoto(null);
      toast({
        title: 'התמונה עודכנה',
        description: 'השינויים נשמרו בהצלחה',
      });
    },
    onError: () => {
      toast({
        title: 'שגיאה',
        description: 'לא ניתן לעדכן את התמונה',
        variant: 'destructive',
      });
    },
  });

  const handleReject = (photo: Photo) => {
    setSelectedPhoto(photo);
    setRejectDialogOpen(true);
  };

  const handleEdit = (photo: Photo) => {
    setSelectedPhoto(photo);
    setEditTitle(photo.title);
    setEditDescription(photo.description || '');
    setEditDialogOpen(true);
  };

  const stats = {
    pending: photos?.filter((p) => p.status === 'pending').length || 0,
    approved: photos?.filter((p) => p.status === 'approved').length || 0,
    rejected: photos?.filter((p) => p.status === 'rejected').length || 0,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">ניהול גלריית השראה</h1>
          <p className="text-muted-foreground mt-2">
            אישור ודחייה של תמונות שהועלו על ידי משתמשים
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ממתינות לאישור</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">מאושרות</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">נדחו</CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rejected}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">
              ממתינות ({stats.pending})
            </TabsTrigger>
            <TabsTrigger value="approved">
              מאושרות ({stats.approved})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              נדחו ({stats.rejected})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">טוען תמונות...</p>
              </div>
            ) : !photos || photos.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">אין תמונות בקטגוריה זו</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {photos.map((photo) => (
                  <Card key={photo.id} className="overflow-hidden">
                    <div className="aspect-video relative bg-muted">
                      <img
                        src={getPublicImageUrl(photo.storage_path)}
                        alt={photo.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        {photo.status === 'pending' && (
                          <Badge variant="secondary" className="bg-warning text-warning-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            ממתין
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
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{photo.title}</h3>
                        {photo.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
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
                        {photo.photo_tags?.map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {tag.tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">מעלה:</span>
                          <span>{photo.profiles?.full_name || photo.profiles?.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">תאריך:</span>
                          <span>
                            {format(new Date(photo.created_at), 'dd/MM/yyyy HH:mm')}
                          </span>
                        </div>
                        {photo.rejection_reason && (
                          <div className="flex items-start gap-1 text-destructive">
                            <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            <span className="text-xs">{photo.rejection_reason}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2">
                        {photo.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="default"
                              className="flex-1"
                              onClick={() => approveMutation.mutate(photo.id)}
                              disabled={approveMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              אשר
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(photo)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(photo)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {photo.status === 'approved' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            onClick={() => handleEdit(photo)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            ערוך
                          </Button>
                        )}
                        {photo.status === 'rejected' && (
                          <Button
                            size="sm"
                            variant="default"
                            className="w-full"
                            onClick={() => approveMutation.mutate(photo.id)}
                            disabled={approveMutation.isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            אשר בכל זאת
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>דחיית תמונה</DialogTitle>
            <DialogDescription>
              אנא ציין את הסיבה לדחייה. הסיבה תישלח למעלה התמונה.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">סיבת דחייה</Label>
              <Textarea
                id="reason"
                placeholder="לדוגמה: התמונה לא ברורה, תוכן לא מתאים, איכות נמוכה..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectionReason('');
                setSelectedPhoto(null);
              }}
            >
              ביטול
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedPhoto && rejectionReason.trim()) {
                  rejectMutation.mutate({
                    photoId: selectedPhoto.id,
                    reason: rejectionReason.trim(),
                  });
                }
              }}
              disabled={!rejectionReason.trim() || rejectMutation.isPending}
            >
              דחה תמונה
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>עריכת תמונה</DialogTitle>
            <DialogDescription>
              ערוך את הפרטים של התמונה לפני או אחרי אישור
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">כותרת</Label>
              <Input
                id="title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="כותרת התמונה"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">תיאור</Label>
              <Textarea
                id="description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="תיאור התמונה"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditDialogOpen(false);
                setSelectedPhoto(null);
              }}
            >
              ביטול
            </Button>
            <Button
              onClick={() => {
                if (selectedPhoto && editTitle.trim()) {
                  updateMutation.mutate({
                    photoId: selectedPhoto.id,
                    title: editTitle.trim(),
                    description: editDescription.trim() || undefined,
                  });
                }
              }}
              disabled={!editTitle.trim() || updateMutation.isPending}
            >
              שמור שינויים
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
