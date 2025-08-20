import React, { useState, useEffect } from 'react';
import { Heart, Bookmark, Filter, Grid, Camera, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface Photo {
  id: string;
  title: string;
  description?: string;
  storage_path: string;
  room?: string;
  style?: string;
  width?: number;
  height?: number;
  uploader_id: string;
  company_id?: string;
  created_at: string;
  likes?: number;
  is_liked?: boolean;
  tags?: string[];
  products_count?: number;
}

export default function Inspiration() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const rooms = ['מטבח', 'סלון', 'חדר שינה', 'חדר אמבטיה', 'חדר ילדים', 'משרד', 'גינה'];
  const styles = ['מודרני', 'קלאסי', 'כפרי', 'תעשייתי', 'סקנדינבי', 'מזרח תיכוני'];

  useEffect(() => {
    fetchPhotos();
  }, [searchQuery, selectedRoom, selectedStyle]);

  const fetchPhotos = async () => {
    try {
      let query = supabase
        .from('photos')
        .select(`
          *,
          photo_likes(id),
          photo_tags(tag),
          photo_products(id)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (selectedRoom) {
        query = query.eq('room', selectedRoom);
      }

      if (selectedStyle) {
        query = query.eq('style', selectedStyle);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      const processedPhotos = data?.map(photo => ({
        ...photo,
        likes: photo.photo_likes?.length || 0,
        is_liked: user ? photo.photo_likes?.some((like: any) => like.user_id === user.id) : false,
        tags: photo.photo_tags?.map((tag: any) => tag.tag) || [],
        products_count: photo.photo_products?.length || 0
      })) || [];

      setPhotos(processedPhotos);
    } catch (error) {
      console.error('Error fetching photos:', error);
      toast.error('שגיאה בטעינת התמונות');
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (photoId: string) => {
    if (!user) {
      toast.error('נדרש להתחבר כדי לסמן תמונות');
      return;
    }

    try {
      const photo = photos.find(p => p.id === photoId);
      if (!photo) return;

      if (photo.is_liked) {
        await supabase
          .from('photo_likes')
          .delete()
          .eq('photo_id', photoId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('photo_likes')
          .insert({ photo_id: photoId, user_id: user.id });
      }

      setPhotos(prev => prev.map(p => 
        p.id === photoId 
          ? { 
              ...p, 
              is_liked: !p.is_liked, 
              likes: p.is_liked ? p.likes! - 1 : p.likes! + 1 
            }
          : p
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('שגיאה בעדכון החיבוב');
    }
  };

  const saveToIdeabook = (photoId: string) => {
    if (!user) {
      toast.error('נדרש להתחבר כדי לשמור תמונות');
      return;
    }
    // TODO: Open save to ideabook modal
    toast.success('נשמר לאידאבוק ✨');
  };

  const getImageUrl = (path: string) => {
    const { data } = supabase.storage.from('inspiration-photos').getPublicUrl(path);
    return data.publicUrl;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 pb-32">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-2xl font-bold">גלריית השראה</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="mr-auto"
            >
              <Filter className="h-4 w-4 ml-2" />
              סינון
            </Button>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="חיפוש תמונות..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Link to="/inspiration/upload">
              <Button size="sm">
                <Camera className="h-4 w-4 ml-2" />
                העלה
              </Button>
            </Link>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                <SelectTrigger>
                  <SelectValue placeholder="חדר" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">כל החדרים</SelectItem>
                  {rooms.map(room => (
                    <SelectItem key={room} value={room}>{room}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                <SelectTrigger>
                  <SelectValue placeholder="סגנון" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">כל הסגנונות</SelectItem>
                  {styles.map(style => (
                    <SelectItem key={style} value={style}>{style}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Photo Grid */}
      <div className="container mx-auto px-4 py-6">
        {photos.length === 0 ? (
          <div className="text-center py-12">
            <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">אין תמונות להצגה</h3>
            <p className="text-muted-foreground">נסה לשנות את הסינון או להעלות תמונות חדשות</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <Card key={photo.id} className="group overflow-hidden">
                <CardContent className="p-0 relative">
                  <Link to={`/inspiration/photo/${photo.id}`}>
                    <div className="aspect-square relative overflow-hidden">
                      <img
                        src={getImageUrl(photo.storage_path)}
                        alt={photo.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                      
                      {/* Tags indicator */}
                      {(photo.tags!.length > 0 || photo.products_count! > 0) && (
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary" className="text-xs">
                            {photo.products_count! > 0 && (
                              <Tag className="h-3 w-3 ml-1" />
                            )}
                            {photo.tags!.length > 0 && `${photo.tags!.length} תגיות`}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Action Buttons */}
                  <div className="absolute bottom-2 left-2 right-2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      size="sm"
                      variant={photo.is_liked ? "default" : "secondary"}
                      onClick={(e) => {
                        e.preventDefault();
                        toggleLike(photo.id);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Heart className={`h-4 w-4 ${photo.is_liked ? 'fill-current' : ''}`} />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        e.preventDefault();
                        saveToIdeabook(photo.id);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Bookmark className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Photo Info */}
                  <div className="p-3">
                    <h3 className="font-medium text-sm truncate">{photo.title}</h3>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {photo.room && <span>{photo.room}</span>}
                        {photo.style && <span>• {photo.style}</span>}
                      </div>
                      {photo.likes! > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {photo.likes} ❤️
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}