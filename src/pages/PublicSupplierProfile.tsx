import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePublicSupplier, usePublicSupplierProducts, useSupplierCategories } from '@/hooks/usePublicSupplier';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ContactSupplierForm } from '@/components/supplier/ContactSupplierForm';
import { 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Search, 
  Share2, 
  Heart,
  CheckCircle,
  ArrowRight,
  Home,
  ArrowLeft
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const PublicSupplierProfile: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: supplier, isLoading: supplierLoading, error: supplierError } = usePublicSupplier(slug!);
const { data: categoriesData } = useSupplierCategories(supplier?.id || '', supplier?.owner_id);
const { data: productsData, isLoading: productsLoading } = usePublicSupplierProducts(
  supplier?.id || '',
  {
    page: currentPage,
    search: searchQuery || undefined,
    categoryId: selectedCategory || undefined,
    ownerId: supplier?.owner_id,
  }
);

  // Track profile view when supplier data loads
  useEffect(() => {
    if (supplier?.id) {
      // Track profile view - fire and forget
      const trackView = async () => {
        try {
          await supabase.rpc('track_profile_view', { p_company_id: supplier.id });
          console.log('[PROFILE_VIEW] Tracked view for company:', supplier.id);
        } catch (err) {
          console.warn('[PROFILE_VIEW] Failed to track view:', err);
        }
      };
      trackView();
    }
  }, [supplier?.id]);

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: supplier?.name,
          text: supplier?.description,
          url,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "הקישור הועתק",
          description: "קישור הספק הועתק ללוח",
        });
      } catch (error) {
        toast({
          title: "שגיאה",
          description: "לא ניתן להעתיק את הקישור",
          variant: "destructive",
        });
      }
    }
  };

  if (supplierLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header Skeleton */}
        <div className="bg-card border-b">
          <div className="container max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center gap-4 animate-pulse">
              <div className="w-20 h-20 rounded-full bg-muted"></div>
              <div className="flex-1">
                <div className="h-6 bg-muted rounded w-48 mb-2"></div>
                <div className="h-4 bg-muted rounded w-64"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Products Grid Skeleton */}
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-square bg-muted rounded-t-lg"></div>
                <CardContent className="p-3">
                  <div className="h-4 bg-muted rounded w-full mb-2"></div>
                  <div className="h-3 bg-muted rounded w-20"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (supplierError || !supplier) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">🏪</div>
          <h1 className="text-2xl font-bold mb-2">ספק לא נמצא</h1>
          <p className="text-muted-foreground mb-6">
            הספק שחיפשת אינו קיים או שאינו זמין כרגע
          </p>
          <Button onClick={() => navigate('/')} className="gap-2">
            <Home className="w-4 h-4" />
            חזרה לדף הבית
          </Button>
        </div>
      </div>
    );
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header Bar */}
      <div className="sticky top-0 z-10 bg-card border-b px-4 py-3 flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowRight className="w-5 h-5" />
        </Button>
        <h1 className="text-sm font-medium">פרופיל ספק</h1>
        <div className="w-10" />
      </div>

      {/* Company Header - Centered with Large Logo */}
      <div className="bg-card px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          {/* Logo */}
          {supplier.logo_url && (
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-background shadow-lg">
                <img
                  src={supplier.logo_url}
                  alt={supplier.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {supplier.verified && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center border-2 border-background">
                  <CheckCircle className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </div>
          )}

          {/* Company Name */}
          <h2 className="text-2xl font-bold mb-2">{supplier.name}</h2>

          {/* Rating */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="flex">{renderStars(Math.round(supplier.rating))}</div>
            <span className="font-medium">{supplier.rating.toFixed(1)}</span>
          </div>

          {/* Review Count & Price Range */}
          <div className="text-sm text-muted-foreground mb-6">
            מבוסס על {supplier.review_count} ביקורות | טווח מחירים: 50,000₪-200,000₪
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <Button variant="outline" className="flex-1 gap-2">
              <Heart className="w-4 h-4" />
              שמור ספק
            </Button>
            <Button className="flex-1 gap-2">
              בקשת הצעת מחיר
            </Button>
          </div>
        </div>
      </div>

      {/* About Section */}
      {supplier.description && (
        <div className="px-4 py-6 border-t">
          <h3 className="text-lg font-bold mb-3">באונר</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {supplier.description}
          </p>
        </div>
      )}

      {/* Products Section */}
      {productsData?.products && productsData.products.length > 0 && (
        <div className="px-4 py-6 border-t">
          <h3 className="text-lg font-bold mb-4">המוצרים שלנו</h3>
          
          {/* Product Tabs */}
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            <Button
              variant={selectedCategory === '' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('')}
              className="whitespace-nowrap rounded-full"
            >
              כולם
            </Button>
            {categoriesData && categoriesData.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="whitespace-nowrap rounded-full"
              >
                {category.name}
              </Button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 gap-3">
            {productsData.products.slice(0, 4).map((product) => (
              <Link
                key={product.id}
                to={`/s/${supplier.slug}/p/${product.id}`}
                className="group"
              >
                <Card className="overflow-hidden">
                  {product.primaryImage || (product.images && product.images.length > 0) ? (
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={product.primaryImage || product.images![0]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square bg-muted flex items-center justify-center">
                      <div className="text-muted-foreground text-3xl">📦</div>
                    </div>
                  )}
                  <CardContent className="p-3">
                    <h4 className="font-medium text-sm line-clamp-1 mb-1">{product.name}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {product.category?.name || 'כללי'}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Gallery Section */}
      {supplier.gallery && supplier.gallery.length > 0 && (
        <div className="px-4 py-6 border-t">
          <h3 className="text-lg font-bold mb-4">גלריה</h3>
          <div className="grid grid-cols-2 gap-3">
            {supplier.gallery.slice(0, 4).map((imageUrl, index) => (
              <div key={index} className="aspect-square rounded-lg overflow-hidden">
                <img 
                  src={imageUrl} 
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Services Section */}
      {supplier.services && supplier.services.length > 0 && (
        <div className="px-4 py-6 border-t">
          <h3 className="text-lg font-bold mb-4">בחלק זה קח שאתנו נושאים</h3>
          <div className="space-y-3">
            {supplier.services.map((service, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium">{service}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pricing Section */}
      <div className="px-4 py-6 border-t">
        <h3 className="text-lg font-bold mb-3">מחירים</h3>
        <p className="text-sm text-muted-foreground mb-4">
          המחירים משתנים בקשיקים ל לקידום, זמן החודרת, מהומת עמכו וכן המוצרי וגמלותנו
        </p>
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <p className="text-2xl font-bold">50,000₪-200,000₪</p>
            <p className="text-xs text-muted-foreground mt-1">לפרויקט בינוני שמתעקלקות מפרט משקללות</p>
          </div>
        </div>
      </div>

      {/* Reviews Section - Placeholder */}
      <div className="px-4 py-6 border-t">
        <h3 className="text-lg font-bold mb-4">אנחנו רשמתם</h3>
        <div className="space-y-4">
          {/* Sample Review 1 */}
          <div className="p-4 rounded-lg bg-muted/30">
            <div className="flex items-start gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium">NC</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Noa Cohen</p>
                <p className="text-xs text-muted-foreground">3 months ago</p>
              </div>
            </div>
            <div className="flex mb-2">{renderStars(5)}</div>
            <p className="text-sm text-muted-foreground">
              Elite Kitchens transformed my kitchen into a dream space! Their attention to detail and professionalism were outstanding.
            </p>
          </div>

          {/* Sample Review 2 */}
          <div className="p-4 rounded-lg bg-muted/30">
            <div className="flex items-start gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium">AL</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Avi Levi</p>
                <p className="text-xs text-muted-foreground">3 months ago</p>
              </div>
            </div>
            <div className="flex mb-2">{renderStars(4)}</div>
            <p className="text-sm text-muted-foreground">
              Great service and quality work. Minor delays but overall satisfied.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Form Section */}
      <div className="px-4 py-6 border-t bg-muted/30">
        <ContactSupplierForm 
          companyId={supplier.id}
          companyName={supplier.name}
          supplierId={supplier.owner_id}
        />
      </div>

      {/* Bottom Action Bar */}
      <div className="sticky bottom-0 bg-card border-t px-4 py-3 flex gap-3">
        <Button variant="outline" className="flex-1 gap-2">
          <Heart className="w-4 h-4" />
          שמור ספק
        </Button>
        <Button className="flex-1">
          בקשת פגישה
        </Button>
      </div>

      {/* Full Products List (Hidden by default, shown after products section) */}
      <div className="container max-w-6xl mx-auto px-4 py-8 hidden">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="חפש מוצרים..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
          
          {categoriesData && categoriesData.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button
                variant={selectedCategory === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('')}
                className="whitespace-nowrap"
              >
                הכל
              </Button>
              {categoriesData.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="whitespace-nowrap"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Products Grid */}
        {productsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-square bg-muted rounded-t-lg"></div>
                <CardContent className="p-3">
                  <div className="h-4 bg-muted rounded w-full mb-2"></div>
                  <div className="h-3 bg-muted rounded w-20"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {productsData?.products && productsData.products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {productsData.products.map((product) => (
                    <Link
                      key={product.id}
                      to={`/s/${supplier.slug}/p/${product.id}`}
                      className="group"
                    >
                      <Card className="mobile-card h-full transition-transform group-hover:scale-[1.02]">
                        {product.primaryImage ? (
                          <div className="aspect-square overflow-hidden rounded-t-lg">
                            <img
                              src={product.primaryImage}
                              alt={product.name}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                          </div>
                        ) : product.images && product.images.length > 0 ? (
                          <div className="aspect-square overflow-hidden rounded-t-lg">
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                          </div>
                        ) : (
                          <div className="aspect-square bg-muted rounded-t-lg flex items-center justify-center">
                            <div className="text-muted-foreground text-4xl">📦</div>
                          </div>
                        )}
                        
                        <CardContent className="p-3">
                          <h3 className="font-medium text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                            {product.name}
                          </h3>
                          
                          {product.price && (
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-primary">
                                ₪{product.price.toLocaleString()}
                              </span>
                              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>

                {/* Load More */}
                {productsData.hasMore && (
                  <div className="text-center mt-8">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      className="gap-2"
                    >
                      טען עוד מוצרים
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold mb-2">אין מוצרים להצגה</h3>
                <p className="text-muted-foreground">
                  {searchQuery || selectedCategory 
                    ? 'לא נמצאו מוצרים העונים על החיפוש' 
                    : 'הספק עדיין לא הוסיף מוצרים לקטלוג'
                  }
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PublicSupplierProfile;