import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePublicProduct, usePublicSupplier } from '@/hooks/usePublicSupplier';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Share2, 
  MessageCircle, 
  Star,
  CheckCircle,
  MapPin,
  Home,
  ChevronLeft,
  ChevronRight,
  Expand
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const PublicProductView: React.FC = () => {
  const { slug, productId } = useParams<{ slug: string; productId: string }>();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);

  const { data: product, isLoading: productLoading, error: productError } = usePublicProduct(productId!);
  const { data: supplier, isLoading: supplierLoading } = usePublicSupplier(slug!);

  const handleShare = async () => {
    const url = window.location.href;
    const title = `${product?.name} - ${supplier?.name}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: product?.description,
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
          description: "קישור המוצר הועתק ללוח",
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

  const nextImage = () => {
    if (product?.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === product.images!.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (product?.images && product.images.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? product.images!.length - 1 : prev - 1
      );
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (productLoading || supplierLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header Skeleton */}
        <div className="bg-card border-b">
          <div className="container max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center gap-2 animate-pulse">
              <div className="w-6 h-6 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-32"></div>
            </div>
          </div>
        </div>

        {/* Product Skeleton */}
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-muted rounded-lg animate-pulse"></div>
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-3/4 animate-pulse"></div>
              <div className="h-6 bg-muted rounded w-1/4 animate-pulse"></div>
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse"></div>
                <div className="h-4 bg-muted rounded w-5/6 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (productError || !product || !supplier) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">📦</div>
          <h1 className="text-2xl font-bold mb-2">מוצר לא נמצא</h1>
          <p className="text-muted-foreground mb-6">
            המוצר שחיפשת אינו קיים או שאינו זמין כרגע
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              חזרה
            </Button>
            <Button onClick={() => navigate('/')} className="gap-2">
              <Home className="w-4 h-4" />
              דף הבית
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Navigation Header */}
        <div className="bg-card border-b">
          <div className="container max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center gap-2 text-sm">
              <Link to={`/s/${supplier.slug}`} className="flex items-center gap-1 text-primary hover:underline">
                <ArrowLeft className="w-4 h-4" />
                {supplier.name}
              </Link>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground line-clamp-1">{product.name}</span>
            </div>
          </div>
        </div>

        <div className="container max-w-4xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Product Images */}
            <div className="space-y-4">
              {product.images && product.images.length > 0 ? (
                <>
                  <div className="relative group">
                    <div 
                      className="aspect-square overflow-hidden rounded-lg bg-card border cursor-pointer"
                      onClick={() => setShowImageModal(true)}
                    >
                      <img
                        src={product.images[currentImageIndex]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute top-3 right-3 bg-black/50 rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Expand className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    {product.images.length > 1 && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={prevImage}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-8 h-8 p-0 bg-background/80 backdrop-blur-sm"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={nextImage}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 p-0 bg-background/80 backdrop-blur-sm"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                        
                        {/* Image indicators */}
                        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2">
                          {product.images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`w-2 h-2 rounded-full transition-all ${
                                index === currentImageIndex
                                  ? 'bg-primary'
                                  : 'bg-white/50 hover:bg-white/70'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Thumbnail strip */}
                  {product.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto">
                      {product.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                            index === currentImageIndex
                              ? 'border-primary'
                              : 'border-transparent hover:border-muted-foreground'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${product.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-muted-foreground text-8xl">📦</div>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-3">{product.name}</h1>
                
                {product.price && (
                  <div className="text-3xl font-bold text-primary mb-4">
                    ₪{product.price.toLocaleString()}
                  </div>
                )}

                {product.category && (
                  <Badge variant="outline" className="mb-4">
                    {product.category.name}
                  </Badge>
                )}

                {product.description && (
                  <div className="prose prose-sm max-w-none">
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {product.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button size="lg" className="w-full gap-2">
                  <MessageCircle className="w-4 h-4" />
                  בקש הצעת מחיר
                </Button>
                
                <Button variant="outline" size="lg" onClick={handleShare} className="w-full gap-2">
                  <Share2 className="w-4 h-4" />
                  שתף מוצר
                </Button>
              </div>

              {/* Supplier Info Card */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {supplier.logo_url && (
                      <div className="relative">
                        <img
                          src={supplier.logo_url}
                          alt={supplier.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        {supplier.verified && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                            <CheckCircle className="w-3 h-3 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{supplier.name}</h3>
                        {supplier.verified && (
                          <CheckCircle className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {supplier.area && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {supplier.area}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1">
                          <div className="flex">{renderStars(Math.round(supplier.rating))}</div>
                          <span>{supplier.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <Link to={`/s/${supplier.slug}`}>
                          <Button variant="outline" size="sm" className="w-full">
                            צפה בכל המוצרים
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && product.images && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={product.images[currentImageIndex]}
              alt={product.name}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            
            {product.images.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 p-0 bg-background/80 backdrop-blur-sm"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 p-0 bg-background/80 backdrop-blur-sm"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 w-10 h-10 p-0 bg-background/80 backdrop-blur-sm"
            >
              ×
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default PublicProductView;