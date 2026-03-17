import React, { useState } from 'react';
import { SupplierHeader } from '@/components/SupplierHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Trash2, Percent, DollarSign, Gift, Truck } from 'lucide-react';
import { useSupplierCoupons, useCreateCoupon, useUpdateCoupon, useDeleteCoupon, Coupon } from '@/hooks/useCoupons';
import { showToast } from '@/utils/toast';
import { format } from 'date-fns';

const discountTypeLabels: Record<string, string> = {
  percentage: 'אחוז הנחה',
  fixed: 'סכום קבוע',
  free_shipping: 'משלוח חינם',
  gift: 'מתנה',
};

const discountTypeIcons: Record<string, React.ElementType> = {
  percentage: Percent,
  fixed: DollarSign,
  free_shipping: Truck,
  gift: Gift,
};

function getCouponStatus(coupon: Coupon): { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } {
  if (!coupon.is_active) return { label: 'לא פעיל', variant: 'secondary' };
  if (coupon.ends_at && new Date(coupon.ends_at) < new Date()) return { label: 'פג תוקף', variant: 'destructive' };
  if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) return { label: 'מלא', variant: 'destructive' };
  return { label: 'פעיל', variant: 'default' };
}

const emptyCoupon: {
  title: string; description: string; coupon_code: string;
  discount_type: 'percentage' | 'fixed' | 'free_shipping' | 'gift';
  discount_value: number; starts_at: string; ends_at: string;
  max_uses: string; min_order_amount: number; is_active: boolean;
  is_featured: boolean; image_url: string;
} = {
  title: '',
  description: '',
  coupon_code: '',
  discount_type: 'percentage',
  discount_value: 0,
  starts_at: new Date().toISOString().slice(0, 16),
  ends_at: '',
  max_uses: '',
  min_order_amount: 0,
  is_active: true,
  is_featured: false,
  image_url: '',
};

