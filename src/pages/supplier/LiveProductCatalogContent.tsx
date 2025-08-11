import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { SearchInput } from "@/components/ui/search-input";
import { Plus, Edit, Trash2, Upload } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { productsService, DBProduct } from "@/services/productsService";
import { useToast } from "@/hooks/use-toast";

const currencySymbol = (c?: string) => (c === "ILS" || !c ? "₪" : c);

export default function LiveProductCatalogContent() {
  const { user } = useAuth();
  const { toast } = useToast();
  const supplierId = user?.id;

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<(DBProduct & { imagesSigned?: string[] })[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DBProduct | null>(null);
  const [form, setForm] = useState<{ name: string; description?: string; price?: number; currency?: string; files: File[] }>({
    name: "",
    description: "",
    price: undefined,
    currency: "ILS",
    files: [],
  });
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((p) => p.name.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q));
  }, [items, search]);

  async function load() {
    if (!supplierId) return;
    setLoading(true);
    try {
      const data = await productsService.listBySupplier(supplierId);
      setItems(data);
    } catch (e: any) {
      toast({ title: "שגיאה בטעינת מוצרים", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplierId]);

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", description: "", price: undefined, currency: "ILS", files: [] });
    setDialogOpen(true);
  };

  const openEdit = (p: DBProduct) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description || "", price: p.price ?? undefined, currency: p.currency || "ILS", files: [] });
    setDialogOpen(true);
  };

  async function save() {
    if (!supplierId) return;
    if (!form.name.trim()) {
      toast({ title: "שם מוצר נדרש", variant: "destructive" });
      return;
    }
    if (form.price != null && form.price < 0) {
      toast({ title: "המחיר חייב להיות מספר חיובי" , variant: "destructive"});
      return;
    }

    setSaving(true);
    try {
      let product: DBProduct;
      if (!editing) {
        const created = await productsService.create(supplierId, {
          name: form.name.trim(),
          description: form.description?.trim() || undefined,
          price: form.price,
          currency: form.currency || "ILS",
        });
        product = created;
      } else {
        product = await productsService.update(editing.id, {
          name: form.name.trim(),
          description: form.description?.trim() || undefined,
          price: form.price,
          currency: form.currency || "ILS",
        });
      }

      // Upload images if provided
      if (form.files.length > 0) {
        const paths: string[] = [...(product.images || [])];
        for (const f of form.files) {
          const { path } = await productsService.uploadImage(f, supplierId, product.id);
          paths.push(path);
        }
        product = await productsService.update(product.id, { images: paths as any });
      }

      toast({ title: editing ? "המוצר עודכן" : "המוצר נוצר" });
      setDialogOpen(false);
      setForm({ name: "", description: "", price: undefined, currency: "ILS", files: [] });
      setEditing(null);
      await load();
    } catch (e: any) {
      toast({ title: "פעולה נכשלה", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function remove(p: DBProduct) {
    if (!confirm("למחוק את המוצר?")) return;
    try {
      await productsService.remove(p.id);
      toast({ title: "המוצר נמחק" });
      await load();
    } catch (e: any) {
      toast({ title: "מחיקה נכשלה", description: e.message, variant: "destructive" });
    }
  }

  async function toggle(p: DBProduct, checked: boolean) {
    if (checked && (!p.name || p.price == null)) {
      toast({ title: "כדי לפרסם יש למלא שם ומחיר", variant: "destructive" });
      return;
    }
    try {
      await productsService.togglePublish(p.id, checked, supplierId);
      setItems((cur) => cur.map((it) => (it.id === p.id ? { ...it, is_published: checked } : it)));
      toast({ title: checked ? "המוצר פורסם" : "הפרסום בוטל" });
    } catch (e: any) {
      toast({ title: "עדכון סטטוס נכשל", description: e.message, variant: "destructive" });
    }
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="bg-white border-b border-border sticky top-0 z-10">
        <div className="mobile-container px-4 xs:px-5 sm:px-6 py-3 xs:py-4">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-lg xs:text-xl sm:text-2xl font-bold">קטלוג מוצרים ושירותים</h1>
            <Button variant="blue" onClick={openNew}>
              <Plus className="w-4 h-4 ml-1" /> הוסף מוצר/שירות
            </Button>
          </div>
        </div>
      </div>

      <div className="mobile-container px-4 xs:px-5 sm:px-6 py-4 xs:py-5 sm:py-6 pb-nav-safe">
        <div className="flex items-center gap-2 mb-4">
          <SearchInput placeholder="חפש..." value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch("")} />
        </div>

        {loading ? (
          <Card className="mobile-card">
            <CardContent className="p-6">טוען...</CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="mobile-card">
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">אין מוצרים עדיין</p>
              <Button variant="blue" onClick={openNew}>
                <Plus className="w-4 h-4 ml-1" /> הוסף מוצר ראשון
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="mobile-grid gap-3 xs:gap-4 sm:gap-5 lg:gap-6">
            {filtered.map((p) => (
              <Card key={p.id} className="mobile-card hover:shadow-md transition-shadow">
                <div className="relative">
                  <img
                    src={p.imagesSigned?.[0] || "/placeholder.svg"}
                    alt={p.name}
                    className="w-full h-40 sm:h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-2 left-2">
                    {p.is_published ? (
                      <Badge className="bg-green-100 text-green-800 text-xs">פורסם</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800 text-xs">מוסתר</Badge>
                    )}
                  </div>
                </div>
                <CardHeader className="pb-2 p-3 xs:p-4">
                  <CardTitle className="text-base xs:text-lg text-wrap-balance">{p.name}</CardTitle>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs xs:text-sm text-muted-foreground truncate">{p.description}</span>
                    <span className="font-bold text-primary text-xs xs:text-sm shrink-0">
                      {currencySymbol(p.currency)}{p.price ?? ""}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 p-3 xs:p-4 pt-0">
                  <div className="flex items-center justify-between pt-2 gap-2">
                    <div className="flex items-center gap-2">
                      <Switch checked={p.is_published} onCheckedChange={(c) => toggle(p, c)} />
                      <span className="text-xs xs:text-sm text-muted-foreground">{p.is_published ? "מוצג" : "מוסתר"}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => openEdit(p)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => remove(p)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "עריכת מוצר" : "מוצר חדש"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>שם *</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <Label>מחיר</Label>
              <Input type="number" inputMode="numeric" value={form.price ?? ""} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value ? Number(e.target.value) : undefined }))} />
            </div>
            <div>
              <Label>תיאור</Label>
              <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div>
              <Label>תמונות (ניתן לבחור מספר קבצים)</Label>
              <Input type="file" accept="image/*" multiple onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setForm((f) => ({ ...f, files }));
              }} />
              {form.files.length > 0 && (
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {form.files.map((f, i) => (
                    <div key={i} className="text-xs text-muted-foreground truncate">{f.name}</div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>ביטול</Button>
            <Button variant="blue" onClick={save} disabled={saving}>
              {saving ? "שומר..." : editing ? "עדכון" : "שמירה"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
