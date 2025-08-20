import React, { useState, useEffect } from 'react';
import { Check, X, Eye, Tag, Flag, MoreVertical, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface Photo {
  id: string;
  title: string;
  description?: string;
  storage_path: string;
  room?: string;
  style?: string;
  is_public: boolean;
  uploader_id: string;
  company_id?: string;
  created_at: string;
  profiles: {
    full_name?: string;
    email: string;
  };
  companies?: {
    name: string;
  };
  photo_tags: Array<{ tag: string }>;
  photo_products: Array<{ id: string }>;
  photo_likes: Array<{ id: string }>;
  reports?: Array<{
    id: string;
    reason: string;
    description?: string;
    created_at: string;
  }>;
}

export default function AdminInspiration() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const rooms = ['מטבח', 'סלון', 'חדר שינה', 'חדר אמבטיה', 'חדר ילדים', 'משרד', 'גינה'];

  useEffect(() => {
    fetchPhotos();
  }, [activeTab, searchQuery, selectedRoom]);

  const fetchPhotos = async () => {
    try {
      let query = supabase
        .from('photos')
        .select(`
          *,
          profiles!photos_uploader_id_fkey(full_name, email),
          companies(name),
          photo_tags(tag),
          photo_products(id),
          photo_likes(id)
        `)
        .order('created_at', { ascending: false });

      // Filter based on active tab
      if (activeTab === 'pending') {
        query = query.eq('is_public', false);
      } else if (activeTab === 'approved') {
        query = query.eq('is_public', true);
      }

      if (selectedRoom && selectedRoom !== 'all') {
        query = query.eq('room', selectedRoom);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error('Error fetching photos:', error);
      toast.error('שגיאה בטעינת התמונות');
    } finally {
      setLoading(false);
    }
  };

  const approvePhoto = async (photoId: string) => {
    try {
      const { error } = await supabase
        .from('photos')
        .update({ is_public: true })
        .eq('id', photoId);

      if (error) throw error;

      setPhotos(prev => prev.filter(p => p.id !== photoId));
      toast.success('התמונה אושרה ופורסמה');
    } catch (error) {
      console.error('Error approving photo:', error);
      toast.error('שגיאה באישור התמונה');
    }
  };

  const rejectPhoto = async (photoId: string) => {
    try {
      const { error } = await supabase
        .from('photos')
        .delete()
        .eq('id', photoId);

      if (error) throw error;

      setPhotos(prev => prev.filter(p => p.id !== photoId));
      toast.success('התמונה נדחתה ונמחקה');
    } catch (error) {
      console.error('Error rejecting photo:', error);
      toast.error('שגיאה בדחיית התמונה');
    }
  };

  const unpublishPhoto = async (photoId: string) => {
    try {
      const { error } = await supabase
        .from('photos')
        .update({ is_public: false })
        .eq('id', photoId);

      if (error) throw error;

      setPhotos(prev => prev.filter(p => p.id !== photoId));
      toast.success('התמונה הוסרה מהפרסום');
    } catch (error) {
      console.error('Error unpublishing photo:', error);
      toast.error('שגיאה בהסרת התמונה מהפרסום');
    }
  };

  const getImageUrl = (path: string) => {
    const { data } = supabase.storage.from('inspiration-photos').getPublicUrl(path);
    return data.publicUrl;
  };

  const getStatusBadge = (photo: Photo) => {
    if (photo.is_public) {
      return <Badge className="bg-green-100 text-green-800">מפורסם</Badge>;
    } else {
      return <Badge variant="secondary">ממתין לאישור</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">ניהול גלריית השראה</h1>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ניהול גלריית השראה</h1>
        <div className="flex items-center gap-4">
          <Input
            placeholder="חיפוש תמונות..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />
          <Select value={selectedRoom} onValueChange={setSelectedRoom}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="חדר" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל החדרים</SelectItem>
              {rooms.map(room => (
                <SelectItem key={room} value={room}>{room}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">ממתינות לאישור</TabsTrigger>
          <TabsTrigger value="approved">מפורסמות</TabsTrigger>
          <TabsTrigger value="reported">דווחו</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <Card key={photo.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-square relative">
                    <img
                      src={getImageUrl(photo.storage_path)}
                      alt={photo.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Quick Actions Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => approvePhoto(photo.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setSelectedPhoto(photo)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => rejectPhoto(photo.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-sm truncate flex-1">{photo.title}</h3>
                      {getStatusBadge(photo)}
                    </div>
                    
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>העלה על ידי: {photo.profiles.full_name || photo.profiles.email}</p>
                      {photo.companies && <p>חברה: {photo.companies.name}</p>}
                      <div className="flex items-center gap-2">
                        {photo.room && <span>{photo.room}</span>}
                        {photo.style && <span>• {photo.style}</span>}
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {photo.photo_products.length}
                        </span>
                        <span>❤️ {photo.photo_likes.length}</span>
                        <span>🏷️ {photo.photo_tags.length}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <Card key={photo.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-square relative group">
                    <img
                      src={getImageUrl(photo.storage_path)}
                      alt={photo.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Actions */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedPhoto(photo)}>
                            <Eye className="h-4 w-4 ml-2" />
                            צפה בפרטים
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/inspiration/photo/${photo.id}`}>
                              צפה בדף התמונה
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => unpublishPhoto(photo.id)}
                            className="text-destructive"
                          >
                            <X className="h-4 w-4 ml-2" />
                            הסר מהפרסום
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-sm truncate flex-1">{photo.title}</h3>
                      {getStatusBadge(photo)}
                    </div>
                    
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>העלה על ידי: {photo.profiles.full_name || photo.profiles.email}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          {photo.photo_products.length}
                        </span>
                        <span>❤️ {photo.photo_likes.length}</span>
                        <span>🏷️ {photo.photo_tags.length}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reported" className="space-y-4">
          <div className="text-center py-12">
            <Flag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">אין דיווחים חדשים</h3>
            <p className="text-muted-foreground">כל התמונות המדווחות יופיעו כאן</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Photo Details Modal */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>פרטי התמונה</DialogTitle>
          </DialogHeader>
          {selectedPhoto && (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <img
                  src={getImageUrl(selectedPhoto.storage_path)}
                  alt={selectedPhoto.title}
                  className="w-full rounded-lg"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedPhoto.title}</h3>
                  {selectedPhoto.description && (
                    <p className="text-muted-foreground mt-1">{selectedPhoto.description}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <p><strong>העלה על ידי:</strong> {selectedPhoto.profiles.full_name || selectedPhoto.profiles.email}</p>
                  {selectedPhoto.companies && (
                    <p><strong>חברה:</strong> {selectedPhoto.companies.name}</p>
                  )}
                  {selectedPhoto.room && <p><strong>חדר:</strong> {selectedPhoto.room}</p>}
                  {selectedPhoto.style && <p><strong>סגנון:</strong> {selectedPhoto.style}</p>}
                  <p><strong>תאריך העלאה:</strong> {new Date(selectedPhoto.created_at).toLocaleDateString('he-IL')}</p>
                </div>

                <div className="space-y-2">
                  <p><strong>סטטיסטיקות:</strong></p>
                  <div className="flex gap-4 text-sm">
                    <span>❤️ {selectedPhoto.photo_likes.length} לייקים</span>
                    <span>🏷️ {selectedPhoto.photo_tags.length} תגיות</span>
                    <span className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {selectedPhoto.photo_products.length} מוצרים
                    </span>
                  </div>
                </div>

                {selectedPhoto.photo_tags.length > 0 && (
                  <div>
                    <p className="font-medium mb-2">תגיות:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedPhoto.photo_tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline">#{tag.tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  {!selectedPhoto.is_public ? (
                    <>
                      <Button
                        onClick={() => {
                          approvePhoto(selectedPhoto.id);
                          setSelectedPhoto(null);
                        }}
                        className="flex-1"
                      >
                        <Check className="h-4 w-4 ml-2" />
                        אשר ופרסם
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          rejectPhoto(selectedPhoto.id);
                          setSelectedPhoto(null);
                        }}
                        className="flex-1"
                      >
                        <X className="h-4 w-4 ml-2" />
                        דחה
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="destructive"
                      onClick={() => {
                        unpublishPhoto(selectedPhoto.id);
                        setSelectedPhoto(null);
                      }}
                      className="flex-1"
                    >
                      <X className="h-4 w-4 ml-2" />
                      הסר מהפרסום
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}