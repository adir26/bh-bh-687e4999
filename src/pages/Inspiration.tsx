import React, { useState, Suspense, lazy } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, Bookmark, Filter, Camera, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { Photo } from '@/types/inspiration';
import { getPublicImageUrl } from '@/utils/imageUrls';
import { FavoritesService } from '@/services/favoritesService';
import { supaSelect } from '@/lib/supaFetch';
import { PageBoundary } from '@/components/system/PageBoundary';

// Lazy load modals to avoid useAuth errors before AuthProvider is ready
const PhotoUploadModal = lazy(() => import('@/components/inspiration/PhotoUploadModal').then(m => ({ default: m.PhotoUploadModal })));
const SaveToIdeabookModal = lazy(() => import('@/components/inspiration/SaveToIdeabookModal').then(m => ({ default: m.SaveToIdeabookModal })));

const rooms = ['מטבח', 'סלון', 'חדר שינה', 'חדר אמבטיה', 'חדר ילדים', 'משרד', 'גינה'];
const styles = ['מודרני', 'קלאסי', 'כפרי', 'תעשייתי', 'סקנדינבי', 'מזרח תיכוני'];

export default function Inspiration() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [saveToIdeabookPhoto, setSaveToIdeabookPhoto] = useState<{ id: string; title: string } | null>(null);

  // Fetch photos with React Query
  const { data: photos = [], status, error, refetch } = useQuery({
    queryKey: ['inspiration-photos', { searchQuery, selectedRoom, selectedStyle, userId: user?.id }],
    queryFn: async ({ signal }) => {
      let query = supabase
        .from('photos')
        .select(`
          id, title, description, room, style, storage_path, is_public, created_at, uploader_id, updated_at,
          photo_likes(user_id),
          photo_tags(tag),
          photo_products(id)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (selectedRoom && selectedRoom !== 'all') {
        query = query.eq('room', selectedRoom);
      }

      if (selectedStyle && selectedStyle !== 'all') {
        query = query.eq('style', selectedStyle);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const data = await supaSelect<any[]>(query, {
        signal,
        errorMessage: 'שגיאה בטעינת התמונות'
      });

      return data?.map(photo => ({
        ...photo,
        likes: photo.photo_likes?.length || 0,
        is_liked: user ? photo.photo_likes?.some((like: { user_id: string }) => like.user_id === user.id) : false,
        tags: photo.photo_tags?.map((tag: { tag: string }) => tag.tag) || [],
        products_count: photo.photo_products?.length || 0
      })) as Photo[] || [];
    },
    enabled: true,
    staleTime: 60_000,
  });

  // Toggle like mutation
  const toggleLikeMutation = useMutation({
    mutationFn: async (photoId: string) => {
      if (!user) throw new Error('נדרש להתחבר כדי לסמן תמונות');
      return await FavoritesService.toggle('inspiration', photoId);
    },
    onSuccess: (isNowFavorited, photoId) => {
      // Optimistically update the UI
      queryClient.setQueryData(
        ['inspiration-photos', { searchQuery, selectedRoom, selectedStyle, userId: user?.id }], 
        (old: Photo[] | undefined) => {
          if (!old) return old;
          return old.map(p => 
            p.id === photoId 
              ? { 
                  ...p, 
                  is_liked: isNowFavorited, 
                  likes: isNowFavorited ? (p.likes || 0) + 1 : Math.max((p.likes || 0) - 1, 0)
                }
              : p
          );
        }
      );
      toast.success(isNowFavorited ? 'נוסף למועדפים' : 'הוסר מהמועדפים');
    },
    onError: (error) => {
      console.error('Error toggling like:', error);
      toast.error('שגיאה בעדכון החיבוב');
    }
  });

  const toggleLike = (photoId: string) => {
    if (!user) {
      toast.error('נדרש להתחבר כדי לסמן תמונות');
      return;
    }
    toggleLikeMutation.mutate(photoId);
  };

  const saveToIdeabook = (photo: Photo) => {
    if (!user) {
      toast.error('נדרש להתחבר כדי לשמור תמונות');
      return;
    }
    setSaveToIdeabookPhoto({ id: photo.id, title: photo.title });
  };

  const handleUploadClick = () => {
    if (!user) {
      toast.error('נדרש להתחבר כדי להעלות תמונות');
      return;
    }
    setShowUploadModal(true);
  };

  const handleUploadComplete = () => {
    // Invalidate and refetch photos after upload
    queryClient.invalidateQueries({ queryKey: ['inspiration-photos'] });
  };

  return (
    <PageBoundary 
      isLoading={status === 'pending'}
      isError={status === 'error'}
      error={error}
      onRetry={() => refetch()}
      isEmpty={photos.length === 0}
    >
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
            <Button size="sm" onClick={handleUploadClick}>
              <Camera className="h-4 w-4 ml-2" />
              העלה
            </Button>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                <SelectTrigger>
                  <SelectValue placeholder="חדר" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">כל החדרים</SelectItem>
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
                  <SelectItem value="all">כל הסגנונות</SelectItem>
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
                        src={getPublicImageUrl(photo.storage_path)}
                        alt={photo.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
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
                  {user && (
                    <div className="absolute bottom-2 left-2 right-2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button
                        size="sm"
                        variant={photo.is_liked ? "default" : "secondary"}
                        onClick={(e) => {
                          e.preventDefault();
                          toggleLike(photo.id);
                        }}
                        className="h-8 w-8 p-0"
                        disabled={toggleLikeMutation.isPending}
                      >
                        <Heart className={`h-4 w-4 ${photo.is_liked ? 'fill-current' : ''}`} />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.preventDefault();
                          saveToIdeabook(photo);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Bookmark className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

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

      {/* Modals - Lazy loaded with Suspense */}
      {user && (
        <Suspense fallback={null}>
          {showUploadModal && (
            <PhotoUploadModal
              isOpen={showUploadModal}
              onOpenChange={setShowUploadModal}
              onUploadComplete={handleUploadComplete}
            />
          )}

          {saveToIdeabookPhoto && (
            <SaveToIdeabookModal
              isOpen={!!saveToIdeabookPhoto}
              onOpenChange={(open) => !open && setSaveToIdeabookPhoto(null)}
              photoId={saveToIdeabookPhoto?.id || ''}
              photoTitle={saveToIdeabookPhoto?.title || ''}
            />
          )}
        </Suspense>
      )}
    </div>
    </PageBoundary>
  );
}