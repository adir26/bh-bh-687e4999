import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Star, Phone, MessageCircle, Heart, Share2, ShoppingBag, Eye, Calendar, Bookmark } from 'lucide-react';
import { getSupplierById } from '@/data/suppliers';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { showToast } from '@/utils/toast';
import { ContactSupplierModal } from '@/components/modals/ContactSupplierModal';
import { ScheduleMeetingModal } from '@/components/modals/ScheduleMeetingModal';
import { supabase } from '@/integrations/supabase/client';

const SupplierProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile } = useAuth();
  const supplier = id ? getSupplierById(id) : undefined;
  
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [hasExistingLead, setHasExistingLead] = useState(false);
  const [hasExistingMeeting, setHasExistingMeeting] = useState(false);
  
  // This is a public supplier profile view - never show as "own profile" 
  // since this route is for clients to view supplier information
  const isOwnProfile = false;
  
  useEffect(() => {
    if (user && id) {
      checkExistingInteractions();
    }
    
    // Auto-open contact modal if ?contact=true in URL
    if (searchParams.get('contact') === 'true') {
      setIsContactModalOpen(true);
    }
  }, [user, id, searchParams]);

  const checkExistingInteractions = async () => {
    if (!user || !id) return;
    
    try {
      // Check if supplier is favorited
      try {
        const { data: favoriteData, error: favoriteError } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', user.id)
          .eq('supplier_id', id)
          .maybeSingle();
        
        if (favoriteError && favoriteError.code !== 'PGRST116') {
          console.error('Error checking favorites:', favoriteError);
        } else {
          setIsFavorited(!!favoriteData);
        }
      } catch (error) {
        console.error('Error in favorites query:', error);
        // Continue with default state if favorites check fails
      }
      
      // Check for existing leads
      try {
        const { data: leadData, error: leadError } = await supabase
          .from('leads')
          .select('id')
          .eq('client_id', user.id)
          .eq('supplier_id', id)
          .maybeSingle();
        
        if (leadError && leadError.code !== 'PGRST116') {
          console.error('Error checking leads:', leadError);
        } else {
          setHasExistingLead(!!leadData);
        }
      } catch (error) {
        console.error('Error in leads query:', error);
        // Continue with default state if leads check fails
      }
      
      // Check for existing meetings
      try {
        const { data: meetingData, error: meetingError } = await supabase
          .from('meetings')
          .select('id')
          .eq('user_id', user.id)
          .eq('supplier_id', id)
          .maybeSingle();
        
        if (meetingError && meetingError.code !== 'PGRST116') {
          console.error('Error checking meetings:', meetingError);
        } else {
          setHasExistingMeeting(!!meetingData);
        }
      } catch (error) {
        console.error('Error in meetings query:', error);
        // Continue with default state if meetings check fails
      }
    } catch (error) {
      console.error('Critical error in checkExistingInteractions:', error);
      // All checks failed, but component should still work with default states
    }
  };

  if (!supplier) {
    return (
      <div className="flex w-full max-w-md mx-auto min-h-screen flex-col items-center justify-center bg-white">
        <p>ספק לא נמצא</p>
        <Button onClick={() => navigate('/')} className="mt-4">
          חזרה לדף הבית
        </Button>
      </div>
    );
  }

  const handleContactSupplier = () => {
    if (!user) {
      showToast.error('יש להתחבר כדי ליצור קשר עם ספק');
      navigate('/login');
      return;
    }
    setIsContactModalOpen(true);
  };

  const handleScheduleMeeting = () => {
    if (!user) {
      showToast.error('יש להתחבר כדי לקבוע פגישה');
      navigate('/login');
      return;
    }
    setIsMeetingModalOpen(true);
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      showToast.error('יש להתחבר כדי לשמור ספק');
      navigate('/login');
      return;
    }

    try {
      if (isFavorited) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('supplier_id', id);

        if (error) throw error;
        setIsFavorited(false);
        showToast.success('הספק הוסר מהמועדפים');
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            supplier_id: id
          });

        if (error) throw error;
        setIsFavorited(true);
        showToast.success('הספק נוסף למועדפים');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      showToast.error('שגיאה בעדכון המועדפים');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = `${supplier?.name} - ספק מומלץ`;
    const text = supplier?.tagline || '';

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (error) {
        // User cancelled or error occurred
        if (error.name !== 'AbortError') {
          fallbackShare(url);
        }
      }
    } else {
      fallbackShare(url);
    }
  };

  const fallbackShare = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      showToast.success('הקישור הועתק ללוח');
    }).catch(() => {
      showToast.error('לא ניתן להעתיק את הקישור');
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="flex w-full max-w-md mx-auto min-h-screen flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <button onClick={() => navigate(-1)} className="p-2">
          <ArrowRight className="w-6 h-6" />
        </button>
        <span className="text-lg font-semibold">
          פרופיל ספק
        </span>
        <div className="w-10" />
      </div>


      {/* Supplier Info */}
      <div className="p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-muted">
            <img 
              src={supplier.logo} 
              alt={supplier.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[#121417]">{supplier.name}</h1>
            <p className="text-sm text-[#617385]">{supplier.tagline}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1">
                {renderStars(supplier.rating)}
              </div>
              <span className="text-sm text-[#617385]">
                {supplier.rating} • {supplier.reviewCount} ביקורות
              </span>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-[#F8F9FA] rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Phone className="w-4 h-4 text-[#617385]" />
            <span className="text-sm">{supplier.phone}</span>
          </div>
          <div className="text-sm text-[#617385]">
            📍 {supplier.location}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <Button 
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            onClick={handleContactSupplier}
          >
            <MessageCircle className="w-4 h-4 ml-2" />
            {hasExistingLead ? 'צור קשר נוסף' : 'צור קשר'}
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => navigate(`/supplier/${id}/products`)}
          >
            פרטים נוספים
          </Button>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">אודות</h3>
          <p className="text-sm text-[#617385] leading-relaxed">
            {supplier.description}
          </p>
        </div>

        {/* Products */}
        {supplier.products.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">המוצרים שלנו</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-blue-600 hover:text-blue-700"
                onClick={() => navigate(`/supplier/${id}/products`)}
              >
                <Eye className="w-4 h-4 ml-1" />
                צפה בכל המוצרים
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {supplier.products.slice(0, 4).map((product) => (
                <Card key={product.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-24 object-cover rounded-t-lg"
                    />
                    <div className="p-3">
                      <h4 className="font-medium text-sm mb-1 line-clamp-2">{product.name}</h4>
                      <p className="text-xs text-[#617385] mb-2">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-green-600">
                          ₪{product.price.toLocaleString()}
                        </span>
                        <ShoppingBag className="w-4 h-4 text-[#617385]" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Services */}
        {supplier.services.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">השירותים שלנו</h3>
            <div className="grid grid-cols-2 gap-3">
              {supplier.services.map((service, index) => (
                <div key={index} className="bg-[#F8F9FA] rounded-lg p-3">
                  <span className="text-sm font-medium">{service}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gallery */}
        {supplier.gallery.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">גלריה</h3>
            <div className="grid grid-cols-2 gap-3">
              {supplier.gallery.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`עבודה ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        {supplier.reviews.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">ביקורות לקוחות</h3>
              {supplier.reviews.length > 3 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-blue-600 hover:text-blue-700"
                  onClick={() => navigate(`/supplier/${id}/reviews`)}
                >
                  <Eye className="w-4 h-4 ml-1" />
                  צפה בכל הביקורות
                </Button>
              )}
            </div>
            {supplier.reviews.slice(0, 3).map((review) => (
              <Card key={review.id} className="mb-3">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{review.customerName}</span>
                    <div className="flex items-center gap-1">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <p className="text-sm text-[#617385] mb-2">{review.comment}</p>
                  <span className="text-xs text-[#617385]">{review.date}</span>
                </CardContent>
              </Card>
            ))}
            {supplier.reviews.length > 3 && (
              <div className="text-center pt-2">
                <span className="text-xs text-[#617385]">
                  ועוד {supplier.reviews.length - 3} ביקורות נוספות
                </span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex gap-3">
            <Button 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={handleScheduleMeeting}
            >
              <Calendar className="w-4 h-4 ml-2" />
              {hasExistingMeeting ? 'קבע פגישה נוספת' : 'קביעת פגישה'}
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleToggleFavorite}
            >
              <Bookmark className={`w-4 h-4 ml-2 ${isFavorited ? 'fill-current' : ''}`} />
              {isFavorited ? 'בטל שמירה' : 'שמור ספק'}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={handleToggleFavorite}
            >
              <Heart className={`w-4 h-4 ml-2 ${isFavorited ? 'fill-current text-red-500' : ''}`} />
              {isFavorited ? 'הוסר מהמועדפים' : 'הוסף למועדפים'}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4 ml-2" />
              שתף
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {supplier && (
        <>
          <ContactSupplierModal
            isOpen={isContactModalOpen}
            onClose={() => setIsContactModalOpen(false)}
            supplierId={supplier.id}
            supplierName={supplier.name}
          />
          <ScheduleMeetingModal
            isOpen={isMeetingModalOpen}
            onClose={() => setIsMeetingModalOpen(false)}
            supplierId={supplier.id}
            supplierName={supplier.name}
          />
        </>
      )}
    </div>
  );
};

export default SupplierProfile;