import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePublicSupplier, usePublicSupplierProducts, useSupplierCategories } from '@/hooks/usePublicSupplier';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Search, 
  Share2, 
  MessageCircle,
  CheckCircle,
  ArrowRight,
  Home
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const PublicSupplierProfile: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: supplier, isLoading: supplierLoading, error: supplierError } = usePublicSupplier(slug!);
  const { data: categoriesData } = useSupplierCategories(supplier?.id || '');
  const { data: productsData, isLoading: productsLoading } = usePublicSupplierProducts(
    supplier?.id || '',
    {
      page: currentPage,
      search: searchQuery || undefined,
      categoryId: selectedCategory || undefined,
    }
  );

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
      {/* Header Section */}
      <div className="bg-card border-b">
        <div className="container max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Company Info */}
            <div className="flex items-start gap-4 flex-1">
              {supplier.logo_url && (
                <div className="relative">
                  <img
                    src={supplier.logo_url}
                    alt={supplier.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-primary/10"
                  />
                  {supplier.verified && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                      {supplier.name}
                      {supplier.verified && (
                        <Badge variant="secondary" className="gap-1">
                          <CheckCircle className="w-3 h-3" />
                          מאומת
                        </Badge>
                      )}
                    </h1>
                    
                    {supplier.description && (
                      <p className="text-muted-foreground mt-1 max-w-2xl">
                        {supplier.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      {supplier.area && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {supplier.area}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <div className="flex">{renderStars(Math.round(supplier.rating))}</div>
                        <span className="font-medium text-foreground">{supplier.rating.toFixed(1)}</span>
                        <span>({supplier.review_count} ביקורות)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Button variant="outline" size="sm" onClick={handleShare} className="gap-2 flex-1 md:flex-none">
                <Share2 className="w-4 h-4" />
                שתף
              </Button>
              
              <Button className="gap-2 flex-1 md:flex-none">
                <MessageCircle className="w-4 h-4" />
                צור קשר
              </Button>
            </div>
          </div>

          {/* Contact Info */}
          {(supplier.phone || supplier.email || supplier.website) && (
            <div className="mt-6 pt-6 border-t">
              <div className="flex flex-wrap gap-6 text-sm">
                {supplier.phone && (
                  <a href={`tel:${supplier.phone}`} className="flex items-center gap-2 text-primary hover:underline">
                    <Phone className="w-4 h-4" />
                    {supplier.phone}
                  </a>
                )}
                
                {supplier.email && (
                  <a href={`mailto:${supplier.email}`} className="flex items-center gap-2 text-primary hover:underline">
                    <Mail className="w-4 h-4" />
                    {supplier.email}
                  </a>
                )}
                
                {supplier.website && (
                  <a 
                    href={supplier.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <Globe className="w-4 h-4" />
                    אתר האינטרנט
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Products Section */}
      <div className="container max-w-6xl mx-auto px-4 py-8">
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
                        {product.images && product.images.length > 0 ? (
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