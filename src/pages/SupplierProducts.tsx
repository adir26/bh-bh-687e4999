import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { getSupplierById } from '@/data/suppliers';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const SupplierProducts = () => {
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

  return (
    <div className="flex w-full max-w-md mx-auto min-h-screen flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <button onClick={() => navigate(-1)} className="p-2">
          <ArrowRight className="w-6 h-6" />
        </button>
        <span className="text-lg font-semibold">
          מוצרי {supplier.name}
        </span>
        <div className="w-10" />
      </div>

      {/* Products Grid */}
      <div className="flex-1 p-4">
        {supplier.products.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">אין מוצרים</h3>
            <p className="text-gray-500">הספק עדיין לא העלה מוצרים</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {supplier.products.map((product) => (
              <Card key={product.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-32 object-cover rounded-t-lg"
                  />
                  <div className="p-3">
                    <h4 className="font-medium text-sm mb-2 line-clamp-2">{product.name}</h4>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-3">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-green-600">
                        ₪{product.price.toLocaleString()}
                      </span>
                      <ShoppingBag className="w-5 h-5 text-gray-400" />
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

export default SupplierProducts;