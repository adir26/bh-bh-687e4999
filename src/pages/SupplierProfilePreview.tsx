import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Phone, MessageCircle, Eye, Edit2, Save, X, Plus, Trash2, Camera, MapPin } from 'lucide-react';
import { getSupplierById } from '@/data/suppliers';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface EditableField {
  field: string;
  value: string;
}

const SupplierProfilePreview = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [supplier, setSupplier] = useState(getSupplierById('1')); // Get first supplier as example
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  const [newService, setNewService] = useState('');
  const [isAddingService, setIsAddingService] = useState(false);

  if (!supplier) {
    return (
      <div className="flex w-full max-w-md mx-auto min-h-screen flex-col items-center justify-center bg-white">
        <p>ספק לא נמצא</p>
        <Button onClick={() => navigate('/supplier/dashboard')} className="mt-4">
          חזרה לדשבורד
        </Button>
      </div>
    );
  }

  const startEditing = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditingValue(currentValue);
  };

  const cancelEditing = () => {
    setEditingField(null);
    setEditingValue('');
  };

  const saveField = () => {
    if (!editingField) return;

    const updatedSupplier = { ...supplier };
    
    switch (editingField) {
      case 'name':
        updatedSupplier.name = editingValue;
        break;
      case 'tagline':
        updatedSupplier.tagline = editingValue;
        break;
      case 'description':
        updatedSupplier.description = editingValue;
        break;
      case 'phone':
        updatedSupplier.phone = editingValue;
        break;
      case 'location':
        updatedSupplier.location = editingValue;
        break;
    }

    setSupplier(updatedSupplier);
    setEditingField(null);
    setEditingValue('');
    
    toast({
      title: "עודכן בהצלחה",
      description: "השינוי נשמר ויוצג ללקוחות",
    });
  };

  const addService = () => {
    if (!newService.trim()) return;
    
    const updatedSupplier = { ...supplier };
    updatedSupplier.services = [...updatedSupplier.services, newService.trim()];
    setSupplier(updatedSupplier);
    setNewService('');
    setIsAddingService(false);
    
    toast({
      title: "שירות נוסף",
      description: "השירות החדש נוסף לפרופיל",
    });
  };

  const removeService = (index: number) => {
    const updatedSupplier = { ...supplier };
    updatedSupplier.services = updatedSupplier.services.filter((_, i) => i !== index);
    setSupplier(updatedSupplier);
    
    toast({
      title: "שירות הוסר",
      description: "השירות הוסר מהפרופיל",
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

  const renderEditableField = (field: string, value: string, multiline = false) => {
    if (editingField === field) {
      return (
        <div className="flex items-center gap-2">
          {multiline ? (
            <Textarea
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              className="flex-1 text-right"
              rows={3}
              dir="rtl"
            />
          ) : (
            <Input
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              className="flex-1 text-right"
              dir="rtl"
            />
          )}
          <Button size="sm" onClick={saveField} className="p-1">
            <Save className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={cancelEditing} className="p-1">
            <X className="w-4 h-4" />
          </Button>
        </div>
      );
    }

    return (
      <div className="flex items-start gap-2 group">
        <span className="flex-1">{value}</span>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => startEditing(field, value)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1"
        >
          <Edit2 className="w-4 h-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="flex w-full max-w-md mx-auto min-h-screen flex-col bg-white pb-20">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <button onClick={() => navigate('/supplier/dashboard')} className="p-2">
          <ArrowRight className="w-6 h-6" />
        </button>
        <span className="text-lg font-semibold">הפרופיל שלי</span>
        <div className="w-10" />
      </div>

      {/* Preview Notice */}
      <div className="mx-4 mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800 text-right">
          <Eye className="w-4 h-4 inline ml-1" />
          כך הפרופיל שלך נראה ללקוחות. לחץ על <Edit2 className="w-3 h-3 inline mx-1" /> לעריכה מהירה.
        </p>
      </div>

      {/* Supplier Info */}
      <div className="p-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-muted group">
            <img 
              src={supplier.logo} 
              alt={supplier.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <div className="mb-1">
              {renderEditableField('name', supplier.name)}
            </div>
            <div className="text-sm text-[#617385] mb-1">
              {renderEditableField('tagline', supplier.tagline)}
            </div>
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
            <div className="flex-1">
              {renderEditableField('phone', supplier.phone)}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#617385]">
            <MapPin className="w-4 h-4" />
            <div className="flex-1">
              {renderEditableField('location', supplier.location)}
            </div>
          </div>
        </div>

        {/* Action Buttons (Customer View) */}
        <div className="flex gap-3 mb-6">
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700" disabled>
            <MessageCircle className="w-4 h-4 ml-2" />
            צור קשר
          </Button>
          <Button variant="outline" className="flex-1" disabled>
            פרטים נוספים
          </Button>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">אודות</h3>
          <div className="text-sm text-[#617385] leading-relaxed">
            {renderEditableField('description', supplier.description, true)}
          </div>
        </div>

        {/* Services */}
        {supplier.services.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">השירותים שלנו</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAddingService(true)}
                className="text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-4 h-4 ml-1" />
                הוסף שירות
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {supplier.services.map((service, index) => (
                <div key={index} className="bg-[#F8F9FA] rounded-lg p-3 flex items-center justify-between group">
                  <span className="text-sm font-medium">{service}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeService(index)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              
              {isAddingService && (
                <div className="bg-[#F8F9FA] rounded-lg p-3 flex items-center gap-2">
                  <Input
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    placeholder="שם השירות החדש"
                    className="flex-1 text-right"
                    dir="rtl"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addService();
                      if (e.key === 'Escape') {
                        setIsAddingService(false);
                        setNewService('');
                      }
                    }}
                  />
                  <Button size="sm" onClick={addService} className="p-1">
                    <Save className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsAddingService(false);
                      setNewService('');
                    }}
                    className="p-1"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Products */}
        {supplier.products.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">המוצרים שלנו</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-blue-600 hover:text-blue-700"
                onClick={() => navigate('/supplier/catalog')}
              >
                <Edit2 className="w-4 h-4 ml-1" />
                נהל מוצרים
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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Gallery */}
        {supplier.gallery.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">גלריה</h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-4 h-4 ml-1" />
                הוסף תמונות
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {supplier.gallery.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`עבודה ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="p-1 h-auto w-auto"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews (Read Only) */}
        {supplier.reviews.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">ביקורות לקוחות</h3>
              <Badge variant="secondary" className="text-xs">
                {supplier.reviews.length} ביקורות
              </Badge>
            </div>
            {supplier.reviews.slice(0, 2).map((review) => (
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
      </div>
    </div>
  );
};

export default SupplierProfilePreview;