import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Phone, MessageCircle, Heart, Share2 } from 'lucide-react';
import { getSupplierById } from '@/data/suppliers';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const SupplierProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const supplier = id ? getSupplierById(id) : undefined;

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
        <span className="text-lg font-semibold">פרופיל ספק</span>
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
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
            <MessageCircle className="w-4 h-4 ml-2" />
            צור קשר
          </Button>
          <Button variant="outline" className="flex-1">
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
            <h3 className="text-lg font-semibold mb-3">ביקורות לקוחות</h3>
            {supplier.reviews.map((review) => (
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
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" size="sm" className="flex-1">
            <Heart className="w-4 h-4 ml-2" />
            שמור ברשימה
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Share2 className="w-4 h-4 ml-2" />
            שתף
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SupplierProfile;