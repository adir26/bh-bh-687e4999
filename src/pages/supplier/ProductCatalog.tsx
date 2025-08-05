
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Plus, Filter, Edit, Upload, Trash2, Eye, EyeOff, Grid, List } from 'lucide-react';
import { SearchInput } from '@/components/ui/search-input';

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
        <div className="mobile-container px-4 xs:px-5 sm:px-6 py-3 xs:py-4">
          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 xs:gap-4">
            <div className="flex items-center gap-2 xs:gap-4 w-full xs:w-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/supplier/dashboard')}
                className="flex items-center gap-1 xs:gap-2 h-8 xs:h-9 px-2 xs:px-3"
              >
                <ArrowLeft className="w-3 h-3 xs:w-4 xs:h-4" />
                <span className="text-xs xs:text-sm">חזור</span>
              </Button>
              <h1 className="text-lg xs:text-xl sm:text-2xl font-bold text-foreground truncate">
                קטלוג מוצרים ושירותים
              </h1>
            </div>
            <div className="flex items-center gap-1 xs:gap-2 w-full xs:w-auto justify-end">
              <div className="flex items-center gap-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 w-8 xs:h-9 xs:w-9 p-0"
                >
                  <Grid className="w-3 h-3 xs:w-4 xs:h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 w-8 xs:h-9 xs:w-9 p-0"
                >
                  <List className="w-3 h-3 xs:w-4 xs:h-4" />
                </Button>
              </div>
              <Button variant="blue" className="h-8 xs:h-9 text-xs xs:text-sm px-2 xs:px-3">
                <Plus className="w-3 h-3 xs:w-4 xs:h-4 ml-1" />
                <span className="hidden xs:inline">הוסף מוצר/שירות</span>
                <span className="xs:hidden">הוסף</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mobile-container px-4 xs:px-5 sm:px-6 py-4 xs:py-5 sm:py-6">
        {/* Filters */}
        <div className="flex flex-col gap-3 xs:gap-4 mb-4 xs:mb-5 sm:mb-6">
          <div className="w-full">
            <SearchInput
              placeholder="חפש מוצרים ושירותים..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClear={() => setSearchTerm("")}
              className="h-10 xs:h-11"
            />
          </div>
          <div className="flex flex-col xs:flex-row gap-2 xs:gap-3">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full xs:w-48 h-10 xs:h-11">
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
              <SelectTrigger className="w-full xs:w-40 h-10 xs:h-11">
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 xs:gap-3 sm:gap-4 mb-4 xs:mb-5 sm:mb-6">
          <Card className="mobile-card">
            <CardContent className="p-3 xs:p-4 text-center">
              <div className="text-lg xs:text-xl sm:text-2xl font-bold text-primary">8</div>
              <div className="text-xs xs:text-sm text-muted-foreground">סה"כ מוצרים</div>
            </CardContent>
          </Card>
          <Card className="mobile-card">
            <CardContent className="p-3 xs:p-4 text-center">
              <div className="text-lg xs:text-xl sm:text-2xl font-bold text-green-600">6</div>
              <div className="text-xs xs:text-sm text-muted-foreground">פורסמו</div>
            </CardContent>
          </Card>
          <Card className="mobile-card">
            <CardContent className="p-3 xs:p-4 text-center">
              <div className="text-lg xs:text-xl sm:text-2xl font-bold text-yellow-600">2</div>
              <div className="text-xs xs:text-sm text-muted-foreground">מוסתרים</div>
            </CardContent>
          </Card>
          <Card className="mobile-card">
            <CardContent className="p-3 xs:p-4 text-center">
              <div className="text-lg xs:text-xl sm:text-2xl font-bold text-blue-600">24</div>
              <div className="text-xs xs:text-sm text-muted-foreground">צפיות השבוע</div>
            </CardContent>
          </Card>
        </div>

        {/* Products Display */}
        {viewMode === 'grid' ? (
          <div className="mobile-grid gap-3 xs:gap-4 sm:gap-5 lg:gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="mobile-card hover:shadow-md transition-shadow">
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-36 xs:h-40 sm:h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-2 left-2">
                    {product.isPublished ? (
                      <Badge className="bg-green-100 text-green-800 text-xs">פורסם</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800 text-xs">מוסתר</Badge>
                    )}
                  </div>
                </div>
                <CardHeader className="pb-2 p-3 xs:p-4">
                  <CardTitle className="text-base xs:text-lg text-wrap-balance">{product.title}</CardTitle>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs xs:text-sm text-muted-foreground truncate">{product.category}</span>
                    <span className="font-bold text-primary text-xs xs:text-sm shrink-0">{product.price}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 xs:space-y-3 p-3 xs:p-4 pt-0">
                  <p className="text-xs xs:text-sm text-muted-foreground text-wrap-balance line-clamp-2">{product.description}</p>
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
                  <div className="flex items-center justify-between pt-2 gap-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={product.isPublished}
                        onCheckedChange={() => toggleProductVisibility(product.id)}
                      />
                      <span className="text-xs xs:text-sm text-muted-foreground">
                        {product.isPublished ? 'מוצג' : 'מוסתר'}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <Upload className="w-3 h-3" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="mobile-card">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead className="border-b">
                    <tr>
                      <th className="text-right p-2 xs:p-3 sm:p-4 font-medium text-xs xs:text-sm">מוצר/שירות</th>
                      <th className="text-right p-2 xs:p-3 sm:p-4 font-medium text-xs xs:text-sm hidden sm:table-cell">קטגוריה</th>
                      <th className="text-right p-2 xs:p-3 sm:p-4 font-medium text-xs xs:text-sm">מחיר</th>
                      <th className="text-right p-2 xs:p-3 sm:p-4 font-medium text-xs xs:text-sm">סטטוס</th>
                      <th className="text-right p-2 xs:p-3 sm:p-4 font-medium text-xs xs:text-sm hidden md:table-cell">זמן אספקה</th>
                      <th className="text-right p-2 xs:p-3 sm:p-4 font-medium text-xs xs:text-sm">פעולות</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="border-b hover:bg-muted/50">
                        <td className="p-2 xs:p-3 sm:p-4">
                          <div className="flex items-center gap-2 xs:gap-3">
                            <img
                              src={product.image}
                              alt={product.title}
                              className="w-10 h-10 xs:w-12 xs:h-12 object-cover rounded"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-xs xs:text-sm truncate">{product.title}</div>
                              <div className="text-xs text-muted-foreground truncate sm:hidden">
                                {product.category}
                              </div>
                              <div className="text-xs text-muted-foreground truncate max-w-[150px] xs:max-w-[200px] hidden xs:block sm:block">
                                {product.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-2 xs:p-3 sm:p-4 text-muted-foreground text-xs xs:text-sm hidden sm:table-cell">{product.category}</td>
                        <td className="p-2 xs:p-3 sm:p-4 font-medium text-xs xs:text-sm">{product.price}</td>
                        <td className="p-2 xs:p-3 sm:p-4">
                          <div className="flex flex-col xs:flex-row items-start xs:items-center gap-1 xs:gap-2">
                            <Switch
                              checked={product.isPublished}
                              onCheckedChange={() => toggleProductVisibility(product.id)}
                              className="scale-75 xs:scale-100"
                            />
                            <Badge className={`text-xs ${product.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {product.isPublished ? 'פורסם' : 'מוסתר'}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 md:hidden">
                            {product.deliveryTime}
                          </div>
                        </td>
                        <td className="p-2 xs:p-3 sm:p-4 text-muted-foreground text-xs xs:text-sm hidden md:table-cell">{product.deliveryTime}</td>
                        <td className="p-2 xs:p-3 sm:p-4">
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm" className="h-7 w-7 xs:h-8 xs:w-8 p-0">
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button variant="outline" size="sm" className="h-7 w-7 xs:h-8 xs:w-8 p-0 hidden xs:flex">
                              <Upload className="w-3 h-3" />
                            </Button>
                            <Button variant="outline" size="sm" className="h-7 w-7 xs:h-8 xs:w-8 p-0 hidden xs:flex">
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
