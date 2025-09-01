
import React, { useState } from 'react';
import { Heart, Star, Phone, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FavoritesService, GroupedFavorites } from '@/services/favoritesService';
import { getPublicImageUrl } from '@/utils/imageUrls';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageBoundary } from '@/components/system/PageBoundary';

const Favorites = () => {
  const [activeTab, setActiveTab] = useState('suppliers');
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: favorites, status, error } = useQuery({
    queryKey: ['favorites', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      try {
        return await FavoritesService.listByUser(user!.id);
      } catch (error) {
        console.error('Error fetching favorites:', error);
        // Return empty state for missing tables
        return {
          suppliers: [],
          products: [],
          inspirations: [],
          ideabooks: []
        };
      }
    },
    retry: 1,
    staleTime: 60_000,
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async ({ entityType, entityId }: { entityType: string; entityId: string }) => {
      await FavoritesService.toggle(entityType as any, entityId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
      toast({
        title: "הוסר מהמועדפים",
        description: "הפריט הוסר בהצלחה מהמועדפים שלך",
      });
    },
    onError: (error) => {
      console.error('Error removing favorite:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן להסיר את הפריט מהמועדפים",
        variant: "destructive",
      });
    }
  });

  const handleRemoveFavorite = (entityType: string, entityId: string) => {
    if (!user?.id) return;
    removeFavoriteMutation.mutate({ entityType, entityId });
  };

  const tabs = [
    { id: 'suppliers', label: 'ספקים', count: favorites?.suppliers?.length || 0 },
    { id: 'products', label: 'שירותים', count: favorites?.products?.length || 0 },
    { id: 'inspirations', label: 'השראה', count: favorites?.inspirations?.length || 0 }
  ];

  if (status === 'pending') {
    return (
      <PageBoundary>
        <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            <span className="text-muted-foreground">טוען מועדפים...</span>
          </div>
        </div>
      </PageBoundary>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" dir="rtl">
        <div className="text-center p-6">
          <h3 className="text-lg font-semibold mb-2">שגיאה בטעינת המועדפים</h3>
          <p className="text-muted-foreground mb-4">לא ניתן לטעון את המועדפים כרגע</p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] })}>
            נסה שוב
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="max-w-md mx-auto bg-background pb-nav-safe">
        {/* Header */}
        <div className="bg-background border-b border-border px-6 py-6">
          <h1 className="text-2xl font-bold text-foreground text-right">המועדפים שלי</h1>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="bg-background border-b border-border px-6 py-2">
            <TabsList className="grid w-full grid-cols-3 h-12 bg-muted/50">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="rounded-xl text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {tab.label} ({tab.count})
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Content */}
          <div className="flex-1 px-6 py-6">
            <TabsContent value="suppliers" className="mt-0">
              <div className="space-y-4">
                {favorites?.suppliers && favorites.suppliers.length > 0 ? (
                  favorites.suppliers.map((favorite) => (
                    <Card key={favorite.id} className="relative border-0 shadow-sm rounded-xl bg-card">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-3 left-3 z-10 bg-background/80 hover:bg-background rounded-xl h-10 w-10"
                        onClick={() => handleRemoveFavorite('supplier', favorite.entity_id)}
                      >
                        <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                      </Button>

                      <CardHeader className="pb-3">
                        <div className="flex gap-4">
                          <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center">
                            <span className="text-2xl font-bold text-muted-foreground">
                              {favorite.supplier_data?.full_name?.charAt(0) || '?'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg text-right text-foreground font-semibold">
                              {favorite.supplier_data?.full_name || 'ספק'}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground text-right mt-1">ספק</p>
                            <div className="flex items-center gap-1 mt-2 justify-end">
                              <span className="text-sm text-muted-foreground">(0)</span>
                              <span className="text-sm font-medium text-foreground">0.0</span>
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <div className="flex gap-3">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 rounded-xl h-11"
                            onClick={() => window.open(`mailto:${favorite.supplier_data?.email}`, '_self')}
                          >
                            <Phone className="w-4 h-4 ml-2" />
                            צור קשר
                          </Button>
                          <Button size="sm" className="flex-1 rounded-xl h-11">
                            צפה בפרופיל
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Heart className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">אין ספקים מועדפים</h3>
                    <p className="text-muted-foreground">התחל לחפש ולשמור ספקים שאהבת</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="products" className="mt-0">
              <div className="space-y-4">
                {favorites?.products && favorites.products.length > 0 ? (
                  favorites.products.map((favorite) => (
                    <Card key={favorite.id} className="relative border-0 shadow-sm rounded-xl bg-card">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-3 left-3 z-10 bg-background/80 hover:bg-background rounded-xl h-10 w-10"
                        onClick={() => handleRemoveFavorite('product', favorite.entity_id)}
                      >
                        <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                      </Button>

                      <CardContent className="p-5">
                        <div className="flex gap-4">
                          <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center">
                            <span className="text-xs font-medium text-muted-foreground text-center p-2">
                              {favorite.product_data?.name?.substring(0, 10) || 'מוצר'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-right mb-2 text-foreground text-lg">
                              {favorite.product_data?.name || 'מוצר'}
                            </h3>
                            <p className="text-sm text-muted-foreground text-right mb-3">
                              {favorite.product_data?.supplier_id || 'ספק לא ידוע'}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-medium text-foreground">0.0</span>
                              </div>
                              <span className="font-bold text-primary text-lg">
                                {favorite.product_data?.price ? `₪${favorite.product_data.price}` : 'מחיר לא זמין'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button className="w-full mt-4 rounded-xl h-11">
                          הזמן עכשיו
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Heart className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">אין שירותים מועדפים</h3>
                    <p className="text-muted-foreground">התחל לחפש ולשמור שירותים שאהבת</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="inspirations" className="mt-0">
              <div className="grid grid-cols-2 gap-4">
                {favorites?.inspirations && favorites.inspirations.length > 0 ? (
                  favorites.inspirations.map((favorite) => (
                    <Card key={favorite.id} className="relative border-0 shadow-sm rounded-xl bg-card overflow-hidden">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 left-2 z-10 bg-background/80 hover:bg-background rounded-xl h-8 w-8"
                        onClick={() => handleRemoveFavorite('inspiration', favorite.entity_id)}
                      >
                        <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                      </Button>

                      {favorite.photo_data?.storage_path ? (
                        <img
                          src={getPublicImageUrl(favorite.photo_data.storage_path)}
                          alt={favorite.photo_data.title || 'השראה'}
                          className="w-full h-32 object-cover"
                        />
                      ) : (
                        <div className="w-full h-32 bg-muted flex items-center justify-center">
                          <Image className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}

                      <CardContent className="p-3">
                        <h3 className="font-medium text-right text-sm text-foreground line-clamp-2">
                          {favorite.photo_data?.title || 'תמונת השראה'}
                        </h3>
                        {(favorite.photo_data?.room || favorite.photo_data?.style) && (
                          <div className="flex gap-1 mt-2 justify-end">
                            {favorite.photo_data.room && (
                              <span className="px-2 py-1 bg-muted text-xs rounded-full text-muted-foreground">
                                {favorite.photo_data.room}
                              </span>
                            )}
                            {favorite.photo_data.style && (
                              <span className="px-2 py-1 bg-muted text-xs rounded-full text-muted-foreground">
                                {favorite.photo_data.style}
                              </span>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-16">
                    <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Image className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">אין תמונות השראה מועדפות</h3>
                    <p className="text-muted-foreground">התחל לחפש ולשמור תמונות השראה שאהבת</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Favorites;
