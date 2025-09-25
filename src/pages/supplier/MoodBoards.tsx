import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { MoodBoardCard } from '@/components/moodboard/MoodBoardCard';
import { useMoodBoards, useCreateMoodBoard, useDeleteMoodBoard } from '@/hooks/useMoodBoards';
import { isFeatureEnabled } from '@/config/featureFlags';
import { toast } from 'sonner';

export function MoodBoards() {
  const navigate = useNavigate();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newMoodBoard, setNewMoodBoard] = useState({
    title: '',
    description: '',
    order_id: '',
    client_id: ''
  });

  const { data: moodBoards, isLoading } = useMoodBoards();
  const createMoodBoard = useCreateMoodBoard();
  const deleteMoodBoard = useDeleteMoodBoard();

  if (!isFeatureEnabled('MOOD_BOARDS_ENABLED')) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">תכונה לא זמינה</h3>
          <p className="text-muted-foreground">תכונת לוחות הרגש אינה פעילה כרגע</p>
        </div>
      </div>
    );
  }

  const handleCreate = async () => {
    if (!newMoodBoard.title.trim()) {
      toast.error('נא להזין שם לוח הרגש');
      return;
    }

    try {
      const moodBoard = await createMoodBoard.mutateAsync({
        title: newMoodBoard.title,
        description: newMoodBoard.description || undefined,
        order_id: newMoodBoard.order_id || undefined,
        client_id: newMoodBoard.client_id || undefined
      });
      
      setShowCreateDialog(false);
      setNewMoodBoard({ title: '', description: '', order_id: '', client_id: '' });
      navigate(`/supplier/mood-boards/${moodBoard.id}`);
    } catch (error) {
      console.error('Error creating mood board:', error);
    }
  };

  const handleShare = (token: string) => {
    const shareUrl = `${window.location.origin}/boards/${token}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('קישור הושתף לזכרון המכשיר');
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      await deleteMoodBoard.mutateAsync(deleteId);
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting mood board:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">לוחות רגש</h1>
            <p className="text-muted-foreground">נהל לוחות רגש ושתף אותם עם לקוחות</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">לוחות רגש</h1>
          <p className="text-muted-foreground">נהל לוחות רגש ושתף אותם עם לקוחות</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              לוח רגש חדש
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>יצירת לוח רגש חדש</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">שם הלוח *</Label>
                <Input
                  id="title"
                  value={newMoodBoard.title}
                  onChange={(e) => setNewMoodBoard(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="הזן שם לוח"
                />
              </div>
              <div>
                <Label htmlFor="description">תיאור</Label>
                <Textarea
                  id="description"
                  value={newMoodBoard.description}
                  onChange={(e) => setNewMoodBoard(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="תיאור קצר של הלוח"
                  rows={3}
                />
              </div>
              <div className="flex gap-4">
                <Button onClick={handleCreate} disabled={createMoodBoard.isPending} className="flex-1">
                  {createMoodBoard.isPending ? 'יוצר...' : 'צור לוח'}
                </Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">
                  ביטול
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {!moodBoards || moodBoards.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">אין לוחות רגש עדיין</h3>
          <p className="text-muted-foreground mb-4">צור לוח רגש ראשון כדי להתחיל לשתף אותו עם לקוחות</p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            צור לוח רגש ראשון
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {moodBoards.map((moodBoard) => (
            <MoodBoardCard
              key={moodBoard.id}
              moodBoard={moodBoard}
              onView={(id) => navigate(`/supplier/mood-boards/${id}`)}
              onEdit={(id) => navigate(`/supplier/mood-boards/${id}`)}
              onShare={handleShare}
              onDelete={setDeleteId}
            />
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>מחיקת לוח רגש</AlertDialogTitle>
            <AlertDialogDescription>
              האם אתה בטוח שאתה רוצה למחוק לוח רגש זה? פעולה זו אינה ניתנת לביטול.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              מחק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}