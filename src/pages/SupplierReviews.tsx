import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Star, MessageSquare } from 'lucide-react';
import { getSupplierById } from '@/data/suppliers';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const SupplierReviews = () => {
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
        <span className="text-lg font-semibold">
          ביקורות על {supplier.name}
        </span>
        <div className="w-10" />
      </div>

      {/* Reviews Summary */}
      <div className="p-4 border-b bg-gray-50">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-3xl font-bold">{supplier.rating}</span>
            <div className="flex items-center gap-1">
              {renderStars(supplier.rating)}
            </div>
          </div>
          <p className="text-sm text-gray-600">
            מבוסס על {supplier.reviewCount} ביקורות
          </p>
        </div>
      </div>

      {/* Reviews List */}
      <div className="flex-1 p-4">
        {supplier.reviews.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">אין ביקורות</h3>
            <p className="text-gray-500">עדיין לא נכתבו ביקורות על הספק הזה</p>
          </div>
        ) : (
          <div className="space-y-4">
            {supplier.reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900">{review.customerName}</span>
                        <div className="flex items-center gap-1">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed mb-3">
                        {review.comment}
                      </p>
                      <span className="text-xs text-gray-500">{review.date}</span>
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
};

export default SupplierReviews;