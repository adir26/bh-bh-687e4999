import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { SelectionGroupCard } from '@/components/selections/SelectionGroupCard';
import { SelectionItemForm } from '@/components/selections/SelectionItemForm';
import { useSelectionGroups, useCreateSelectionGroup, useCreateSelectionItem, useCreateSelectionApproval } from '@/hooks/useSelections';
import { FEATURES } from '@/config/featureFlags';
import { Plus, ArrowLeft, Package, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function OrderSelections() {
  const { id: orderId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [showItemForm, setShowItemForm] = useState<string | null>(null);
  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    allowance_amount: 0,
  });

  const { data: selectionGroups, isLoading } = useSelectionGroups(orderId);
  const createGroupMutation = useCreateSelectionGroup();
  const createItemMutation = useCreateSelectionItem();
  const createApprovalMutation = useCreateSelectionApproval();

  if (!FEATURES.SELECTIONS_ENABLED) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Selections Feature Coming Soon</h3>
            <p className="text-muted-foreground">
              The selections feature is not yet available. Please check back later.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleCreateGroup = () => {
    if (!orderId) return;
    
    createGroupMutation.mutate({
      order_id: orderId,
      supplier_id: 'current-supplier-id', // This should come from auth context
      ...groupForm,
      display_order: selectionGroups?.length || 0,
      is_active: true,
    }, {
      onSuccess: () => {
        setShowGroupForm(false);
        setGroupForm({ name: '', description: '', allowance_amount: 0 });
      }
    });
  };

  const handleCreateItem = (groupId: string, itemData: any) => {
    createItemMutation.mutate({
      group_id: groupId,
      ...itemData,
      display_order: 0,
      is_available: true,
    }, {
      onSuccess: () => {
        setShowItemForm(null);
      }
    });
  };

  const handleSendApproval = (groupId: string) => {
    if (!orderId) return;
    
    const group = selectionGroups?.find(g => g.id === groupId);
    if (!group) return;

    if (group.items.length === 0) {
      toast.error('Please add at least one option before sending for approval');
      return;
    }

    createApprovalMutation.mutate({
      group_id: groupId,
      order_id: orderId,
      client_id: 'client-id-from-order', // This should come from the order data
      selected_items: [],
      total_amount: 0,
      allowance_amount: group.allowance_amount,
      over_allowance_amount: 0,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-20 bg-muted" />
              <CardContent className="h-32 bg-muted" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Order
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Order Selections</h1>
            <p className="text-muted-foreground">Manage client selection groups and options</p>
          </div>
        </div>
        
        <Button onClick={() => setShowGroupForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Selection Group
        </Button>
      </div>

      {showGroupForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Selection Group</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="group-name">Group Name *</Label>
                <Input
                  id="group-name"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Flooring Options"
                />
              </div>
              <div>
                <Label htmlFor="allowance">Allowance Amount (₪)</Label>
                <Input
                  id="allowance"
                  type="number"
                  value={groupForm.allowance_amount}
                  onChange={(e) => setGroupForm(prev => ({ ...prev, allowance_amount: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="group-description">Description</Label>
              <Textarea
                id="group-description"
                value={groupForm.description}
                onChange={(e) => setGroupForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description of this selection group"
                rows={3}
              />
            </div>
            
            <div className="flex gap-3">
              <Button onClick={handleCreateGroup} disabled={!groupForm.name}>
                Create Group
              </Button>
              <Button variant="outline" onClick={() => setShowGroupForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {selectionGroups && selectionGroups.length > 0 ? (
        <div className="grid gap-6">
          {selectionGroups.map(group => (
            <div key={group.id} className="space-y-4">
              <SelectionGroupCard
                group={group}
                onManage={() => setShowItemForm(group.id)}
                onSendApproval={() => handleSendApproval(group.id)}
              />
              
              {showItemForm === group.id && (
                <SelectionItemForm
                  groupId={group.id}
                  onSubmit={(data) => handleCreateItem(group.id, data)}
                  onCancel={() => setShowItemForm(null)}
                />
              )}

              {group.items.length > 0 && (
                <div className="ml-6 grid gap-3">
                  <h4 className="font-medium text-sm text-muted-foreground">
                    Available Options ({group.items.length})
                  </h4>
                  {group.items.map(item => (
                    <Card key={item.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h5 className="font-medium">{item.name}</h5>
                          {item.description && (
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm">
                            <Badge variant="outline">₪{item.price.toLocaleString()}</Badge>
                            {item.sku && <span className="text-muted-foreground">SKU: {item.sku}</span>}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Selection Groups Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create selection groups to organize client choices like flooring, paint colors, fixtures, etc.
            </p>
            <Button onClick={() => setShowGroupForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Group
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}