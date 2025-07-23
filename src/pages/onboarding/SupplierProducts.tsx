
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import OnboardingProgress from '@/components/OnboardingProgress';
import { ChevronRight, Upload, Plus, Trash2 } from 'lucide-react';
import supplierProductsImage from '@/assets/supplier-products.jpg';

interface Product {
  id: string;
  image: File | null;
  name: string;
  category: string;
  price: string;
  description: string;
}

export default function SupplierProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([{
    id: '1',
    image: null,
    name: '',
    category: '',
    price: '',
    description: ''
  }]);

  const categories = [
    'שיפוצים כלליים',
    'חשמל',
    'אינסטלציה',
    'מיזוג אוויר',
    'נגרות',
    'עיצוב פנים',
    'אדריכלות',
    'מטבחים',
    'ניקיון',
    'הובלות',
    'ייעוץ משכנתאות',
    'אחר'
  ];

  const handleProductChange = (id: string, field: keyof Product, value: any) => {
    setProducts(products.map(product => 
      product.id === id ? { ...product, [field]: value } : product
    ));
  };

  const handleFileUpload = (id: string, file: File) => {
    handleProductChange(id, 'image', file);
  };

  const addProduct = () => {
    const newProduct: Product = {
      id: Date.now().toString(),
      image: null,
      name: '',
      category: '',
      price: '',
      description: ''
    };
    setProducts([...products, newProduct]);
  };

  const removeProduct = (id: string) => {
    if (products.length > 1) {
      setProducts(products.filter(product => product.id !== id));
    }
  };

  const handleNext = () => {
    // Save progress to localStorage
    const currentData = JSON.parse(localStorage.getItem('supplierOnboarding') || '{}');
    localStorage.setItem('supplierOnboarding', JSON.stringify({
      ...currentData,
      products: products.map(product => ({
        ...product,
        image: product.image?.name || null
      })),
      currentStep: 4
    }));
    navigate('/onboarding/supplier-summary');
  };

  const handleSkip = () => {
    // Save progress to localStorage with empty products
    const currentData = JSON.parse(localStorage.getItem('supplierOnboarding') || '{}');
    localStorage.setItem('supplierOnboarding', JSON.stringify({
      ...currentData,
      products: [],
      currentStep: 4
    }));
    navigate('/onboarding/supplier-summary');
  };

  const handleBack = () => {
    navigate('/onboarding/supplier-branding');
  };

  const hasValidProducts = products.some(product => 
    product.name.trim() && product.category && product.price.trim()
  );

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      {/* Header */}
      <div className="p-4 flex justify-between items-center border-b border-border">
        <button 
          onClick={handleBack}
          className="text-muted-foreground hover:text-foreground p-2"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
        <button 
          onClick={() => navigate('/registration')}
          className="text-muted-foreground hover:text-foreground text-xl font-light w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
        >
          ×
        </button>
      </div>

      {/* Progress Indicator */}
      <OnboardingProgress currentStep={4} totalSteps={5} />

      {/* Content */}
      <div className="flex-1 flex flex-col pb-safe">
        {/* Hero Image */}
        <div className="relative h-48 mx-6 mb-6 rounded-2xl overflow-hidden">
          <img 
            src={supplierProductsImage}
            alt="הוספת מוצרים ושירותים"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>

        {/* Form Content */}
        <div className="flex-1 px-6">
          <div className="max-w-md mx-auto space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">
                הוסיפו מוצרים או שירותים
              </h1>
            </div>

            <div className="space-y-8">
              {products.map((product, index) => (
                <div key={product.id} className="p-4 border border-border rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">מוצר/שירות {index + 1}</h3>
                    {products.length > 1 && (
                      <button
                        onClick={() => removeProduct(product.id)}
                        className="text-destructive hover:text-destructive/80 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Product Image Upload */}
                  <div>
                    <Label>תמונת המוצר</Label>
                    <div className="mt-2 border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-primary transition-colors cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(product.id, e.target.files[0])}
                        className="hidden"
                        id={`product-image-${product.id}`}
                      />
                      <label htmlFor={`product-image-${product.id}`} className="cursor-pointer">
                        <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {product.image ? product.image.name : 'העלו תמונה'}
                        </p>
                      </label>
                    </div>
                  </div>

                  {/* Product Name */}
                  <div>
                    <Label htmlFor={`product-name-${product.id}`}>שם המוצר/שירות *</Label>
                    <Input
                      id={`product-name-${product.id}`}
                      value={product.name}
                      onChange={(e) => handleProductChange(product.id, 'name', e.target.value)}
                      placeholder="למשל: שיפוץ מטבח, חיבור חשמל, וכו'"
                      className="mt-1"
                    />
                  </div>

                  {/* Product Category */}
                  <div>
                    <Label>קטגוריה *</Label>
                    <Select 
                      value={product.category} 
                      onValueChange={(value) => handleProductChange(product.id, 'category', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="בחרו קטגוריה" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Product Price */}
                  <div>
                    <Label htmlFor={`product-price-${product.id}`}>מחיר *</Label>
                    <Input
                      id={`product-price-${product.id}`}
                      value={product.price}
                      onChange={(e) => handleProductChange(product.id, 'price', e.target.value)}
                      placeholder="מחיר בש״ח או 'לפי בדיקה'"
                      className="mt-1"
                    />
                  </div>

                  {/* Product Description */}
                  <div>
                    <Label htmlFor={`product-description-${product.id}`}>תיאור (אופציונלי)</Label>
                    <Textarea
                      id={`product-description-${product.id}`}
                      value={product.description}
                      onChange={(e) => handleProductChange(product.id, 'description', e.target.value)}
                      placeholder="פרטים נוספים על המוצר או השירות"
                      className="mt-1"
                    />
                  </div>
                </div>
              ))}

              {/* Add Product Button */}
              <div className="text-center">
                <button
                  onClick={addProduct}
                  className="flex items-center gap-2 mx-auto px-4 py-2 text-primary border border-primary rounded-xl hover:bg-primary/10 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  הוסיפו מוצר נוסף
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-6 pb-safe z-50">
        <div className="max-w-md mx-auto space-y-3">
          <Button 
            onClick={handleNext}
            disabled={!hasValidProducts}
            variant="blue"
            className="w-full py-4 text-lg rounded-xl h-14 font-medium"
          >
            הבא
          </Button>
          <Button 
            onClick={handleSkip}
            variant="outline"
            className="w-full py-3 text-base rounded-xl h-14"
          >
            דלגו לעת עתה
          </Button>
        </div>
      </div>
    </div>
  );
}
