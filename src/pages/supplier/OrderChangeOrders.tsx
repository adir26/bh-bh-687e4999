import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowRight } from "lucide-react";
import { useChangeOrdersForOrder, useCreateChangeOrder } from "@/hooks/useChangeOrders";
import { ChangeOrderCard } from "@/components/orders/ChangeOrderCard";
import { isFeatureEnabled } from "@/config/featureFlags";
import { useAuth } from "@/contexts/AuthContext";

export default function OrderChangeOrders() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);

  const { data: changeOrders, isLoading } = useChangeOrdersForOrder(orderId!);
  const createChangeOrder = useCreateChangeOrder();

  if (!isFeatureEnabled('CHANGE_ORDERS_ENABLED')) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              תכונת צווי השינוי אינה זמינה כרגע
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCreateChangeOrder = async () => {
    if (!orderId || !user) return;

    setIsCreating(true);
    try {
      const newCO = await createChangeOrder.mutateAsync({
        order_id: orderId,
        supplier_id: user.id, // This should be the supplier ID
        client_id: 'client-id', // This should come from the order
        title: 'צו שינוי חדש',
        subtotal: 0,
        total_amount: 0,
        time_delta_days: 0,
        status: 'draft' as const,
        created_by: user.id,
      });

      navigate(`/supplier/change-orders/${newCO.id}?edit=true`);
    } catch (error) {
      console.error('Error creating change order:', error);
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">צווי שינוי</h1>
          <p className="text-muted-foreground">הזמנה #{orderId?.slice(0, 8)}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
          >
            <ArrowRight className="h-4 w-4 ml-2" />
            חזרה
          </Button>
          <Button
            onClick={handleCreateChangeOrder}
            disabled={isCreating}
          >
            <Plus className="h-4 w-4 ml-2" />
            צור צו שינוי חדש
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{changeOrders?.length || 0}</div>
            <p className="text-xs text-muted-foreground">סה"כ צווי שינוי</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {changeOrders?.filter(co => co.status === 'pending_approval').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">ממתינים לאישור</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {changeOrders?.filter(co => co.status === 'approved').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">אושרו</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              ₪{changeOrders?.filter(co => co.status === 'approved')
                .reduce((sum, co) => sum + co.total_amount, 0)
                .toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">סה"כ שינויים אושרו</p>
          </CardContent>
        </Card>
      </div>

      {/* Change Orders List */}
      <div className="space-y-4">
        {changeOrders?.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <h3 className="text-lg font-medium mb-2">אין צווי שינוי</h3>
                <p className="text-muted-foreground mb-4">
                  טרם נוצרו צווי שינוי עבור הזמנה זו
                </p>
                <Button onClick={handleCreateChangeOrder} disabled={isCreating}>
                  <Plus className="h-4 w-4 ml-2" />
                  צור צו שינוי ראשון
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {changeOrders?.map((changeOrder) => (
              <ChangeOrderCard
                key={changeOrder.id}
                changeOrder={changeOrder}
                showActions={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}