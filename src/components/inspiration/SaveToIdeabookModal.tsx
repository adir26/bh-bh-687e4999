import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, BookOpen, Lock, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Ideabook } from '@/types/inspiration';
import { withTimeout } from '@/lib/withTimeout';

interface SaveToIdeabookModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  photoId: string;
  photoTitle: string;
}

export function SaveToIdeabookModal({ isOpen, onOpenChange, photoId, photoTitle }: SaveToIdeabookModalProps) {
  const { user } = useAuth();
  const [creating, setCreating] = useState(false);
  const [newIdeabookName, setNewIdeabookName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Fetch user ideabooks with React Query
  const { data: ideabooks = [], isLoading, refetch } = useQuery({
    queryKey: ['user-ideabooks', user?.id],
    enabled: isOpen && !!user?.id,
    queryFn: async ({ signal }) => {
      const { data, error } = await withTimeout(
        supabase
          .from('ideabooks')
          .select('*')
          .eq('owner_id', user!.id)
          .order('updated_at', { ascending: false }),
        12000
      );

      if (error) throw new Error('שגיאה בטעינת האידאבוקים');
      return data || [];
    },
    retry: 1,
    staleTime: 60_000,
  });

  const createIdeabook = async () => {
    if (!user || !newIdeabookName.trim()) return;

    setCreating(true);
    try {
      const { data: ideabookData, error: ideabookError } = await supabase
        .from('ideabooks')
        .insert({
          name: newIdeabookName.trim(),
          owner_id: user.id,
          is_public: false
        })
        .select()
        .maybeSingle();

      if (ideabookError) throw ideabookError;

      // Add photo to the new ideabook
      const { error: photoError } = await supabase
        .from('ideabook_photos')
        .insert({
          ideabook_id: ideabookData.id,
          photo_id: photoId,
          added_by: user.id
        });

      if (photoError) {
        // Check if it's a duplicate error
        if (photoError.code === '23505') {
          toast.success('התמונה כבר קיימת באידאבוק החדש');
        } else {
          throw photoError;
        }
      } else {
        toast.success(`נוצר אידאבוק חדש \\"${newIdeabookName}\\" והתמונה נשמרה`);
      }

      setNewIdeabookName('');
      setShowCreateForm(false);
      await refetch();
    } catch (error) {
      console.error('Error creating ideabook:', error);
      toast.error('שגיאה ביצירת האידאבוק');
    } finally {
      setCreating(false);
    }
  };

  const saveToIdeabook = async (ideabookId: string, ideabookName: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('ideabook_photos')
        .insert({
          ideabook_id: ideabookId,
          photo_id: photoId,
          added_by: user.id
        });

      if (error) {
        if (error.code === '23505') {
          toast.success('התמונה כבר קיימת באידאבוק זה');
        } else {
          throw error;
        }
      } else {
        toast.success(`התמונה נשמרה ל\\"${ideabookName}\\"`);
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Error saving to ideabook:', error);
      toast.error('שגיאה בשמירת התמונה');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>שמירה לאידאבוק</DialogTitle>
          <p className="text-sm text-muted-foreground">שמור את "{photoTitle}" לאידאבוק</p>
        </DialogHeader>

        <div className="p-4 space-y-4">
          {/* Create New Ideabook */}
          <Card>
            <CardContent className="p-4">
              {!showCreateForm ? (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setShowCreateForm(true)}
                >
                  <Plus className="h-4 w-4 ml-2" />
                  צור אידאבוק חדש
                </Button>
              ) : (
                <div className="space-y-3">
                  <Label htmlFor="name">שם האידאבוק</Label>
                  <Input
                    id="name"
                    value={newIdeabookName}
                    onChange={(e) => setNewIdeabookName(e.target.value)}
                    placeholder="הזן שם לאידאבוק..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        createIdeabook();
                      } else if (e.key === 'Escape') {
                        setShowCreateForm(false);
                        setNewIdeabookName('');
                      }
                    }}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={createIdeabook}
                      disabled={!newIdeabookName.trim() || creating}
                      size="sm"
                    >
                      {creating ? 'יוצר...' : 'צור ושמור'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowCreateForm(false);
                        setNewIdeabookName('');
                      }}
                    >
                      ביטול
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Existing Ideabooks */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">האידאבוקים שלי</h4>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-12 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : ideabooks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">אין לך אידאבוקים עדיין</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {ideabooks.map((ideabook) => (
                  <Card key={ideabook.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardContent
                      className="p-3 flex items-center justify-between"
                      onClick={() => saveToIdeabook(ideabook.id, ideabook.name)}
                    >
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{ideabook.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {ideabook.is_public ? (
                              <Badge variant="secondary" className="h-4 px-1 text-xs">
                                <Globe className="h-2 w-2 ml-1" />
                                ציבורי
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="h-4 px-1 text-xs">
                                <Lock className="h-2 w-2 ml-1" />
                                פרטי
                              </Badge>
                             )}
                             {(ideabook as any).photos_count && (ideabook as any).photos_count > 0 && (
                               <span>{(ideabook as any).photos_count} תמונות</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">
                        שמור
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
