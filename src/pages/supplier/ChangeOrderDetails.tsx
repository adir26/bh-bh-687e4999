import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Download } from "lucide-react";
import { useChangeOrder } from "@/hooks/useChangeOrders";
import { ChangeOrderForm } from "@/components/orders/ChangeOrderForm";
import { isFeatureEnabled } from "@/config/featureFlags";

export default function ChangeOrderDetails() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEditMode = searchParams.get('edit') === 'true';

  const { data, isLoading, refetch } = useChangeOrder(id!);

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

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="space-y-6">
          <div className="h-8 bg-muted animate-pulse rounded" />
          <div className="h-96 bg-muted animate-pulse rounded-lg" />
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              צו השינוי לא נמצא
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { changeOrder, items, events } = data;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">צו שינוי {changeOrder.co_number}</h1>
          <p className="text-muted-foreground">{changeOrder.title}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
          >
            <ArrowRight className="h-4 w-4 ml-2" />
            חזרה
          </Button>
          {changeOrder.status === 'approved' && (
            <Button variant="outline">
              <Download className="h-4 w-4 ml-2" />
              הורד PDF
            </Button>
          )}
        </div>
      </div>

      {/* Main Form */}
      <ChangeOrderForm
        changeOrder={changeOrder}
        items={items}
        onUpdate={refetch}
        readOnly={!isEditMode || changeOrder.status !== 'draft'}
      />

      {/* Events Timeline */}
      {events.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium mb-4">היסטוריית אירועים</h3>
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-muted-foreground">
                    {new Date(event.created_at).toLocaleString('he-IL')}
                  </span>
                  <span>{event.event_type}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}