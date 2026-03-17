import React, { useState, useEffect } from 'react';
import { SEO } from '@/components/SEO';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePublicSupplier, usePublicSupplierProducts, useSupplierCategories } from '@/hooks/usePublicSupplier';
import { useSupplierPhotos } from '@/hooks/useSupplierPhotos';
import { supabase } from '@/integrations/supabase/client';
import { getPublicImageUrl } from '@/utils/imageUrls';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ContactSupplierForm } from '@/components/supplier/ContactSupplierForm';
import { ReviewForm } from '@/components/supplier/ReviewForm';
import { useCompanyReviews } from '@/hooks/useCompanyReviews';
import { FavoritesService } from '@/services/favoritesService';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';
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
  ArrowLeft,
  Calendar,
  MessageCircle,
  Quote,
  Clock,
  Instagram,
  Facebook
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ScheduleMeetingModal } from '@/components/modals/ScheduleMeetingModal';
import { useQueryClient } from '@tanstack/react-query';

const PublicSupplierProfile: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isScheduleMeetingOpen, setIsScheduleMeetingOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

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
  const { data: reviews = [], refetch: refetchReviews } = useCompanyReviews(supplier?.id || '');
  const { data: inspirationPhotos = [] } = useSupplierPhotos(supplier?.id);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

  // Check if favorited
  useEffect(() => {
    const checkFavorite = async () => {
      if (supplier?.id && userId) {
        const favorited = await FavoritesService.isFavorited('supplier', supplier.id, userId);
        setIsFavorited(favorited);
      }
    };
    checkFavorite();
  }, [supplier?.id, userId]);

  // Track profile view when supplier data loads
  useEffect(() => {
    if (supplier?.id) {
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

  const handleToggleFavorite = async () => {
    if (!userId) {
      toast({
        title: "נדרשת התחברות",
        description: "יש להתחבר כדי לשמור ספקים",
        variant: "destructive",
      });
      return;
    }

    if (!supplier?.id) return;

    try {
      const newState = await FavoritesService.toggle('supplier', supplier.id);
      setIsFavorited(newState);
      queryClient.invalidateQueries({ queryKey: ['favorites', userId] });
      toast({
        title: newState ? "הספק נשמר" : "הספק הוסר",
        description: newState ? "הספק נוסף למועדפים שלך" : "הספק הוסר מהמועדפים",
      });
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את הספק כרגע",
        variant: "destructive",
      });
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Build share URL using custom domain
    const shareUrl = `https://bh-bonimpo.com/s/${slug}`;
    
    // Try native share first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: supplier?.name || 'ספק',
          text: supplier?.description || '',
          url: shareUrl,
        });
        return;
      } catch (error: any) {
        // User cancelled or not supported - fall through to clipboard
        if (error?.name === 'AbortError') return;
      }
    }
    
    // Fallback to clipboard
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        // Fallback for non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      toast({
        title: "הקישור הועתק",
        description: "קישור הספק הועתק ללוח",
      });
    } catch (error) {
      console.error('Share failed:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן להעתיק את הקישור",
        variant: "destructive",
      });
    }
  };

  // Get "Why Choose Us" items from supplier data - only show if supplier has added items
  const supplierAny = supplier as any;
  const whyChooseUsItems = (Array.isArray(supplierAny?.why_choose_us) && supplierAny.why_choose_us.length > 0)
    ? supplierAny.why_choose_us
    : [];

  // Normalize phone to E.164 format with Israel country code
  const normalizePhoneToE164 = (phone: string): string => {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('972')) return digits;
    if (digits.startsWith('0')) return '972' + digits.slice(1);
    return '972' + digits;
  };

  if (supplierLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Hero Skeleton */}
        <div className="relative h-[50vh] bg-muted animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        </div>
        {/* Content Skeleton */}
        <div className="container max-w-4xl mx-auto px-4 -mt-24 relative z-10">
          <div className="bg-card rounded-2xl p-6 shadow-xl animate-pulse">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-24 h-24 rounded-full bg-muted"></div>
              <div className="flex-1">
                <div className="h-8 bg-muted rounded w-48 mb-2"></div>
                <div className="h-4 bg-muted rounded w-64"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (supplierError || !supplier) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <img src={emptySupplierImg} alt="ספק לא נמצא" className="w-40 h-40 mx-auto mb-4 object-contain" />
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
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <SEO 
        title={supplier.name}
        description={supplier.description || `${supplier.name} – ספק מוביל בתחום הבנייה והעיצוב בישראל. צפו בפרויקטים, קראו חוות דעת וצרו קשר`}
        canonical={slug ? `/s/${slug}` : `/supplier/${supplier.id}`}
        ogType="profile"
        ogImage={supplier.banner_url || supplier.logo_url || undefined}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: supplier.name,
          description: supplier.description || '',
          image: supplier.logo_url || '',
          address: supplier.address ? { '@type': 'PostalAddress', streetAddress: supplier.address } : undefined,
          telephone: supplier.phone || undefined,
          email: supplier.email || undefined,
          url: supplier.website || `https://bh-bh.lovable.app/s/${slug}`,
          aggregateRating: supplier.rating ? {
            '@type': 'AggregateRating',
            ratingValue: supplier.rating,
            reviewCount: supplier.review_count || 0
          } : undefined
        }}
      />
      {/* Hero Section with Banner */}
      <section className="relative h-[45vh] min-h-[320px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          {supplier.banner_url ? (
            <img 
              src={supplier.banner_url} 
              alt={supplier.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary via-primary/80 to-primary/60" />
          )}
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-background" />
        </div>

        {/* Navigation Bar */}
        <div className="absolute top-0 left-0 right-0 z-20 pt-[max(env(safe-area-inset-top),12px)]">
          <div className="flex items-center justify-between px-4 py-3">
            <Button 
              variant="ghost" 
              size="icon"
              className="bg-white/20 backdrop-blur-md text-white hover:bg-white/30 rounded-full"
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate('/');
                }
              }}
            >
              <ArrowRight className="w-5 h-5" />
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                type="button"
                className="bg-white/20 backdrop-blur-md text-white hover:bg-white/30 rounded-full"
                onClick={(e) => handleShare(e)}
              >
                <Share2 className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className={`bg-white/20 backdrop-blur-md hover:bg-white/30 rounded-full ${isFavorited ? 'text-red-500' : 'text-white'}`}
                onClick={handleToggleFavorite}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Company Info Card - Overlapping Hero */}
      <div className="container max-w-4xl mx-auto px-4 -mt-28 relative z-10">
        <div className="bg-card rounded-2xl p-6 shadow-xl border">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-start">
            {/* Logo */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 rounded-xl overflow-hidden border-4 border-background shadow-lg bg-muted">
                {supplier.logo_url ? (
                  <img
                    src={supplier.logo_url}
                    alt={supplier.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-muted-foreground">
                    {supplier.name.slice(0, 2)}
                  </div>
                )}
              </div>
              {supplier.verified && (
                <div className="absolute -bottom-1 -left-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center border-2 border-background">
                  <CheckCircle className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-2xl font-bold truncate">{supplier.name}</h1>
                {supplier.verified && (
                  <Badge variant="secondary" className="text-xs">מאומת</Badge>
                )}
              </div>

              {supplier.tagline && (
                <p className="text-muted-foreground text-sm mb-2 line-clamp-1">{supplier.tagline}</p>
              )}

              {/* Rating Row */}
              <div className="flex items-center justify-center sm:justify-start gap-3 mb-3">
                <div className="flex items-center gap-1">
                  <div className="flex">{renderStars(Math.round(supplier.rating))}</div>
                  <span className="font-semibold text-sm">{supplier.rating.toFixed(1)}</span>
                </div>
                <span className="text-muted-foreground text-xs">
                  ({supplier.review_count} ביקורות)
                </span>
              </div>

              {/* Location */}
              {(supplier.city || supplier.area) && (
                <div className="flex items-center justify-center sm:justify-start gap-1 text-muted-foreground text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{[supplier.city, supplier.area].filter(Boolean).join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Button 
              variant="outline" 
              className="flex-1 gap-2 rounded-xl h-12"
              onClick={handleToggleFavorite}
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current text-red-500' : ''}`} />
              {isFavorited ? 'נשמר' : 'שמור'}
            </Button>
            <Button 
              className="flex-1 gap-2 rounded-xl h-12"
              onClick={() => setIsScheduleMeetingOpen(true)}
            >
              <Calendar className="w-4 h-4" />
              בקשת פגישה
            </Button>
          </div>
        </div>
      </div>

      {/* About Section */}
      {(supplier.about_text || supplier.description) && (
        <section className="container max-w-4xl mx-auto px-4 py-8">
          <h2 className="text-xl font-bold mb-4">אודות</h2>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {supplier.about_text || supplier.description}
          </p>
        </section>
      )}

      {/* Services Section - Compact Design */}
      {supplier.services && supplier.services.length > 0 && (
        <section className="container max-w-4xl mx-auto px-4 py-8">
          <h2 className="text-xl font-bold mb-4">השירותים שלנו</h2>
          <div className="flex flex-wrap gap-2">
            {supplier.services.map((service: any, index: number) => {
              const serviceName = typeof service === 'string' ? service : service.name;
              
              return (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className="px-4 py-2 text-sm font-medium bg-primary/10 text-primary border-0 hover:bg-primary/20 transition-colors"
                >
                  {serviceName}
                </Badge>
              );
            })}
          </div>
        </section>
      )}

      {/* Why Choose Us Section - Only show if supplier has added items */}
      {whyChooseUsItems.length > 0 && (
        <section className="container max-w-4xl mx-auto px-4 py-8">
          <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-secondary/5 rounded-2xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-6 text-primary">למה לבחור דווקא בנו?</h2>
            <div className="space-y-4">
              {whyChooseUsItems.map((item: string, index: number) => (
                <div 
                  key={index}
                  className="flex items-center gap-4 bg-card/80 backdrop-blur-sm rounded-xl p-4 transition-all hover:bg-card"
                >
                  <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <p className="font-medium text-foreground">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Business Hours Section */}
      {(supplier as any).business_hours && Object.keys((supplier as any).business_hours).length > 0 && (
        <section className="container max-w-4xl mx-auto px-4 py-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            שעות פעילות
          </h2>
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(() => {
                  const dayNames: Record<string, string> = {
                    sunday: 'ראשון',
                    monday: 'שני',
                    tuesday: 'שלישי',
                    wednesday: 'רביעי',
                    thursday: 'חמישי',
                    friday: 'שישי',
                    saturday: 'שבת',
                  };
                  const hours = (supplier as any).business_hours as Record<string, { open: string; close: string; closed?: boolean }>;
                  const daysOrder = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                  
                  return daysOrder.map((day) => {
                    const dayHours = hours[day];
                    if (!dayHours) return null;
                    
                    return (
                      <div key={day} className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg">
                        <span className="font-medium">{dayNames[day]}</span>
                        {dayHours.closed ? (
                          <span className="text-muted-foreground text-sm">סגור</span>
                        ) : (
                          <span className="text-sm text-muted-foreground" dir="ltr">
                            {dayHours.open} - {dayHours.close}
                          </span>
                        )}
                      </div>
                    );
                  }).filter(Boolean);
                })()}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Social Links Section */}
      {(() => {
        const socialLinks = (supplier as any).social_links || {};
        const hasLinks = socialLinks.instagram || socialLinks.facebook || socialLinks.tiktok || supplier.website;
        
        if (!hasLinks) return null;
        
        return (
          <section className="container max-w-4xl mx-auto px-4 py-8">
            <h2 className="text-xl font-bold mb-4">עקבו אחרינו</h2>
            <div className="flex flex-wrap gap-3">
              {socialLinks.instagram && (
                <a 
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 transition-opacity"
                >
                  <Instagram className="w-5 h-5" />
                  <span className="font-medium">אינסטגרם</span>
                </a>
              )}
              {socialLinks.facebook && (
                <a 
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white hover:opacity-90 transition-opacity"
                >
                  <Facebook className="w-5 h-5" />
                  <span className="font-medium">פייסבוק</span>
                </a>
              )}
              {socialLinks.tiktok && (
                <a 
                  href={socialLinks.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white hover:opacity-90 transition-opacity"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                  <span className="font-medium">טיקטוק</span>
                </a>
              )}
              {supplier.website && (
                <a 
                  href={supplier.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  <Globe className="w-5 h-5" />
                  <span className="font-medium">אתר</span>
                </a>
              )}
            </div>
          </section>
        );
      })()}

      {/* Products Section - Enhanced */}
      {productsData?.products && productsData.products.length > 0 && (
        <section className="py-8 bg-muted/30">
          <div className="container max-w-4xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">קטלוג מוצרים</h2>
              {productsData.totalCount > 0 && (
                <Badge variant="secondary" className="gap-1">
                  {productsData.totalCount} מוצרים
                </Badge>
              )}
            </div>
            
            {/* Category Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
              <Button
                variant={selectedCategory === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('')}
                className="whitespace-nowrap rounded-full"
              >
                הכל
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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {productsData.products.slice(0, 6).map((product) => (
                <Link
                  key={product.id}
                  to={`/s/${supplier.slug}/p/${product.id}`}
                  className="group"
                >
                  <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    {product.primaryImage || (product.images && product.images.length > 0) ? (
                      <div className="aspect-square overflow-hidden">
                        <img
                          src={product.primaryImage || product.images![0]}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                    ) : (
                      <div className="aspect-square bg-muted flex items-center justify-center">
                        <div className="text-muted-foreground text-3xl">📦</div>
                      </div>
                    )}
                    <CardContent className="p-3">
                      <h4 className="font-medium text-sm line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {product.category?.name || 'כללי'}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* View Full Catalog */}
            {productsData.totalCount > 6 && (
              <Button 
                variant="outline" 
                className="w-full gap-2 mt-6 rounded-xl h-12"
                onClick={() => navigate(`/s/${supplier.slug}/catalog`)}
              >
                צפה בקטלוג המלא ({productsData.totalCount} מוצרים)
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
          </div>
        </section>
      )}

      {/* Gallery Section */}
      {((supplier.gallery && supplier.gallery.length > 0) || inspirationPhotos.length > 0) && (
        <section className="container max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">גלריית עבודות</h2>
            <span className="text-sm text-muted-foreground">
              {(supplier.gallery?.length || 0) + inspirationPhotos.length} תמונות
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {supplier.gallery?.map((imageUrl, index) => (
              <div 
                key={`gallery-${index}`} 
                className="aspect-square rounded-xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-lg transition-all"
                onClick={() => window.open(imageUrl, '_blank')}
              >
                <img 
                  src={imageUrl} 
                  alt={`תמונת גלריה ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            ))}
            
            {inspirationPhotos.map((photo) => (
              <Link
                key={`photo-${photo.id}`}
                to={`/inspiration/${photo.id}`}
                className="aspect-square rounded-xl overflow-hidden group cursor-pointer relative shadow-sm hover:shadow-lg transition-all"
              >
                <img 
                  src={getPublicImageUrl(photo.storage_path)} 
                  alt={photo.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {photo.title && (
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs font-medium line-clamp-1">{photo.title}</p>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Reviews Section - Enhanced */}
      <section className="py-8 bg-muted/30">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">ביקורות</h2>
            <Badge variant="secondary">{reviews.length} ביקורות</Badge>
          </div>
          
          {reviews.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {reviews.map((review) => (
                <div 
                  key={review.id} 
                  className="relative p-5 rounded-2xl bg-card border transition-all hover:shadow-md"
                >
                  {/* Quote Icon */}
                  <Quote className="absolute top-4 left-4 w-10 h-10 text-primary/10" />
                  
                  {/* Review Content */}
                  <div className="relative z-10">
                    <div className="flex mb-3">{renderStars(review.rating)}</div>
                    
                    {review.content && (
                      <p className="text-muted-foreground mb-4 leading-relaxed italic">
                        "{review.content}"
                      </p>
                    )}
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {review.reviewer_name?.slice(0, 2).toUpperCase() || '??'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{review.reviewer_name || 'משתמש'}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(review.created_at), { 
                            addSuffix: true, 
                            locale: he 
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card rounded-2xl border">
              <div className="text-4xl mb-3">💬</div>
              <p className="font-medium mb-1">עדיין אין ביקורות</p>
              <p className="text-sm text-muted-foreground">היו הראשונים לשתף את החוויה שלכם</p>
            </div>
          )}
        </div>
      </section>

      {/* Add Review Form */}
      <section className="container max-w-4xl mx-auto px-4 py-8">
        <ReviewForm 
          companyId={supplier.id}
          onReviewSubmitted={refetchReviews}
        />
      </section>

      {/* Contact Form Section */}
      <section className="py-8 bg-muted/30">
        <div className="container max-w-4xl mx-auto px-4">
          <ContactSupplierForm 
            companyId={supplier.id}
            companyName={supplier.name}
            supplierId={supplier.owner_id}
          />
        </div>
      </section>

      {/* Persistent Mobile CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-3 z-[60] pb-[max(env(safe-area-inset-bottom),12px)] md:pb-3">
        <div className="flex gap-3 max-w-4xl mx-auto">
          {supplier.phone && (
            <a 
              href={`tel:${supplier.phone}`}
              className="flex-1 bg-foreground text-background py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] min-h-[44px]"
            >
              <Phone className="w-5 h-5" />
              התקשר
            </a>
          )}
          {supplier.phone && (
            <a 
              href={`https://wa.me/${normalizePhoneToE164(supplier.phone)}`}
              className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] min-h-[44px]"
            >
              <MessageCircle className="w-5 h-5" />
              וואטסאפ
            </a>
          )}
        </div>
      </div>

      {/* Schedule Meeting Modal */}
      {supplier && (
        <ScheduleMeetingModal
          isOpen={isScheduleMeetingOpen}
          onOpenChange={setIsScheduleMeetingOpen}
          supplierId={supplier.owner_id}
          supplierName={supplier.name}
        />
      )}
    </div>
  );
};

export default PublicSupplierProfile;
