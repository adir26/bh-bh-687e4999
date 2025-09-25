import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Upload, Share2, Save, Settings, Download, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { MoodBoardItem } from '@/components/moodboard/MoodBoardItem';
import { useMoodBoard, useMoodBoardItems, useMoodBoardComments, useMoodBoardReactions, useUpdateMoodBoard, useCreateMoodBoardItem, useUpdateMoodBoardItem, useDeleteMoodBoardItem, useAddItemToSelections } from '@/hooks/useMoodBoards';
import { useSelectionGroups } from '@/hooks/useSelections';
import { isFeatureEnabled } from '@/config/featureFlags';
import { toast } from 'sonner';

export function MoodBoardEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showSelectionsDialog, setShowSelectionsDialog] = useState(false);
  const [selectedItemForSelections, setSelectedItemForSelections] = useState<string | null>(null);
  
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    image_url: '',
    price: '',
    currency: 'ILS'
  });

  const { data: moodBoard, isLoading: boardLoading } = useMoodBoard(id!);
  const { data: items = [], isLoading: itemsLoading } = useMoodBoardItems(id!);
  const { data: comments = [] } = useMoodBoardComments(id!);
  const { data: reactions = [] } = useMoodBoardReactions(id!);
  const { data: selectionGroups = [] } = useSelectionGroups(moodBoard?.order_id);
  
  const updateMoodBoard = useUpdateMoodBoard();
  const createItem = useCreateMoodBoardItem();
  const deleteItem = useDeleteMoodBoardItem();
  const addToSelections = useAddItemToSelections();

  if (!isFeatureEnabled('MOOD_BOARDS_ENABLED')) {
    return (
      <div className="container mx-auto p-6">
        <EmptyState
          title="תכונה לא זמינה"
          description="תכונת לוחות הרגש אינה פעילה כרגע"
        />
      </div>
    );
  }

  if (boardLoading || itemsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!moodBoard) {
    return (
      <div className="container mx-auto p-6">
        <EmptyState
          title="לוח רגש לא נמצא"
          description="לוח הרגש המבוקש לא קיים או שאין לך הרשאה לצפות בו"
        />
      </div>
    );
  }

  const handleAddItem = async () => {
    if (!newItem.title.trim() || !newItem.image_url.trim()) {
      toast.error('נא למלא את השדות הנדרשים');
      return;
    }

    try {
      await createItem.mutateAsync({
        mood_board_id: id!,
        title: newItem.title,
        description: newItem.description || undefined,
        image_url: newItem.image_url,
        price: newItem.price ? parseFloat(newItem.price) : undefined,
        currency: newItem.currency,
        display_order: items.length
      });
      
      setShowAddItemDialog(false);
      setNewItem({ title: '', description: '', image_url: '', price: '', currency: 'ILS' });
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleShare = () => {
    if (moodBoard.status !== 'shared') {
      updateMoodBoard.mutate({
        id: moodBoard.id,
        updates: { status: 'shared' }
      });
    }
    
    const shareUrl = `${window.location.origin}/boards/${moodBoard.share_token}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('קישור הושתף לזכרון המכשיר');
  };

  const handleAddToSelections = async (itemId: string, selectionGroupId: string) => {
    try {
      await addToSelections.mutateAsync({ itemId, selectionGroupId });
      setShowSelectionsDialog(false);
      setSelectedItemForSelections(null);
    } catch (error) {
      console.error('Error adding to selections:', error);
    }
  };

  const getItemComments = (itemId: string) => 
    comments.filter(comment => comment.item_id === itemId);
  
  const getItemReactions = (itemId: string) => 
    reactions.filter(reaction => reaction.item_id === itemId);

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => navigate('/supplier/mood-boards')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{moodBoard.title}</h1>
          {moodBoard.description && (
            <p className="text-muted-foreground">{moodBoard.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={moodBoard.status === 'shared' ? 'default' : 'secondary'}>
            {moodBoard.status === 'draft' ? 'טיוטה' : 'משותף'}
          </Badge>
          <Button onClick={handleShare} size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            שתף
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <Button onClick={() => setShowAddItemDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          הוסף פריט
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="אין פריטים בלוח הרגש עדיין"
          description="הוסף פריטים כדי להתחיל לבנות את לוח הרגש שלך"
          action={
            <Button onClick={() => setShowAddItemDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              הוסף פריט ראשון
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <MoodBoardItem
              key={item.id}
              item={item}
              reactions={getItemReactions(item.id)}
              commentsCount={getItemComments(item.id).length}
              canEdit={true}
              onEdit={() => console.log('Edit item:', item)}
              onDelete={(itemId) => deleteItem.mutate(itemId)}
              onAddToSelections={(itemId) => {
                setSelectedItemForSelections(itemId);
                setShowSelectionsDialog(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Add Item Dialog */}
      <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>הוסף פריט חדש</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="item-title">שם הפריט *</Label>
              <Input
                id="item-title"
                value={newItem.title}
                onChange={(e) => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                placeholder="הזן שם הפריט"
              />
            </div>
            <div>
              <Label htmlFor="item-image">URL תמונה *</Label>
              <Input
                id="item-image"
                value={newItem.image_url}
                onChange={(e) => setNewItem(prev => ({ ...prev, image_url: e.target.value }))}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="flex gap-4">
              <Button onClick={handleAddItem} disabled={createItem.isPending} className="flex-1">
                {createItem.isPending ? 'מוסיף...' : 'הוסף פריט'}
              </Button>
              <Button variant="outline" onClick={() => setShowAddItemDialog(false)} className="flex-1">
                ביטול
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Selections Dialog */}
      <Dialog open={showSelectionsDialog} onOpenChange={setShowSelectionsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>הוסף לבחירות</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectionGroups.length === 0 ? (
              <p className="text-muted-foreground">אין קבוצות בחירות זמינות</p>
            ) : (
              <div className="space-y-2">
                {selectionGroups.map((group) => (
                  <Button
                    key={group.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleAddToSelections(selectedItemForSelections!, group.id)}
                  >
                    {group.name}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}