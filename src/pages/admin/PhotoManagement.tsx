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
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, Image as ImageIcon, Edit, AlertCircle, ZoomIn, CheckCheck } from 'lucide-react';
import { getPublicImageUrl } from '@/utils/imageUrls';
import { format } from 'date-fns';

interface Photo {
  id: string;
  title: string;
  description?: string;
  storage_path: string;
  room?: string;
  style?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at?: string;
  rejection_reason?: string;
  width?: number;
  height?: number;
  company_id?: string;
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
  const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', photoId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-photos'] });
      toast({ title: 'התמונה אושרה', description: 'התמונה תופיע בגלריית ההשראה' });
    },
    onError: () => {
      toast({ title: 'שגיאה', description: 'לא ניתן לאשר את התמונה', variant: 'destructive' });
    },
  });

  const bulkApproveMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('photos')
        .update({
          status: 'approved',
          is_public: true,
          reviewed_at: new Date().toISOString(),
        })
        .in('id', ids);
      if (error) throw error;
    },
    onSuccess: (_, ids) => {
      queryClient.invalidateQueries({ queryKey: ['admin-photos'] });
      setSelectedIds(new Set());
      toast({ title: `${ids.length} תמונות אושרו`, description: 'התמונות יופיעו בגלריה' });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ photoId, reason }: { photoId: string; reason: string }) => {
      const { error } = await supabase
        .from('photos')
        .update({
          status: 'rejected',
          is_public: false,
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
      toast({ title: 'התמונה נדחתה' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ photoId, title, description }: { photoId: string; title: string; description?: string }) => {
      const { error } = await supabase.from('photos').update({ title, description }).eq('id', photoId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-photos'] });
      setEditDialogOpen(false);
      setSelectedPhoto(null);
      toast({ title: 'התמונה עודכנה' });
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

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (!photos) return;
    if (selectedIds.size === photos.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(photos.map(p => p.id)));
    }
  };

  const pendingCount = photos?.filter((p) => p.status === 'pending').length || 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">ניהול גלריית השראה</h1>
            <p className="text-muted-foreground mt-1">
              אישור, דחייה ועריכת תמונות שהועלו על ידי משתמשים וספקים
            </p>
          </div>
          {activeTab === 'pending' && selectedIds.size > 0 && (
            <Button 
              onClick={() => bulkApproveMutation.mutate(Array.from(selectedIds))}
              disabled={bulkApproveMutation.isPending}
              className="gap-2"
            >
              <CheckCheck className="h-4 w-4" />
              אשר {selectedIds.size} תמונות
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('pending')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">ממתינות לאישור</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('approved')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">מאושרות</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{photos?.filter(p => p.status === 'approved').length || 0}</div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('rejected')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">נדחו</CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{photos?.filter(p => p.status === 'rejected').length || 0}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as typeof activeTab); setSelectedIds(new Set()); }}>
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="pending">ממתינות</TabsTrigger>
              <TabsTrigger value="approved">מאושרות</TabsTrigger>
              <TabsTrigger value="rejected">נדחו</TabsTrigger>
            </TabsList>

            {activeTab === 'pending' && photos && photos.length > 0 && (
              <Button variant="outline" size="sm" onClick={selectAll} className="gap-2">
                <Checkbox checked={selectedIds.size === photos.length && photos.length > 0} />
                בחר הכל
              </Button>
            )}
          </div>

          <TabsContent value={activeTab} className="mt-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3" />
                <p className="text-muted-foreground">טוען תמונות...</p>
              </div>
            ) : !photos || photos.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground font-medium">אין תמונות {activeTab === 'pending' ? 'ממתינות' : activeTab === 'approved' ? 'מאושרות' : 'שנדחו'}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {photos.map((photo) => (
                  <Card key={photo.id} className={`overflow-hidden transition-all ${selectedIds.has(photo.id) ? 'ring-2 ring-primary' : ''}`}>
                    <div className="aspect-square relative bg-muted group">
                      <img
                        src={getPublicImageUrl(photo.storage_path)}
                        alt={photo.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      
                      {/* Selection checkbox */}
                      {activeTab === 'pending' && (
                        <div className="absolute top-2 left-2 z-10">
                          <Checkbox
                            checked={selectedIds.has(photo.id)}
                            onCheckedChange={() => toggleSelect(photo.id)}
                            className="bg-background/80 border-2"
                          />
                        </div>
                      )}

                      {/* Preview button */}
                      <button
                        onClick={() => setPreviewPhoto(photo)}
                        className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center"
                      >
                        <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>

                      {/* Status badge */}
                      <div className="absolute top-2 right-2">
                        {photo.status === 'pending' && (
                          <Badge className="bg-amber-500 text-white border-0">
                            <Clock className="h-3 w-3 mr-1" />ממתין
                          </Badge>
                        )}
                        {photo.status === 'approved' && (
                          <Badge className="bg-green-500 text-white border-0">
                            <CheckCircle className="h-3 w-3 mr-1" />מאושר
                          </Badge>
                        )}
                        {photo.status === 'rejected' && (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />נדחה
                          </Badge>
                        )}
                      </div>
                    </div>

                    <CardContent className="p-3 space-y-2">
                      <h3 className="font-semibold text-sm line-clamp-1">{photo.title}</h3>

                      <div className="flex flex-wrap gap-1">
                        {photo.room && <Badge variant="outline" className="text-xs py-0">{photo.room}</Badge>}
                        {photo.style && <Badge variant="outline" className="text-xs py-0">{photo.style}</Badge>}
                      </div>

                      <div className="text-xs text-muted-foreground">
                        <span>{photo.profiles?.full_name || photo.profiles?.email || 'לא ידוע'}</span>
                        <span className="mx-1">•</span>
                        <span>{format(new Date(photo.created_at), 'dd/MM/yy')}</span>
                        {photo.company_id && (
                          <>
                            <span className="mx-1">•</span>
                            <Badge variant="secondary" className="text-[10px] py-0 px-1">ספק</Badge>
                          </>
                        )}
                      </div>

                      {photo.rejection_reason && (
                        <div className="flex items-start gap-1 p-1.5 bg-destructive/10 rounded text-xs text-destructive">
                          <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">{photo.rejection_reason}</span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-1.5 pt-1">
                        {photo.status === 'pending' && (
                          <>
                            <Button size="sm" className="flex-1 h-8 text-xs" onClick={() => approveMutation.mutate(photo.id)} disabled={approveMutation.isPending}>
                              <CheckCircle className="h-3 w-3 mr-1" />אשר
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => handleEdit(photo)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="destructive" className="h-8 w-8 p-0" onClick={() => handleReject(photo)}>
                              <XCircle className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                        {photo.status === 'approved' && (
                          <Button size="sm" variant="outline" className="w-full h-8 text-xs" onClick={() => handleEdit(photo)}>
                            <Edit className="h-3 w-3 mr-1" />ערוך
                          </Button>
                        )}
                        {photo.status === 'rejected' && (
                          <Button size="sm" variant="outline" className="w-full h-8 text-xs" onClick={() => approveMutation.mutate(photo.id)} disabled={approveMutation.isPending}>
                            <CheckCircle className="h-3 w-3 mr-1" />אשר בכל זאת
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

      {/* Full Image Preview */}
      <Dialog open={!!previewPhoto} onOpenChange={() => setPreviewPhoto(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          {previewPhoto && (
            <div>
              <img
                src={getPublicImageUrl(previewPhoto.storage_path)}
                alt={previewPhoto.title}
                className="w-full max-h-[70vh] object-contain bg-black"
              />
              <div className="p-4 space-y-2">
                <h3 className="font-bold text-lg">{previewPhoto.title}</h3>
                {previewPhoto.description && <p className="text-sm text-muted-foreground">{previewPhoto.description}</p>}
                <div className="flex flex-wrap gap-2">
                  {previewPhoto.room && <Badge variant="outline">{previewPhoto.room}</Badge>}
                  {previewPhoto.style && <Badge variant="outline">{previewPhoto.style}</Badge>}
                  {previewPhoto.photo_tags?.map((t, i) => <Badge key={i} variant="secondary">#{t.tag}</Badge>)}
                </div>
                <p className="text-xs text-muted-foreground">
                  מעלה: {previewPhoto.profiles?.full_name || previewPhoto.profiles?.email} • 
                  {previewPhoto.width && previewPhoto.height && ` ${previewPhoto.width}×${previewPhoto.height} • `}
                  {format(new Date(previewPhoto.created_at), 'dd/MM/yyyy HH:mm')}
                </p>
                {previewPhoto.status === 'pending' && (
                  <div className="flex gap-2 pt-2">
                    <Button className="flex-1" onClick={() => { approveMutation.mutate(previewPhoto.id); setPreviewPhoto(null); }}>
                      <CheckCircle className="h-4 w-4 mr-2" />אשר
                    </Button>
                    <Button variant="destructive" onClick={() => { handleReject(previewPhoto); setPreviewPhoto(null); }}>
                      <XCircle className="h-4 w-4 mr-2" />דחה
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>דחיית תמונה</DialogTitle>
            <DialogDescription>ציין סיבה לדחייה. הסיבה תישלח למעלה.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Quick reasons */}
            <div className="flex flex-wrap gap-2">
              {['איכות תמונה נמוכה', 'תוכן לא מתאים', 'תמונה כפולה', 'הפרת זכויות יוצרים'].map(reason => (
                <Badge
                  key={reason}
                  variant={rejectionReason === reason ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setRejectionReason(reason)}
                >
                  {reason}
                </Badge>
              ))}
            </div>
            <Textarea
              placeholder="סיבה מפורטת..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRejectDialogOpen(false); setRejectionReason(''); }}>ביטול</Button>
            <Button
              variant="destructive"
              onClick={() => selectedPhoto && rejectionReason.trim() && rejectMutation.mutate({ photoId: selectedPhoto.id, reason: rejectionReason.trim() })}
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
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>כותרת</Label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>תיאור</Label>
              <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>ביטול</Button>
            <Button
              onClick={() => selectedPhoto && editTitle.trim() && updateMutation.mutate({ photoId: selectedPhoto.id, title: editTitle.trim(), description: editDescription.trim() || undefined })}
              disabled={!editTitle.trim() || updateMutation.isPending}
            >
              שמור
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
