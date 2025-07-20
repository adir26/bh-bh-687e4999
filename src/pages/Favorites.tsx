
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
    <div className="flex w-full max-w-md mx-auto min-h-screen flex-col bg-white pb-20">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4">
        <h1 className="text-xl font-bold text-right">המועדפים שלי</h1>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b px-4">
        <div className="flex">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label} ({tab.count})
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        {activeTab === 'suppliers' ? (
          <div className="space-y-4">
            {favoriteSuppliers.length > 0 ? (
              favoriteSuppliers.map((supplier) => (
                <Card key={supplier.id} className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 left-2 z-10 bg-white/80 hover:bg-white"
                  >
                    <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                  </Button>

                  <CardHeader className="pb-2">
                    <div className="flex gap-3">
                      <img
                        src={supplier.image}
                        alt={supplier.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <CardTitle className="text-base text-right">{supplier.name}</CardTitle>
                        <p className="text-sm text-gray-600 text-right">{supplier.category}</p>
                        <div className="flex items-center gap-1 mt-1 justify-end">
                          <span className="text-sm text-gray-600">({supplier.reviewCount})</span>
                          <span className="text-sm font-medium">{supplier.rating}</span>
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-sm text-gray-600">{supplier.location}</span>
                        <MapPin className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {supplier.specialties.map((specialty, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-xs rounded-full"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Phone className="w-4 h-4 ml-1" />
                        התקשר
                      </Button>
                      <Button size="sm" className="flex-1">
                        צפה בפרופיל
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">אין ספקים מועדפים</h3>
                <p className="text-gray-500">התחל לחפש ולשמור ספקים שאהבת</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {favoriteServices.length > 0 ? (
              favoriteServices.map((service) => (
                <Card key={service.id} className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 left-2 z-10 bg-white/80 hover:bg-white"
                  >
                    <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                  </Button>

                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-right mb-1">{service.title}</h3>
                        <p className="text-sm text-gray-600 text-right mb-2">{service.supplier}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{service.rating}</span>
                          </div>
                          <span className="font-bold text-primary">{service.price}</span>
                        </div>
                      </div>
                    </div>
                    <Button className="w-full mt-3">
                      הזמן עכשיו
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">אין שירותים מועדפים</h3>
                <p className="text-gray-500">התחל לחפש ולשמור שירותים שאהבת</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
