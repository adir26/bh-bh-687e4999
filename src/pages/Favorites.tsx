
import React, { useState } from 'react';
import { Heart, Star, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Favorites = () => {
  const [activeTab, setActiveTab] = useState('suppliers');

  const favoriteSuppliers = [
    {
      id: '1',
      name: 'מטבחי פרימיום',
      category: 'מטבחים',
      rating: 4.8,
      reviewCount: 127,
      location: 'תל אביב',
      phone: '03-1234567',
      image: 'https://images.unsplash.com/photo-1556909114-3ba38b3becf0?w=300&h=200&fit=crop',
      specialties: ['מטבחים מודרניים', 'עיצוב פנים']
    },
    {
      id: '2',
      name: 'שיפוצי יהודה',
      category: 'שיפוצים',
      rating: 4.9,
      reviewCount: 89,
      location: 'ירושלים',
      phone: '02-9876543',
      image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=300&h=200&fit=crop',
      specialties: ['שיפוצי דירות', 'עבודות גבס']
    }
  ];

  const favoriteServices = [
    {
      id: '1',
      title: 'התקנת מיזוג אוויר',
      supplier: 'מיזוג הצפון',
      price: '₪2,500',
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=300&h=200&fit=crop'
    },
    {
      id: '2',
      title: 'עיצוב מטבח קומפלט',
      supplier: 'מטבחי פרימיום',
      price: '₪45,000',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1556909114-3ba38b3becf0?w=300&h=200&fit=crop'
    }
  ];

  const tabs = [
    { id: 'suppliers', label: 'ספקים', count: favoriteSuppliers.length },
    { id: 'services', label: 'שירותים', count: favoriteServices.length }
  ];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="max-w-md mx-auto bg-background pb-nav-safe">
        {/* Header */}
        <div className="bg-background border-b border-border px-6 py-6">
          <h1 className="text-2xl font-bold text-foreground text-right">המועדפים שלי</h1>
        </div>

        {/* Tabs */}
        <div className="bg-background border-b border-border px-6 py-2">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                className={`flex-1 rounded-xl h-12 text-sm font-medium transition-all ${
                  activeTab === tab.id 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label} ({tab.count})
              </Button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 py-6">
          {activeTab === 'suppliers' ? (
            <div className="space-y-4">
              {favoriteSuppliers.length > 0 ? (
                favoriteSuppliers.map((supplier) => (
                  <Card key={supplier.id} className="relative border-0 shadow-sm rounded-xl bg-card">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-3 left-3 z-10 bg-background/80 hover:bg-background rounded-xl h-10 w-10"
                    >
                      <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                    </Button>

                    <CardHeader className="pb-3">
                      <div className="flex gap-4">
                        <img
                          src={supplier.image}
                          alt={supplier.name}
                          className="w-16 h-16 rounded-xl object-cover"
                        />
                        <div className="flex-1">
                          <CardTitle className="text-lg text-right text-foreground font-semibold">{supplier.name}</CardTitle>
                          <p className="text-sm text-muted-foreground text-right mt-1">{supplier.category}</p>
                          <div className="flex items-center gap-1 mt-2 justify-end">
                            <span className="text-sm text-muted-foreground">({supplier.reviewCount})</span>
                            <span className="text-sm font-medium text-foreground">{supplier.rating}</span>
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-2 justify-end">
                          <span className="text-sm text-muted-foreground">{supplier.location}</span>
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex flex-wrap gap-2 justify-end">
                          {supplier.specialties.map((specialty, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-muted text-xs rounded-full text-muted-foreground font-medium"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button variant="outline" size="sm" className="flex-1 rounded-xl h-11">
                          <Phone className="w-4 h-4 ml-2" />
                          התקשר
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
          ) : (
            <div className="space-y-4">
              {favoriteServices.length > 0 ? (
                favoriteServices.map((service) => (
                  <Card key={service.id} className="relative border-0 shadow-sm rounded-xl bg-card">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-3 left-3 z-10 bg-background/80 hover:bg-background rounded-xl h-10 w-10"
                    >
                      <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                    </Button>

                    <CardContent className="p-5">
                      <div className="flex gap-4">
                        <img
                          src={service.image}
                          alt={service.title}
                          className="w-20 h-20 rounded-xl object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-right mb-2 text-foreground text-lg">{service.title}</h3>
                          <p className="text-sm text-muted-foreground text-right mb-3">{service.supplier}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium text-foreground">{service.rating}</span>
                            </div>
                            <span className="font-bold text-primary text-lg">{service.price}</span>
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Favorites;
