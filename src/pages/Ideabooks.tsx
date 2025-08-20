import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, BookOpen, Globe, Lock, Users, Calendar, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Ideabook } from '@/types/inspiration';

export default function Ideabooks() {
  const { user } = useAuth();
  const [ideabooks, setIdeabooks] = useState<Ideabook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newIdeabookName, setNewIdeabookName] = useState('');
  const [newIdeabookIsPublic, setNewIdeabookIsPublic] = useState(false);

  useEffect(() => {
    if (user) {
      fetchIdeabooks();
    }
  }, [user]);

  const fetchIdeabooks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('ideabooks')
        .select(`
          *,
          ideabook_photos(id)
        `)
        .eq('owner_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const processedIdeabooks = data?.map(ideabook => ({
        ...ideabook,
        photos_count: ideabook.ideabook_photos?.length || 0
      })) || [];

      setIdeabooks(processedIdeabooks);
    } catch (error) {
      console.error('Error fetching ideabooks:', error);
      toast.error('שגיאה בטעינת האידאבוקים');
    } finally {
      setLoading(false);
    }
  };

  const createIdeabook = async () => {
    if (!user || !newIdeabookName.trim()) return;

    try {
      const { data, error } = await supabase
        .from('ideabooks')
        .insert({
          name: newIdeabookName.trim(),
          owner_id: user.id,
          is_public: newIdeabookIsPublic
        })
        .select()
        .single();

      if (error) throw error;

      setIdeabooks(prev => [{ ...data, photos_count: 0 }, ...prev]);
      setNewIdeabookName('');
      setNewIdeabookIsPublic(false);
      setShowCreateModal(false);
      toast.success('אידאבוק חדש נוצר בהצלחה');
    } catch (error) {
      console.error('Error creating ideabook:', error);
      toast.error('שגיאה ביצירת האידאבוק');
    }
  };

  const deleteIdeabook = async (ideabookId: string) => {
    try {
      const { error } = await supabase
        .from('ideabooks')
        .delete()
        .eq('id', ideabookId);

      if (error) throw error;

      setIdeabooks(prev => prev.filter(ib => ib.id !== ideabookId));
      toast.success('האידאבוק נמחק בהצלחה');
    } catch (error) {
      console.error('Error deleting ideabook:', error);
      toast.error('שגיאה במחיקת האידאבוק');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 pb-32">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">האידאבוקים שלי</h1>
              <p className="text-muted-foreground">{ideabooks.length} אידאבוקים</p>
            </div>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 ml-2" />
              צור אידאבוק
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {ideabooks.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">אין לך אידאבוקים עדיין</h3>
            <p className="text-muted-foreground mb-4">צור אידאבוק ראשון כדי להתחיל לאסוף תמונות השראה</p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 ml-2" />
              צור אידאבוק ראשון
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ideabooks.map((ideabook) => (
              <Card key={ideabook.id} className="group hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{ideabook.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        {ideabook.is_public ? (
                          <Badge variant="secondary">
                            <Globe className="h-3 w-3 ml-1" />
                            ציבורי
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <Lock className="h-3 w-3 ml-1" />
                            פרטי
                          </Badge>
                        )}
                        <span>{ideabook.photos_count} תמונות</span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => deleteIdeabook(ideabook.id)} className="text-destructive">
                          <Trash2 className="h-4 w-4 ml-2" />
                          מחק
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 inline ml-1" />
                      {new Date(ideabook.updated_at).toLocaleDateString('he-IL')}
                    </span>
                    <Link to={`/ideabooks/${ideabook.id}`}>
                      <Button size="sm">פתח</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>צור אידאבוק חדש</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-4">
            <div>
              <Label htmlFor="name">שם האידאבוק</Label>
              <Input
                id="name"
                value={newIdeabookName}
                onChange={(e) => setNewIdeabookName(e.target.value)}
                placeholder="הזן שם לאידאבוק..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    createIdeabook();
                  }
                }}
                autoFocus
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="public"
                checked={newIdeabookIsPublic}
                onCheckedChange={setNewIdeabookIsPublic}
              />
              <Label htmlFor="public">אידאבוק ציבורי</Label>
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                onClick={createIdeabook}
                disabled={!newIdeabookName.trim()}
                className="flex-1"
              >
                צור אידאבוק
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                className="flex-1"
              >
                ביטול
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}