import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ProposalPreviewProps {
  data: {
    quoteNumber: string;
    creationDate: string;
    supplierInfo: {
      name: string;
      phone: string;
      email: string;
      logo?: string;
    };
    clientInfo: {
      name: string;
      email: string;
      phone: string;
    };
    items: Array<{
      id: string;
      description: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }>;
    discount: number;
    vat: number;
    notes: string;
    terms: string;
    template: 'modern' | 'minimal' | 'classic' | 'premium' | 'corporate';
  };
  calculations: {
    subtotalAmount: number;
    discountAmount: number;
    vatAmount: number;
    totalAmount: number;
  };
}

export const ProposalPreview: React.FC<ProposalPreviewProps> = ({ data, calculations }) => {
  const getThemeClasses = () => {
    switch (data.template) {
      case 'premium':
        return {
          headerBg: 'bg-gradient-to-r from-purple-50 to-pink-50',
          headerBorder: 'border-purple-500',
          accentColor: 'text-purple-600',
          primaryColor: 'text-purple-900',
        };
      case 'corporate':
        return {
          headerBg: 'bg-gradient-to-r from-gray-50 to-blue-50',
          headerBorder: 'border-gray-600',
          accentColor: 'text-gray-700',
          primaryColor: 'text-gray-900',
        };
      case 'minimal':
        return {
          headerBg: 'bg-slate-50',
          headerBorder: 'border-slate-400',
          accentColor: 'text-slate-600',
          primaryColor: 'text-slate-900',
        };
      case 'classic':
        return {
          headerBg: 'bg-amber-50',
          headerBorder: 'border-amber-600',
          accentColor: 'text-amber-700',
          primaryColor: 'text-amber-900',
        };
      default: // modern
        return {
          headerBg: 'bg-blue-50',
          headerBorder: 'border-blue-500',
          accentColor: 'text-blue-600',
          primaryColor: 'text-blue-900',
        };
    }
  };

  const theme = getThemeClasses();

  return (
    <Card className="max-w-4xl mx-auto shadow-lg" dir="rtl">
      <CardContent className="p-8">
        {/* Header */}
        <div className={`${theme.headerBg} ${theme.headerBorder} border-b-4 p-6 rounded-t-lg mb-6`}>
          <div className="flex justify-between items-start">
            <div>
              <h1 className={`text-3xl font-bold ${theme.primaryColor} mb-2`}>הצעת מחיר</h1>
              <p className="text-muted-foreground">מספר: {data.quoteNumber}</p>
              <p className="text-muted-foreground">
                תאריך: {new Date(data.creationDate).toLocaleDateString('he-IL')}
              </p>
            </div>
            <div className="text-left">
              <h2 className="text-xl font-bold mb-2">{data.supplierInfo.name}</h2>
              <p className="text-sm text-muted-foreground">טל: {data.supplierInfo.phone}</p>
              <p className="text-sm text-muted-foreground">מייל: {data.supplierInfo.email}</p>
            </div>
          </div>
        </div>

        {/* Client Information */}
        <div className="bg-muted/30 p-4 rounded-lg mb-6">
          <h3 className="font-bold mb-3 text-lg">פרטי לקוח:</h3>
          <div className="space-y-1">
            <p><span className="font-medium">שם:</span> {data.clientInfo.name}</p>
            {data.clientInfo.email && (
              <p><span className="font-medium">מייל:</span> {data.clientInfo.email}</p>
            )}
            {data.clientInfo.phone && (
              <p><span className="font-medium">טלפון:</span> {data.clientInfo.phone}</p>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6">
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="text-right p-3 font-medium">תיאור</th>
                  <th className="text-center p-3 font-medium w-20">כמות</th>
                  <th className="text-left p-3 font-medium w-28">מחיר יחידה</th>
                  <th className="text-left p-3 font-medium w-28">סה"כ</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-3">{item.description}</td>
                    <td className="p-3 text-center">{item.quantity}</td>
                    <td className="p-3 text-left">₪{item.unitPrice.toFixed(2)}</td>
                    <td className="p-3 text-left font-medium">₪{item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="flex justify-end mb-6">
          <div className="w-80">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>סכום ביניים:</span>
                <span>₪{calculations.subtotalAmount.toFixed(2)}</span>
              </div>
              {data.discount > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>הנחה ({data.discount}%):</span>
                  <span>-₪{calculations.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>מע"מ ({data.vat}%):</span>
                <span>₪{calculations.vatAmount.toFixed(2)}</span>
              </div>
              <Separator />
              <div className={`flex justify-between text-xl font-bold ${theme.accentColor}`}>
                <span>סה"כ לתשלום:</span>
                <span>₪{calculations.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {data.notes && (
          <div className="bg-muted/30 p-4 rounded-lg mb-4">
            <h3 className="font-bold mb-2">הערות:</h3>
            <p className="whitespace-pre-wrap">{data.notes}</p>
          </div>
        )}

        {/* Terms */}
        {data.terms && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
            <h3 className="font-bold mb-2">תנאי ההצעה:</h3>
            <p className="whitespace-pre-wrap text-sm">{data.terms}</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground border-t pt-4">
          <p>הצעה זו בתוקף למשך 30 יום מתאריך ההצעה</p>
          <Badge variant="secondary" className="mt-2">
            תבנית: {
              data.template === 'premium' ? 'פרימיום - תבנית A' :
              data.template === 'corporate' ? 'קורפורטיבי - תבנית B' :
              data.template === 'modern' ? 'מודרני' : 
              data.template === 'minimal' ? 'מינימלי' : 'קלאסי'
            }
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};