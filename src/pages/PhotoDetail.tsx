import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, Bookmark, Share2, ArrowRight, Tag, MessageCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Photo, ProductTag } from '@/types/inspiration';
import { getPublicImageUrl } from '@/utils/imageUrls';
import { SaveToIdeabookModal } from '@/components/inspiration/SaveToIdeabookModal';
import { useQuery } from '@tanstack/react-query';
import { supaSelect, supaSelectMaybe } from '@/lib/supaFetch';
import { PageBoundary } from '@/components/system/PageBoundary';


export default function PhotoDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showProductDetails, setShowProductDetails] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['photo', id, user?.id],
    enabled: !!id,
    queryFn: async ({ signal }) => {
      try {
        // Fetch photo details
        const photoData = await supaSelectMaybe(
          supabase
            .from('photos')
            .select(`
              id, title, description, room, style, storage_path, is_public, created_at, uploader_id, updated_at,
              photo_likes(user_id),
              photo_tags(tag)
            `)
            .eq('id', id!)
            .eq('is_public', true),
          { 
            signal,
            errorMessage: 'שגיאה בטעינת פרטי התמונה',
            timeoutMs: 10_000
          }
        );

        if (!photoData) {
          return null;
        }

        const processedPhoto = {
          ...(photoData as any),
          is_liked: user ? (photoData as any).photo_likes?.some((like: { user_id: string }) => like.user_id === user.id) : false,
          tags: (photoData as any).photo_tags?.map((tag: { tag: string }) => tag.tag) || []
        } as Photo;

        // Fetch product tags
        const productTags: ProductTag[] = await supaSelect(
          supabase
            .from('photo_products')
            .select(`
              id, photo_id, note, tag_position, created_at,
              products(id, name, price, currency),
              profiles!photo_products_supplier_id_fkey(id, full_name, email)
            `)
            .eq('photo_id', id!),
          { signal, timeoutMs: 10_000 }
        ).then(data => (data as any)?.map((tag: any) => ({
          ...tag,
          tag_position: tag.tag_position as { x: number; y: number },
          products: tag.products,
          profiles: tag.profiles
        })) || []);

        return {
          photo: processedPhoto,
          productTags
        };
      } catch (error: any) {
        // Handle missing tables gracefully
        if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
          return null;
        }
        throw error;
      }
    },
    retry: 1,
    staleTime: 60_000,
  });

  const photo = data?.photo || null;
  const productTags = data?.productTags || [];

  const toggleLike = async () => {
    if (!user || !photo) {
      toast.error('נדרש להתחבר כדי לסמן תמונות');
      return;
    }

    try {
      if (photo.is_liked) {
        await supabase
          .from('photo_likes')
          .delete()
          .eq('photo_id', photo.id)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('photo_likes')
          .insert({ photo_id: photo.id, user_id: user.id });
      }

      // TODO: Add queryClient.invalidateQueries(['photo', id, user?.id]);
      toast.success(photo.is_liked ? 'הוסר מהמועדפים' : 'נוסף למועדפים');
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('שגיאה בעדכון החיבוב');
    }
  };

  const saveToIdeabook = () => {
    if (!user || !photo) {
      toast.error('נדרש להתחבר כדי לשמור תמונות');
      return;
    }
    setShowSaveModal(true);
  };

  const sharePhoto = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: photo?.title,
          text: photo?.description,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('הקישור הועתק ללוח');
    }
  };

  const contactSupplier = (supplierId: string) => {
    // TODO: Open contact modal or navigate to messaging
    toast.success('פותח צ\'אט עם הספק...');
  };


  return (
    <PageBoundary 
      timeout={15000}
      fallback={
        <div className="min-h-screen bg-background p-4 pb-32 animate-pulse">
          <div className="container mx-auto max-w-4xl">
            <div className="aspect-video bg-muted rounded-lg mb-6" />
            <div className="h-8 bg-muted rounded mb-4" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        </div>
      }
    >
      {isLoading ? (
        <div className="min-h-screen bg-background p-4 pb-32 animate-pulse">
          <div className="container mx-auto max-w-4xl">
            <div className="aspect-video bg-muted rounded-lg mb-6" />
            <div className="h-8 bg-muted rounded mb-4" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        </div>
      ) : data === null ? (
        <div className="min-h-screen bg-background p-4 pb-32 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">התמונה לא נמצאה</h2>
            <Link to="/inspiration">
              <Button>חזור לגלריה</Button>
            </Link>
          </div>
        </div>
      ) : (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border p-4">
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/inspiration">
            <Button variant="ghost" size="sm">
              <ArrowRight className="h-4 w-4 ml-2" />
              חזור
            </Button>
          </Link>
          
          <div className="flex items-center gap-2">
            <Button
              variant={photo.is_liked ? "default" : "outline"}
              size="sm"
              onClick={toggleLike}
            >
              <Heart className={`h-4 w-4 ml-2 ${photo.is_liked ? 'fill-current' : ''}`} />
              {photo.is_liked ? 'אהבתי' : 'לייק'}
            </Button>
            
            <Button variant="outline" size="sm" onClick={saveToIdeabook}>
              <Bookmark className="h-4 w-4 ml-2" />
              שמור
            </Button>
            
            <Button variant="outline" size="sm" onClick={sharePhoto}>
              <Share2 className="h-4 w-4 ml-2" />
              שתף
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Photo */}
          <div className="lg:col-span-2">
            <div className="relative rounded-lg overflow-hidden bg-muted">
              <img
                src={getPublicImageUrl(photo.storage_path)}
                alt={photo.title}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              
              {/* Product Tags Overlay */}
              {productTags.map((tag) => (
                <button
                  key={tag.id}
                  className="absolute w-8 h-8 bg-primary rounded-full border-2 border-background shadow-lg flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
                  style={{
                    left: `${tag.tag_position.x}%`,
                    top: `${tag.tag_position.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                  onClick={() => setShowProductDetails(tag.id)}
                >
                  <Tag className="h-4 w-4 text-primary-foreground" />
                </button>
              ))}
            </div>
          </div>

          {/* Photo Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">{photo.title}</h1>
              {photo.description && (
                <p className="text-muted-foreground">{photo.description}</p>
              )}
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap gap-2">
              {photo.room && (
                <Badge variant="secondary">{photo.room}</Badge>
              )}
              {photo.style && (
                <Badge variant="secondary">{photo.style}</Badge>
              )}
              {photo.tags?.map((tag) => (
                <Badge key={tag} variant="outline">#{tag}</Badge>
              ))}
            </div>

            {/* Product Tags */}
            {productTags.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">מוצרים מתויגים</h3>
                <div className="space-y-3">
                  {productTags.map((tag) => (
                    <Card key={tag.id}>
                      <CardContent className="p-4">
                        {tag.products && (
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium">{tag.products.name}</h4>
                              {tag.products.price && (
                                <p className="text-sm text-muted-foreground">
                                  {tag.products.price.toLocaleString()} {tag.products.currency}
                                </p>
                              )}
                            </div>
                            <Link to={`/products/${tag.products.id}`}>
                              <Button size="sm" variant="outline">
                                <ExternalLink className="h-4 w-4 ml-2" />
                                צפה
                              </Button>
                            </Link>
                          </div>
                        )}
                        
                        {tag.note && (
                          <p className="text-sm text-muted-foreground mb-2">{tag.note}</p>
                        )}
                        
                        {tag.profiles && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm">
                              {tag.profiles.full_name || tag.profiles.email}
                            </span>
                            <Button
                              size="sm"
                              onClick={() => contactSupplier(tag.profiles!.id)}
                            >
                              <MessageCircle className="h-4 w-4 ml-2" />
                              צור קשר
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Related Photos */}
            <div>
              <h3 className="font-semibold mb-3">תמונות דומות</h3>
              <div className="grid grid-cols-2 gap-3">
                {/* TODO: Add related photos based on tags/style */}
                <div className="aspect-square bg-muted rounded-lg animate-pulse" />
                <div className="aspect-square bg-muted rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Modal */}
      <Dialog open={!!showProductDetails} onOpenChange={() => setShowProductDetails(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>פרטי מוצר</DialogTitle>
          </DialogHeader>
          {showProductDetails && (
            <div className="p-4">
              {/* Product details content */}
              <p>פרטי המוצר יוצגו כאן...</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Save to Ideabook Modal */}
      <SaveToIdeabookModal
        isOpen={showSaveModal}
        onOpenChange={setShowSaveModal}
        photoId={photo?.id || ''}
        photoTitle={photo?.title || ''}
      />
    </div>
      )}
    </PageBoundary>
  );
}