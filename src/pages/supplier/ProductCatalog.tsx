
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Plus, Search, Filter, Edit, Upload, Trash2, Eye, EyeOff, Grid, List } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  category: string;
  price: string;
  image: string;
  isPublished: boolean;
  description: string;
  deliveryTime: string;
  tags: string[];
}

export default function ProductCatalog() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const products: Product[] = [
    {
      id: '1',
      title: 'עיצוב מטבח מודרני',
      category: 'עיצוב מטבחים',
      price: '₪15,000 - ₪25,000',
      image: '/placeholder.svg',
      isPublished: true,
      description: 'עיצוב מטבח מודרני ופונקציונלי עם חומרים איכותיים',
      deliveryTime: '4-6 שבועות',
      tags: ['מודרני', 'איכותי', 'פונקציונלי']
    },
    {
      id: '2',
      title: 'שיפוץ חדר אמבטיה',
      category: 'שיפוצים',
      price: '₪8,000 - ₪15,000',
      image: '/placeholder.svg',
      isPublished: true,
      description: 'שיפוץ מלא של חדר אמבטיה כולל אריחים ואבזרים',
      deliveryTime: '2-3 שבועות',
      tags: ['שיפוץ', 'אמבטיה', 'מהיר']
    },
    {
      id: '3',
      title: 'עיצוב פנים לסלון',
      category: 'עיצוב פנים',
      price: '₪5,000 - ₪12,000',
      image: '/placeholder.svg',
      isPublished: false,
      description: 'עיצוב פנים מלא לסלון עם רהיטים וקישוטים',
      deliveryTime: '3-4 שבועות',
      tags: ['עיצוב', 'סלון', 'רהיטים']
    },
  ];

  const categories = ['כל הקטגוריות', 'עיצוב מטבחים', 'שיפוצים', 'עיצוב פנים', 'נגרות', 'צבעות'];

  const filteredProducts = products.filter(product => {
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesAvailability = availabilityFilter === 'all' || 
      (availabilityFilter === 'published' && product.isPublished) ||
      (availabilityFilter === 'hidden' && !product.isPublished);
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesAvailability && matchesSearch;
  });

  const toggleProductVisibility = (productId: string) => {
    // In a real app, this would update the product in the backend
    console.log('Toggle visibility for product:', productId);
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/supplier/dashboard')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                חזור לדשבורד
              </Button>
              <h1 className="text-2xl font-bold text-foreground">קטלוג מוצרים ושירותים</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button variant="blue" className="mr-2">
                <Plus className="w-4 h-4 ml-1" />
                הוסף מוצר/שירות
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="חפש מוצרים ושירותים..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 ml-2" />
                <SelectValue placeholder="קטגוריה" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הקטגוריות</SelectItem>
                <SelectItem value="עיצוב מטבחים">עיצוב מטבחים</SelectItem>
                <SelectItem value="שיפוצים">שיפוצים</SelectItem>
                <SelectItem value="עיצוב פנים">עיצוב פנים</SelectItem>
                <SelectItem value="נגרות">נגרות</SelectItem>
                <SelectItem value="צבעות">צבעות</SelectItem>
              </SelectContent>
            </Select>
            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="זמינות" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">הכל</SelectItem>
                <SelectItem value="published">פורסם</SelectItem>
                <SelectItem value="hidden">מוסתר</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">8</div>
              <div className="text-sm text-muted-foreground">סה"כ מוצרים</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">6</div>
              <div className="text-sm text-muted-foreground">פורסמו</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">2</div>
              <div className="text-sm text-muted-foreground">מוסתרים</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">24</div>
              <div className="text-sm text-muted-foreground">צפיות השבוע</div>
            </CardContent>
          </Card>
        </div>

        {/* Products Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-md transition-shadow">
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-2 left-2">
                    {product.isPublished ? (
                      <Badge className="bg-green-100 text-green-800">פורסם</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">מוסתר</Badge>
                    )}
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{product.title}</CardTitle>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{product.category}</span>
                    <span className="font-bold text-primary">{product.price}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">זמן אספקה:</span>
                    <span className="text-xs font-medium">{product.deliveryTime}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {product.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={product.isPublished}
                        onCheckedChange={() => toggleProductVisibility(product.id)}
                      />
                      <span className="text-sm text-muted-foreground">
                        {product.isPublished ? 'מוצג' : 'מוסתר'}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Upload className="w-3 h-3" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-right p-4 font-medium">מוצר/שירות</th>
                      <th className="text-right p-4 font-medium">קטגוריה</th>
                      <th className="text-right p-4 font-medium">מחיר</th>
                      <th className="text-right p-4 font-medium">סטטוס</th>
                      <th className="text-right p-4 font-medium">זמן אספקה</th>
                      <th className="text-right p-4 font-medium">פעולות</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.image}
                              alt={product.title}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div>
                              <div className="font-medium">{product.title}</div>
                              <div className="text-sm text-muted-foreground truncate max-w-xs">
                                {product.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">{product.category}</td>
                        <td className="p-4 font-medium">{product.price}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={product.isPublished}
                              onCheckedChange={() => toggleProductVisibility(product.id)}
                            />
                            <Badge className={product.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                              {product.isPublished ? 'פורסם' : 'מוסתר'}
                            </Badge>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">{product.deliveryTime}</td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm">
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Upload className="w-3 h-3" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {filteredProducts.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">לא נמצאו מוצרים התואמים לחיפוש</p>
              <Button variant="blue">
                <Plus className="w-4 h-4 ml-1" />
                הוסף מוצר ראשון
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
