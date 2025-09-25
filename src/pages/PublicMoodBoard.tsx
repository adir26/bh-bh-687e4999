import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { MoodBoardItem } from '@/components/moodboard/MoodBoardItem';
import { useMoodBoardByToken, useMoodBoardItems, useMoodBoardComments, useMoodBoardReactions, useAddComment, useAddReaction } from '@/hooks/useMoodBoards';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';
import { toast } from 'sonner';

export function PublicMoodBoard() {
  const { token } = useParams<{ token: string }>();
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [clientData, setClientData] = useState({ name: '', email: '' });
  const [commentText, setCommentText] = useState('');

  const { data: moodBoard, isLoading: boardLoading } = useMoodBoardByToken(token!);
  const { data: items = [], isLoading: itemsLoading } = useMoodBoardItems(moodBoard?.id || '');
  const { data: comments = [] } = useMoodBoardComments(moodBoard?.id || '');
  const { data: reactions = [] } = useMoodBoardReactions(moodBoard?.id || '');
  
  const addComment = useAddComment();
  const addReaction = useAddReaction();

  if (boardLoading || itemsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6">
          <div className="text-center mb-8">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-80 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!moodBoard) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <EmptyState
          title="לוח רגש לא נמצא"
          description="הקישור שהשתמשת בו אינו תקין או שלוח הרגש אינו זמין יותר"
        />
      </div>
    );
  }

  const handleReact = async (itemId: string | null, type: 'like' | 'love') => {
    if (!moodBoard.client_can_interact) {
      toast.error('תגובות אינן מופעלות עבור לוח רגש זה');
      return;
    }

    try {
      // Use a simple client identifier based on session/browser
      const clientIdentifier = localStorage.getItem('client_id') || 
        (() => {
          const id = Math.random().toString(36).substr(2, 9);
          localStorage.setItem('client_id', id);
          return id;
        })();

      await addReaction.mutateAsync({
        moodBoardId: moodBoard.id,
        itemId,
        reactionType: type,
        clientIdentifier
      });
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) {
      toast.error('נא להזין תגובה');
      return;
    }

    if (!clientData.name.trim() || !clientData.email.trim()) {
      toast.error('נא למלא את השם והאימייל');
      return;
    }

    try {
      await addComment.mutateAsync({
        moodBoardId: moodBoard.id,
        itemId: selectedItemId,
        commentText,
        clientData
      });
      
      setShowCommentDialog(false);
      setCommentText('');
      setSelectedItemId(null);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const getItemComments = (itemId: string) => 
    comments.filter(comment => comment.item_id === itemId);
  
  const getItemReactions = (itemId: string) => 
    reactions.filter(reaction => reaction.item_id === itemId);

  const totalLikes = reactions.filter(r => r.reaction_type === 'like' || r.reaction_type === 'love').length;
  const totalComments = comments.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container mx-auto p-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">{moodBoard.title}</h1>
            {moodBoard.description && (
              <p className="text-muted-foreground text-lg mb-4">{moodBoard.description}</p>
            )}
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                {totalLikes} לייקים
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                {totalComments} תגובות
              </span>
              <Badge variant="outline">
                נוצר {formatDistanceToNow(new Date(moodBoard.created_at), { addSuffix: true, locale: he })}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto p-6">
        {items.length === 0 ? (
          <EmptyState
            title="לוח הרגש ריק"
            description="הספק עדיין לא הוסיף פריטים ללוח הרגש הזה"
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {items.map((item) => (
                <MoodBoardItem
                  key={item.id}
                  item={item}
                  reactions={getItemReactions(item.id)}
                  commentsCount={getItemComments(item.id).length}
                  isPublic={true}
                  onReact={(itemId, type) => handleReact(itemId, type)}
                  onComment={(itemId) => {
                    if (!moodBoard.client_can_interact) {
                      toast.error('תגובות אינן מופעלות');
                      return;
                    }
                    setSelectedItemId(itemId);
                    setShowCommentDialog(true);
                  }}
                />
              ))}
            </div>

            {/* Overall Actions */}
            {moodBoard.client_can_interact && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <Button
                    variant="outline"
                    onClick={() => handleReact(null, 'like')}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    אהבתי את הלוח
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedItemId(null);
                      setShowCommentDialog(true);
                    }}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    הוסף תגובה כללית
                  </Button>
                </div>
              </div>
            )}

            {/* Comments Section */}
            {comments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>תגובות ({comments.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-start justify-between mb-2">
                          <span className="font-medium">
                            {comment.is_supplier ? 'הספק' : comment.client_name || 'אורח'}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: he })}
                          </span>
                        </div>
                        <p className="text-sm">{comment.comment_text}</p>
                        {comment.item_id && (
                          <Badge variant="outline" className="mt-2 text-xs">
                            תגובה על פריט
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Comment Dialog */}
      <Dialog open={showCommentDialog} onOpenChange={setShowCommentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedItemId ? 'הוסף תגובה לפריט' : 'הוסף תגובה כללית'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client-name">שם *</Label>
                <Input
                  id="client-name"
                  value={clientData.name}
                  onChange={(e) => setClientData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="השם שלך"
                />
              </div>
              <div>
                <Label htmlFor="client-email">אימייל *</Label>
                <Input
                  id="client-email"
                  type="email"
                  value={clientData.email}
                  onChange={(e) => setClientData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="האימייל שלך"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="comment">תגובה *</Label>
              <Textarea
                id="comment"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="כתוב את התגובה שלך..."
                rows={4}
              />
            </div>
            <div className="flex gap-4">
              <Button onClick={handleComment} disabled={addComment.isPending} className="flex-1">
                <Send className="h-4 w-4 mr-2" />
                {addComment.isPending ? 'שולח...' : 'שלח תגובה'}
              </Button>
              <Button variant="outline" onClick={() => setShowCommentDialog(false)} className="flex-1">
                ביטול
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}