const SupplierCoupons: React.FC = () => {
  const { data: coupons = [], isLoading } = useSupplierCoupons();
  const createMutation = useCreateCoupon();
  const updateMutation = useUpdateCoupon();
  const deleteMutation = useDeleteCoupon();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyCoupon);

  const handleEdit = (coupon: Coupon) => {
    setEditingId(coupon.id);
    setForm({
      title: coupon.title,
      description: coupon.description || '',
      coupon_code: coupon.coupon_code || '',
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      starts_at: coupon.starts_at.slice(0, 16),
      ends_at: coupon.ends_at?.slice(0, 16) || '',
      max_uses: coupon.max_uses?.toString() || '',
      min_order_amount: coupon.min_order_amount,
      is_active: coupon.is_active,
      is_featured: coupon.is_featured,
      image_url: coupon.image_url || '',
    });
    setDialogOpen(true);
  };

  const handleNew = () => {
    setEditingId(null);
    setForm(emptyCoupon);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      showToast.error('יש להזין כותרת');
      return;
    }

    const payload: any = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      coupon_code: form.coupon_code.trim() || null,
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value) || 0,
      starts_at: new Date(form.starts_at).toISOString(),
      ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      min_order_amount: Number(form.min_order_amount) || 0,
      is_active: form.is_active,
      is_featured: form.is_featured,
      image_url: form.image_url.trim() || null,
    };

    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, ...payload });
        showToast.success('הקופון עודכן בהצלחה');
      } else {
        await createMutation.mutateAsync(payload);
        showToast.success('הקופון נוצר בהצלחה');
      }
      setDialogOpen(false);
    } catch {
      showToast.error('שגיאה בשמירת הקופון');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('למחוק את הקופון?')) return;
    try {
      await deleteMutation.mutateAsync(id);
      showToast.success('הקופון נמחק');
    } catch {
      showToast.error('שגיאה במחיקת הקופון');
    }
  };

  return (
    <div className="flex w-full min-h-screen flex-col bg-background">
      <SupplierHeader title="ניהול קופונים ומבצעים" />
      <main className="w-full max-w-5xl mx-auto px-4 md:px-8 py-6 pb-nav-safe" dir="rtl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-foreground">הקופונים שלי</h1>
          <Button onClick={handleNew}>
            <Plus className="h-4 w-4 ml-2" />
            קופון חדש
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-muted/50 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : coupons.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <p>אין קופונים עדיין</p>
              <p className="text-sm mt-1">צרו קופון ראשון כדי להתחיל למשוך לקוחות!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>כותרת</TableHead>
                  <TableHead>סוג</TableHead>
                  <TableHead>קוד</TableHead>
                  <TableHead>סטטוס</TableHead>
                  <TableHead>שימושים</TableHead>
                  <TableHead>תפוגה</TableHead>
                  <TableHead>פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((coupon) => {
                  const status = getCouponStatus(coupon);
                  const Icon = discountTypeIcons[coupon.discount_type];
                  return (
                    <TableRow key={coupon.id}>
                      <TableCell className="font-medium">{coupon.title}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Icon className="h-3 w-3" />
                          {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` :
                           coupon.discount_type === 'fixed' ? `₪${coupon.discount_value}` :
                           discountTypeLabels[coupon.discount_type]}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{coupon.coupon_code || '—'}</TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                        {coupon.is_featured && <Badge variant="outline" className="mr-1 text-xs">דף הבית</Badge>}
                      </TableCell>
                      <TableCell>{coupon.current_uses}{coupon.max_uses ? `/${coupon.max_uses}` : ''}</TableCell>
                      <TableCell className="text-xs">
                        {coupon.ends_at ? format(new Date(coupon.ends_at), 'dd/MM/yyyy') : 'ללא הגבלה'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(coupon)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(coupon.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle>{editingId ? 'עריכת קופון' : 'קופון חדש'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>כותרת *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="למשל: 20% הנחה על מטבחים" />
              </div>
              <div>
                <Label>תיאור</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="תיאור קצר של המבצע" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>סוג הנחה</Label>
                  <Select value={form.discount_type} onValueChange={(v) => setForm({ ...form, discount_type: v as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">אחוז הנחה</SelectItem>
                      <SelectItem value="fixed">סכום קבוע (₪)</SelectItem>
                      <SelectItem value="free_shipping">משלוח חינם</SelectItem>
                      <SelectItem value="gift">מתנה</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>ערך הנחה</Label>
                  <Input type="number" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })} />
                </div>
              </div>
              <div>
                <Label>קוד קופון (אופציונלי)</Label>
                <Input value={form.coupon_code} onChange={(e) => setForm({ ...form, coupon_code: e.target.value })} placeholder="למשל: KITCHEN20" className="font-mono" dir="ltr" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>תאריך התחלה</Label>
                  <Input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} />
                </div>
                <div>
                  <Label>תאריך סיום</Label>
                  <Input type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>מגבלת שימושים</Label>
                  <Input type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} placeholder="ללא הגבלה" />
                </div>
                <div>
                  <Label>סכום הזמנה מינימלי (₪)</Label>
                  <Input type="number" value={form.min_order_amount} onChange={(e) => setForm({ ...form, min_order_amount: Number(e.target.value) })} />
                </div>
              </div>
              <div>
                <Label>קישור לתמונה</Label>
                <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." dir="ltr" />
              </div>
              <div className="flex items-center justify-between">
                <Label>פעיל</Label>
                <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              </div>
              <div className="flex items-center justify-between">
                <Label>הצג בדף הבית</Label>
                <Switch checked={form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} />
              </div>
            </div>
            <DialogFooter className="gap-2 mt-4">
              <DialogClose asChild>
                <Button variant="outline">ביטול</Button>
              </DialogClose>
              <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                {editingId ? 'עדכון' : 'צור קופון'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default SupplierCoupons;
