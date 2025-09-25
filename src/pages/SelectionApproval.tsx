import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSelectionApprovalByToken, useApproveSelections } from '@/hooks/useSelections';
import { getSelectionItems } from '@/services/selectionsService';
import { AlertTriangle, CheckCircle, Package, DollarSign, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function SelectionApproval() {
  const { slug, orderId, groupId } = useParams<{ 
    slug: string; 
    orderId: string; 
    groupId?: string; 
  }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [totals, setTotals] = useState({
    total: 0,
    allowance: 0,
    overAllowance: 0,
  });

  const { data: approval, isLoading } = useSelectionApprovalByToken(token || '');
  const approveMutation = useApproveSelections();

  // Fetch selection items when approval data is loaded
  useEffect(() => {
    if (approval?.group_id) {
      getSelectionItems(approval.group_id)
        .then(setItems)
        .catch(err => {
          console.error('Error loading selection items:', err);
          toast.error('Error loading selection options');
        });
    }
  }, [approval?.group_id]);

  // Recalculate totals when selections change
  useEffect(() => {
    if (items.length > 0 && approval) {
      const total = selectedItems.reduce((sum, itemId) => {
        const item = items.find(i => i.id === itemId);
        return sum + (item?.price || 0);
      }, 0);

      const overAllowance = Math.max(0, total - approval.allowance_amount);

      setTotals({
        total,
        allowance: approval.allowance_amount,
        overAllowance,
      });
    }
  }, [selectedItems, items, approval]);

  const handleItemToggle = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  };

  const handleApprove = () => {
    if (!token || selectedItems.length === 0) {
      toast.error('Please select at least one option');
      return;
    }

    approveMutation.mutate({
      token,
      selectedItems,
    }, {
      onSuccess: () => {
        toast.success('Selections approved successfully!');
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="container mx-auto max-w-4xl">
          <Card className="animate-pulse">
            <CardHeader className="h-24 bg-muted" />
            <CardContent className="h-96 bg-muted" />
          </Card>
        </div>
      </div>
    );
  }

  if (!approval || !token) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h3 className="text-lg font-medium mb-2">Invalid or Expired Link</h3>
            <p className="text-muted-foreground">
              This selection approval link is invalid or has expired. Please contact your supplier for a new link.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (approval.approved_at) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">Already Approved</h3>
            <p className="text-muted-foreground">
              These selections have already been approved on {new Date(approval.approved_at).toLocaleDateString()}.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">Selection Approval</CardTitle>
                <p className="text-muted-foreground">
                  Please review and approve your selections for {(approval as any).selection_groups?.name}
                </p>
              </div>
              <Badge variant="outline" className="text-sm">
                <Clock className="h-3 w-3 mr-1" />
                Expires {new Date(approval.expires_at).toLocaleDateString()}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">₪{totals.allowance.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Allowance</div>
              </div>
              <div>
                <div className="text-2xl font-bold">₪{totals.total.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Selected Total</div>
              </div>
              <div>
                <div className={`text-2xl font-bold ${totals.overAllowance > 0 ? 'text-destructive' : 'text-green-600'}`}>
                  ₪{totals.overAllowance.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Over Allowance</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Over allowance warning */}
        {totals.overAllowance > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Your current selections exceed the allowance by ₪{totals.overAllowance.toLocaleString()}. 
              Additional charges may apply.
            </AlertDescription>
          </Alert>
        )}

        {/* Selection Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Available Options
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {items.length > 0 ? (
              items.map(item => (
                <div key={item.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={(checked) => handleItemToggle(item.id, checked as boolean)}
                      className="mt-1"
                    />
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium">{item.name}</h4>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          ₪{item.price.toLocaleString()}
                        </Badge>
                      </div>
                      
                      {item.description && (
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      )}
                      
                      {item.image_url && (
                        <img 
                          src={item.image_url} 
                          alt={item.name}
                          className="w-32 h-24 object-cover rounded border"
                        />
                      )}
                      
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        {item.sku && <span>SKU: {item.sku}</span>}
                        {item.specifications && Object.keys(item.specifications).length > 0 && (
// In SelectionApproval.tsx - fix the type issue
                          <div className="flex gap-2">
                            {Object.entries(item.specifications as Record<string, string>).map(([key, value]) => (
                              <Badge key={key} variant="secondary" className="text-xs">
                                {key}: {String(value)}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No options available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Approval Actions */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                By approving, you confirm your selection choices and agree to any additional charges.
              </div>
              
              <Button
                onClick={handleApprove}
                disabled={selectedItems.length === 0 || approveMutation.isPending}
                size="lg"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Selections ({selectedItems.length})
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}