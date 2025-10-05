import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, Loader2, Package, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLocalSuppliers } from '@/hooks/useLocalSuppliers';

const LocalDeals = () => {
  const navigate = useNavigate();
  const { userLocation, suppliersByCategory, isLoading, hasLocation } = useLocalSuppliers();

  return (
    <div className="flex w-full max-w-md mx-auto min-h-screen flex-col bg-background" dir="rtl">
      {/* Header */}
      <div className="bg-white px-6 py-6 rounded-b-3xl shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-xl"
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">ספקים בקרבתי</h1>
            {hasLocation && userLocation?.city && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin className="w-4 h-4" />
                <span>{userLocation.city}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6 pb-nav-safe">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !hasLocation ? (
          <Card className="border-0 shadow-sm rounded-xl">
            <CardContent className="p-8 text-center">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">לא מצאנו את המיקום שלך</h3>
              <p className="text-sm text-muted-foreground mb-4">
                כדי להציג ספקים בקרבתך, נא עדכן את כתובתך בהגדרות האונבורדינג
              </p>
              <Button onClick={() => navigate('/onboarding/home-details')}>
                עדכן כתובת
              </Button>
            </CardContent>
          </Card>
        ) : suppliersByCategory.length === 0 ? (
          <Card className="border-0 shadow-sm rounded-xl">
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">אין ספקים באזור שלך</h3>
              <p className="text-sm text-muted-foreground mb-4">
                לא מצאנו ספקים ב{userLocation?.city} כרגע. נסה לחפש בכל הספקים
              </p>
              <Button onClick={() => navigate('/')}>
                חזור לדף הבית
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 text-sm mb-1">
                  ספקים מומלצים באזורך
                </h4>
                <p className="text-xs text-blue-700">
                  הספקים המוצגים פעילים ב{userLocation?.city} ובעלי דירוג גבוה
                </p>
              </div>
            </div>

            {/* Suppliers by Category */}
            {suppliersByCategory.map(({ category, suppliers }) => (
              <div key={category.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    {category.icon && <span>{category.icon}</span>}
                    {category.name}
                  </h2>
                  <Badge variant="secondary" className="text-xs">
                    {suppliers.length} ספקים
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  {suppliers.map((supplier) => (
                    <Card 
                      key={supplier.id}
                      className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer rounded-xl"
                      onClick={() => navigate(`/supplier/${supplier.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {supplier.logo_url ? (
                            <img 
                              src={supplier.logo_url} 
                              alt={supplier.name}
                              className="w-16 h-16 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
                              <Package className="w-8 h-8 text-primary" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-semibold text-foreground text-sm line-clamp-1">
                                {supplier.name}
                              </h3>
                              {supplier.featured && (
                                <Badge className="bg-amber-500 text-white text-xs px-2 py-0.5">
                                  מומלץ
                                </Badge>
                              )}
                            </div>
                            {supplier.description && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {supplier.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-2">
                              {supplier.rating && supplier.rating > 0 && (
                                <div className="flex items-center gap-1">
                                  <span className="text-amber-500 text-sm">★</span>
                                  <span className="text-xs font-medium text-foreground">
                                    {supplier.rating.toFixed(1)}
                                  </span>
                                  {supplier.review_count && supplier.review_count > 0 && (
                                    <span className="text-xs text-muted-foreground">
                                      ({supplier.review_count})
                                    </span>
                                  )}
                                </div>
                              )}
                              {supplier.city && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <MapPin className="w-3 h-3" />
                                  <span>{supplier.city}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default LocalDeals;
