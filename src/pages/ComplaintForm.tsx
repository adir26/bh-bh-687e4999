import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Upload, X, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';

interface Order {
  id: string;
  invoiceNumber: string;
  supplierName: string;
  serviceName: string;
  totalAmount: number;
  orderDate: string;
}

const ComplaintForm = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    reason: '',
    description: '',
    requestRefund: false
  });
  
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock order data - in real app this would come from API
  const order: Order = {
    id: orderId || 'ORD-001',
    invoiceNumber: '12A394',
    supplierName: 'מטבחי פרימיום',
    serviceName: 'עיצוב והתקנת מטבח',
    totalAmount: 45000,
    orderDate: '2024-01-15'
  };

  const complaintReasons = [
    { value: 'delay', label: 'עיכוב במשלוח/הגעה' },
    { value: 'wrong_item', label: 'פריט שגוי/לא תואם להזמנה' },
    { value: 'quality_issue', label: 'בעיית איכות/פגם במוצר' },
    { value: 'service_issue', label: 'בעיה בשירות/התנהגות' },
    { value: 'billing_issue', label: 'בעיה בחיוב/תשלום' },
    { value: 'other', label: 'אחר' }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate files
    const validFiles: File[] = [];
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    files.forEach(file => {
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'סוג קובץ לא נתמך',
          description: `הקובץ ${file.name} אינו נתמך. אנא העלה קובץ JPG, PNG או PDF`,
          variant: 'destructive'
        });
        return;
      }

      if (file.size > maxSize) {
        toast({
          title: 'הקובץ גדול מידי',
          description: `הקובץ ${file.name} גדול מ-10MB`,
          variant: 'destructive'
        });
        return;
      }

      validFiles.push(file);
    });

    setUploadedFiles(prev => [...prev, ...validFiles]);
    
    if (validFiles.length > 0) {
      toast({
        title: 'קבצים הועלו בהצלחה',
        description: `${validFiles.length} קבצים נוספו לתלונה`
      });
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.reason) {
      toast({
        title: 'שדה חובה',
        description: 'אנא בחר סיבת התלונה',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: 'שדה חובה',
        description: 'אנא הוסף תיאור לתלונה',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const complaintId = `C${Math.floor(Math.random() * 9000) + 1000}`;
      
      toast({
        title: 'התלונה נשלחה בהצלחה',
        description: `מספר תלונה: ${complaintId}. נחזור אליך בהקדם`,
        action: (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/support/complaint/${complaintId}`)}
          >
            עקוב אחרי התלונה
          </Button>
        )
      });

      // Navigate to support page
      setTimeout(() => {
        navigate('/support');
      }, 1500);

    } catch (error) {
      toast({
        title: 'שגיאה בשליחת התלונה',
        description: 'אנא נסה שוב או צור קשר עם התמיכה',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex w-full max-w-md mx-auto min-h-screen flex-col bg-gray-50 pb-24" dir="rtl">
      {/* Header */}
      <div className="bg-white px-6 py-6 rounded-b-3xl shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/orders/${order.id}/status`)}
            className="p-2 hover:bg-gray-100 rounded-xl"
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div className="text-right flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">דווח על בעיה</h1>
            <p className="text-gray-600 text-sm">הזמנה #{order.invoiceNumber}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Order Details */}
        <Card className="border-0 shadow-sm rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-900">פרטי ההזמנה</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">ספק:</span>
              <span className="font-medium">{order.supplierName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">שירות:</span>
              <span className="font-medium">{order.serviceName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">תאריך הזמנה:</span>
              <span className="font-medium">{new Date(order.orderDate).toLocaleDateString('he-IL')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">סכום:</span>
              <span className="font-bold">₪{order.totalAmount.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Complaint Form */}
        <Card className="border-0 shadow-sm rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-900">פרטי התלונה</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Reason Selection */}
              <div className="space-y-2">
                <Label htmlFor="reason" className="text-sm font-medium text-gray-900">
                  סיבת התלונה <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.reason} onValueChange={(value) => setFormData(prev => ({ ...prev, reason: value }))}>
                  <SelectTrigger className="w-full rounded-xl border-gray-200">
                    <SelectValue placeholder="בחר סיבת התלונה" />
                  </SelectTrigger>
                  <SelectContent>
                    {complaintReasons.map((reason) => (
                      <SelectItem key={reason.value} value={reason.value}>
                        {reason.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-900">
                  תיאור הבעיה <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="אנא תאר את הבעיה בפירוט..."
                  className="min-h-[120px] rounded-xl border-gray-200 resize-none"
                />
              </div>

              {/* File Upload */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-900">
                  צרף קבצים (אופציונלי)
                </Label>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-12 border-dashed border-2 border-gray-300 hover:border-primary rounded-xl"
                >
                  <Upload className="w-5 h-5 ml-2" />
                  העלה תמונות או מסמכים (JPG, PNG, PDF)
                </Button>

                {/* Uploaded Files */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-700">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="p-1 h-auto text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Refund Request */}
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="refund"
                  checked={formData.requestRefund}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requestRefund: !!checked }))}
                />
                <Label htmlFor="refund" className="text-sm text-gray-700 cursor-pointer">
                  אני מבקש החזר כספי
                </Label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    שולח תלונה...
                  </div>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 ml-2" />
                    שלח תלונה
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Help Note */}
        <Card className="border-0 shadow-sm rounded-xl bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">לפני שליחת התלונה</h4>
                <p className="text-sm text-blue-800">
                  אנחנו ממליצים לנסות תחילה ליצור קשר ישיר עם הספק. 
                  רוב הבעיות ניתנות לפתרון במהירות בדרך זו.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComplaintForm;