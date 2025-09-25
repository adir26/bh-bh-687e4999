import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, Send } from "lucide-react";
import { ChangeOrder, ChangeOrderItem, changeOrdersService } from "@/services/changeOrdersService";
import { useAddChangeOrderItem, useUpdateChangeOrder, useSendForApproval } from "@/hooks/useChangeOrders";

const itemSchema = z.object({
  item_type: z.enum(['addition', 'removal', 'modification']),
  name: z.string().min(1, "שם הפריט נדרש"),
  description: z.string().optional(),
  quantity: z.number().min(0.01, "כמות חייבת להיות חיובית"),
  unit_price: z.number().min(0, "מחיר יחידה לא יכול להיות שלילי"),
});

const changeOrderSchema = z.object({
  title: z.string().min(1, "כותרת נדרשת"),
  description: z.string().optional(),
  time_delta_days: z.number().int(),
});

type ItemFormData = z.infer<typeof itemSchema>;
type ChangeOrderFormData = z.infer<typeof changeOrderSchema>;

interface ChangeOrderFormProps {
  changeOrder: ChangeOrder;
  items: ChangeOrderItem[];
  onUpdate: () => void;
  readOnly?: boolean;
}

const itemTypeLabels = {
  addition: 'תוספת',
  removal: 'הסרה',
  modification: 'שינוי'
};

export function ChangeOrderForm({ changeOrder, items, onUpdate, readOnly = false }: ChangeOrderFormProps) {
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<ChangeOrderItem | null>(null);

  const updateChangeOrder = useUpdateChangeOrder();
  const addItem = useAddChangeOrderItem();
  const sendForApproval = useSendForApproval();

  const form = useForm<ChangeOrderFormData>({
    resolver: zodResolver(changeOrderSchema),
    defaultValues: {
      title: changeOrder.title,
      description: changeOrder.description || '',
      time_delta_days: changeOrder.time_delta_days,
    },
  });

  const itemForm = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      item_type: 'addition',
      name: '',
      description: '',
      quantity: 1,
      unit_price: 0,
    },
  });

  const onSubmitChangeOrder = async (data: ChangeOrderFormData) => {
    const totals = changeOrdersService.calculateTotals(items);
    
    await updateChangeOrder.mutateAsync({
      id: changeOrder.id,
      updates: {
        ...data,
        subtotal: totals.subtotal,
        total_amount: totals.total,
        tax_amount: totals.total - totals.subtotal,
      }
    });
    onUpdate();
  };

  const onSubmitItem = async (data: ItemFormData) => {
    const lineTotal = data.quantity * data.unit_price;
    const adjustedTotal = data.item_type === 'removal' ? -Math.abs(lineTotal) : Math.abs(lineTotal);

    await addItem.mutateAsync({
      change_order_id: changeOrder.id,
      item_type: data.item_type,
      name: data.name,
      description: data.description,
      quantity: data.quantity,
      unit_price: data.unit_price,
      line_total: adjustedTotal,
    });

    itemForm.reset();
    setIsAddingItem(false);
    onUpdate();
  };

  const handleSendForApproval = async () => {
    if (items.length < 2) {
      alert('צו שינוי חייב לכלול לפחות 2 פריטים');
      return;
    }
    await sendForApproval.mutateAsync(changeOrder.id);
    onUpdate();
  };

  const totals = changeOrdersService.calculateTotals(items);
  const canEdit = !readOnly && changeOrder.status === 'draft';

  return (
    <div className="space-y-6">
      {/* Change Order Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>פרטי צו השינוי</span>
            <Badge variant={changeOrder.status === 'approved' ? 'default' : 'secondary'}>
              {changeOrder.co_number}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitChangeOrder)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>כותרת</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={!canEdit} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>תיאור</FormLabel>
                    <FormControl>
                      <Textarea {...field} disabled={!canEdit} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time_delta_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>שינוי בזמן (ימים)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        disabled={!canEdit}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {canEdit && (
                <Button type="submit" disabled={updateChangeOrder.isPending}>
                  <Save className="h-4 w-4 ml-2" />
                  שמור שינויים
                </Button>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>פריטי צו השינוי</CardTitle>
            {canEdit && (
              <Button
                onClick={() => setIsAddingItem(true)}
                size="sm"
              >
                <Plus className="h-4 w-4 ml-2" />
                הוסף פריט
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Items */}
          {items.map((item) => (
            <div key={item.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">
                      {itemTypeLabels[item.item_type]}
                    </Badge>
                    <h4 className="font-medium">{item.name}</h4>
                  </div>
                  {item.description && (
                    <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm">
                    <span>כמות: {item.quantity}</span>
                    <span>מחיר יחידה: ₪{Math.abs(item.unit_price).toLocaleString()}</span>
                    <span className="font-medium">
                      סה"כ: {item.line_total >= 0 ? '+' : '-'}₪{Math.abs(item.line_total).toLocaleString()}
                    </span>
                  </div>
                </div>
                {canEdit && (
                  <Button variant="ghost" size="sm" className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}

          {/* Add Item Form */}
          {isAddingItem && canEdit && (
            <Card className="border-dashed">
              <CardContent className="pt-6">
                <Form {...itemForm}>
                  <form onSubmit={itemForm.handleSubmit(onSubmitItem)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={itemForm.control}
                        name="item_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>סוג פריט</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="addition">תוספת</SelectItem>
                                <SelectItem value="removal">הסרה</SelectItem>
                                <SelectItem value="modification">שינוי</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={itemForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>שם הפריט</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={itemForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>תיאור</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={itemForm.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>כמות</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={itemForm.control}
                        name="unit_price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>מחיר יחידה</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button type="submit" disabled={addItem.isPending}>
                        <Save className="h-4 w-4 ml-2" />
                        הוסף פריט
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddingItem(false)}
                      >
                        ביטול
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {/* Totals */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">סכום ביניים:</span>
                <p className="font-medium">₪{totals.subtotal.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-muted-foreground">מע"מ (17%):</span>
                <p className="font-medium">₪{(totals.total - totals.subtotal).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-muted-foreground">סה"כ:</span>
                <p className="text-lg font-bold">₪{totals.total.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          {canEdit && (
            <div className="flex gap-2 pt-4 border-t">
              <Button
                onClick={handleSendForApproval}
                disabled={items.length < 2 || sendForApproval.isPending}
                className="flex-1"
              >
                <Send className="h-4 w-4 ml-2" />
                שלח לאישור לקוח
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
