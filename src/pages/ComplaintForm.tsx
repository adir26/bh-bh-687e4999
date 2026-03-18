import React, { useState, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Upload, X, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const ComplaintForm = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const complaintType = searchParams.get('type') || 'order';
  const reviewId = searchParams.get('reviewId');
  const supplierId = searchParams.get('supplierId');
  
  const [formData, setFormData] = useState({
    reason: '',
    description: '',
    requestRefund: false
  });
  
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch real order data
  const { data: order, isLoading } = useQuery({
    queryKey: ['complaint-order', orderId],
    enabled: !!orderId && complaintType !== 'review',
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('id, title, amount, created_at, supplier_id')
        .eq('id', orderId!)
        .single();

      if (error) throw error;

      const { data: company } = await supabase
        .from('companies')
        .select('name')
        .eq('owner_id', data.supplier_id)
        .maybeSingle();

      return {
        id: data.id,
        supplierName: company?.name || 'ספק',
        serviceName: data.title || 'הזמנה',
        totalAmount: Number(data.amount) || 0,
        orderDate: data.created_at,
      };
    },
    staleTime: 60_000,
  });

  const complaintReasons = complaintType === 'review' 
    ? [
        { value: 'inappropriate_content', label: 'תוכן לא הולם/פוגעני' },
        { value: 'spam', label: 'ספאם או פרסומת' },
        { value: 'fake_review', label: 'ביקורת מזויפת' },
        { value: 'harassment', label: 'הטרדה או איומים' },
        { value: 'other', label: 'אחר' }
      ]
    : [
        { value: 'delay', label: 'עיכוב במשלוח/הגעה' },
        { value: 'wrong_item', label: 'פריט שגוי/לא תואם להזמנה' },
        { value: 'quality_issue', label: 'בעיית איכות/פגם במוצר' },
        { value: 'service_issue', label: 'בעיה בשירות/התנהגות' },
        { value: 'billing_issue', label: 'בעיה בחיוב/תשלום' },
        { value: 'other', label: 'אחר' }
      ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles: File[] = [];
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024;

    files.forEach(file => {
      if (!allowedTypes.includes(file.type)) {
        toast({ title: 'סוג קובץ לא נתמך', description: `הקובץ ${file.name} אינו נתמך`, variant: 'destructive' });
        return;
      }
      if (file.size > maxSize) {
        toast({ title: 'הקובץ גדול מדי', description: `${file.name} גדול מ-10MB`, variant: 'destructive' });
        return;
      }
      validFiles.push(file);
    });

    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.reason) {
      toast({ title: 'שדה חובה', description: 'אנא בחר סיבת התלונה', variant: 'destructive' });
      return;
    }
    if (!formData.description.trim()) {
      toast({ title: 'שדה חובה', description: 'אנא הוסף תיאור לתלונה', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert complaint to support_tickets table if exists, otherwise use events
      const { error } = await supabase.from('events').insert({
        entity: complaintType === 'review' ? 'review' : 'order',
        entity_id: complaintType === 'review' ? (reviewId || '') : (orderId || ''),
        type: 'complaint_submitted',
        user_id: user?.id || null,
        meta: {
          reason: formData.reason,
          description: formData.description,
          request_refund: formData.requestRefund,
          supplier_id: supplierId || order?.id,
          files_count: uploadedFiles.length,
        },
      });

      if (error) throw error;
      
      toast({
        title: 'התלונה נשלחה בהצלחה',
        description: 'נחזור אליך בהקדם',
      });

      setTimeout(() => navigate('/orders'), 1500);
    } catch (error) {
      toast({ title: 'שגיאה בשליחת התלונה', description: 'אנא נסה שוב', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex w-full max-w-md md:max-w-4xl lg:max-w-5xl mx-auto min-h-screen flex-col bg-background pb-24" dir="rtl">
      {/* Header */}
      <div className="bg-card px-6 py-6 rounded-b-3xl shadow-sm border-b">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl"
          >
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div className="text-right flex-1">
            <h1 className="text-2xl font-bold text-foreground mb-1">
              {complaintType === 'review' ? 'דווח על ביקורת' : 'דווח על בעיה'}
            </h1>
            {order && <p className="text-muted-foreground text-sm">#{order.id.slice(0, 8)}</p>}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Order Details */}
        {complaintType !== 'review' && (
          <Card className="border shadow-sm rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">פרטי ההזמנה</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : order ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ספק:</span>
                    <span className="font-medium">{order.supplierName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">שירות:</span>
                    <span className="font-medium">{order.serviceName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">תאריך:</span>
                    <span className="font-medium">{new Date(order.orderDate).toLocaleDateString('he-IL')}</span>
                  </div>
                  {order.totalAmount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">סכום:</span>
                      <span className="font-bold">₪{order.totalAmount.toLocaleString()}</span>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground text-sm">לא נמצאו פרטי הזמנה</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Complaint Form */}
        <Card className="border shadow-sm rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">פרטי התלונה</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  סיבת התלונה <span className="text-destructive">*</span>
                </Label>
                <Select value={formData.reason} onValueChange={(value) => setFormData(prev => ({ ...prev, reason: value }))}>
                  <SelectTrigger className="w-full rounded-xl">
                    <SelectValue placeholder="בחר סיבת התלונה" />
                  </SelectTrigger>
                  <SelectContent>
                    {complaintReasons.map((reason) => (
                      <SelectItem key={reason.value} value={reason.value}>{reason.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  תיאור הבעיה <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="אנא תאר את הבעיה בפירוט..."
                  className="min-h-[120px] rounded-xl resize-none"
                />
              </div>

              {/* File Upload */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">צרף קבצים (אופציונלי)</Label>
                <input ref={fileInputRef} type="file" multiple accept="image/jpeg,image/png,application/pdf" onChange={handleFileUpload} className="hidden" />
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full h-12 border-dashed border-2 rounded-xl">
                  <Upload className="w-5 h-5 ml-2" />
                  העלה תמונות או מסמכים
                </Button>

                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(index)} className="p-1 h-auto text-destructive">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="refund"
                  checked={formData.requestRefund}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requestRefund: !!checked }))}
                />
                <Label htmlFor="refund" className="text-sm cursor-pointer">אני מבקש החזר כספי</Label>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full h-12 font-semibold rounded-xl" variant="destructive">
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
        <Card className="border rounded-xl bg-accent/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium mb-1">לפני שליחת התלונה</h4>
                <p className="text-sm text-muted-foreground">
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
