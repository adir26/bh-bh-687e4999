import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';
import { EmptyState } from '@/components/ui/empty-state';
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
        <EmptyState
          title="תכונה לא זמינה"
          description="תכונת לוחות הרגש אינה פעילה כרגע"
        />
      </div>
    );
  }

  const handleCreate = async () => {
    if (!newMoodBoard.title.trim()) {
      toast.error('נא להזין שם للوח הרגש');
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
        <PageHeader
          title="לוחות רגש"
          description="נהל לוחות רגש ושתף אותם עם לקוחות"
        />
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
      <PageHeader
        title="לוחות רגש"
        action={
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
                    placeholder="הזן שם للوח"
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
        }
      />

      {!moodBoards || moodBoards.length === 0 ? (
        <EmptyState
          title="אין לוחות רגש עדיין"
          description="צור לוח רגש ראשון כדי להתחיל לשתף אותו עם לקוחות"
          action={
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              צור לוח רגש ראשון
            </Button>
          }
        />
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