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
import { Plus, Grid, List, Lock, Globe, Users, MoreVertical, Share2, Trash2, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface Ideabook {
  id: string;
  name: string;
  is_public: boolean;
  share_token?: string;
  created_at: string;
  updated_at: string;
  photo_count?: number;
  recent_photos?: string[];
  collaborators_count?: number;
}

export default function Ideabooks() {
  const { user } = useAuth();
  const [ideabooks, setIdeabooks] = useState<Ideabook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingIdeabook, setEditingIdeabook] = useState<Ideabook | null>(null);
  const [newIdeabookName, setNewIdeabookName] = useState('');
  const [newIdeabookPublic, setNewIdeabookPublic] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (user) {
      fetchIdeabooks();
    }
  }, [user]);

  const fetchIdeabooks = async () => {
    try {
      const { data, error } = await supabase
        .from('ideabooks')
        .select(`
          *,
          ideabook_photos(
            id,
            photos(storage_path)
          ),
          ideabook_collaborators(id)
        `)
        .eq('owner_id', user?.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const processedIdeabooks = data?.map(ideabook => ({
        ...ideabook,
        photo_count: ideabook.ideabook_photos?.length || 0,
        recent_photos: ideabook.ideabook_photos?.slice(0, 4).map((ip: any) => ip.photos?.storage_path).filter(Boolean) || [],
        collaborators_count: ideabook.ideabook_collaborators?.length || 0
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
    if (!newIdeabookName.trim()) {
      toast.error('נדרש שם לאידאבוק');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('ideabooks')
        .insert({
          name: newIdeabookName.trim(),
          owner_id: user?.id,
          is_public: newIdeabookPublic,
          share_token: newIdeabookPublic ? crypto.randomUUID() : null
        })
        .select()
        .single();

      if (error) throw error;

      setIdeabooks(prev => [{ ...data, photo_count: 0, recent_photos: [], collaborators_count: 0 }, ...prev]);
      setShowCreateDialog(false);
      setNewIdeabookName('');
      setNewIdeabookPublic(false);
      toast.success('אידאבוק חדש נוצר בהצלחה');
    } catch (error) {
      console.error('Error creating ideabook:', error);
      toast.error('שגיאה ביצירת האידאבוק');
    }
  };

  const updateIdeabook = async () => {
    if (!editingIdeabook || !newIdeabookName.trim()) return;

    try {
      const updateData: any = {
        name: newIdeabookName.trim(),
        is_public: newIdeabookPublic
      };

      // Generate share token if making public and doesn't have one
      if (newIdeabookPublic && !editingIdeabook.share_token) {
        updateData.share_token = crypto.randomUUID();
      }

      const { data, error } = await supabase
        .from('ideabooks')
        .update(updateData)
        .eq('id', editingIdeabook.id)
        .select()
        .single();

      if (error) throw error;

      setIdeabooks(prev => prev.map(ib => 
        ib.id === editingIdeabook.id 
          ? { ...ib, ...data } 
          : ib
      ));

      setEditingIdeabook(null);
      setNewIdeabookName('');
      setNewIdeabookPublic(false);
      toast.success('האידאבוק עודכן בהצלחה');
    } catch (error) {
      console.error('Error updating ideabook:', error);
      toast.error('שגיאה בעדכון האידאבוק');
    }
  };

  const deleteIdeabook = async (ideabookId: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק את האידאבוק? פעולה זו לא ניתנת לביטול.')) {
      return;
    }

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

  const shareIdeabook = async (ideabook: Ideabook) => {
    if (!ideabook.is_public) {
      toast.error('ניתן לשתף רק אידאבוקים ציבוריים');
      return;
    }

    const shareUrl = `${window.location.origin}/ideabooks/${ideabook.id}${ideabook.share_token ? `?share=${ideabook.share_token}` : ''}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: ideabook.name,
          url: shareUrl
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('קישור השיתוף הועתק ללוח');
    }
  };

  const startEdit = (ideabook: Ideabook) => {
    setEditingIdeabook(ideabook);
    setNewIdeabookName(ideabook.name);
    setNewIdeabookPublic(ideabook.is_public);
  };

  const getImageUrl = (path: string) => {
    const { data } = supabase.storage.from('inspiration-photos').getPublicUrl(path);
    return data.publicUrl;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 pb-32">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
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
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">האידאבוקים שלי</h1>
            <div className="flex items-center gap-2">
              <div className="flex border rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 w-8 p-0"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 ml-2" />
                    אידאבוק חדש
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>יצירת אידאבוק חדש</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 p-4">
                    <div>
                      <Label htmlFor="name">שם האידאבוק</Label>
                      <Input
                        id="name"
                        value={newIdeabookName}
                        onChange={(e) => setNewIdeabookName(e.target.value)}
                        placeholder="הזן שם לאידאבוק..."
                      />
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Switch
                        id="public"
                        checked={newIdeabookPublic}
                        onCheckedChange={setNewIdeabookPublic}
                      />
                      <Label htmlFor="public">אידאבוק ציבורי</Label>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={createIdeabook} className="flex-1">
                        צור אידאבוק
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowCreateDialog(false)}
                        className="flex-1"
                      >
                        ביטול
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Ideabooks Grid/List */}
      <div className="container mx-auto px-4 py-6">
        {ideabooks.length === 0 ? (
          <div className="text-center py-12">
            <Plus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">אין לך אידאבוקים עדיין</h3>
            <p className="text-muted-foreground mb-4">צור את האידאבוק הראשון שלך כדי להתחיל לארגן תמונות השראה</p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 ml-2" />
              צור אידאבוק חדש
            </Button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-4'}>
            {ideabooks.map((ideabook) => (
              <Card key={ideabook.id} className="group overflow-hidden">
                <CardContent className="p-0">
                  <Link to={`/ideabooks/${ideabook.id}`}>
                    <div className={viewMode === 'grid' ? 'aspect-square' : 'aspect-video md:aspect-square'}>
                      {ideabook.recent_photos.length > 0 ? (
                        <div className="relative w-full h-full">
                          {ideabook.recent_photos.length === 1 ? (
                            <img
                              src={getImageUrl(ideabook.recent_photos[0])}
                              alt={ideabook.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="grid grid-cols-2 gap-1 w-full h-full">
                              {ideabook.recent_photos.slice(0, 4).map((path, idx) => (
                                <img
                                  key={idx}
                                  src={getImageUrl(path)}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ))}
                            </div>
                          )}
                          
                          {/* Overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                        </div>
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Plus className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Ideabook Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{ideabook.name}</h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          <span>{ideabook.photo_count} תמונות</span>
                          {ideabook.collaborators_count > 0 && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {ideabook.collaborators_count}
                            </span>
                          )}
                          <div className="flex items-center gap-1">
                            {ideabook.is_public ? (
                              <Globe className="h-3 w-3" />
                            ) : (
                              <Lock className="h-3 w-3" />
                            )}
                            <span>{ideabook.is_public ? 'ציבורי' : 'פרטי'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => startEdit(ideabook)}>
                            <Edit3 className="h-4 w-4 ml-2" />
                            עריכה
                          </DropdownMenuItem>
                          {ideabook.is_public && (
                            <DropdownMenuItem onClick={() => shareIdeabook(ideabook)}>
                              <Share2 className="h-4 w-4 ml-2" />
                              שיתוף
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => deleteIdeabook(ideabook.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 ml-2" />
                            מחיקה
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingIdeabook} onOpenChange={() => setEditingIdeabook(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>עריכת אידאבוק</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 p-4">
            <div>
              <Label htmlFor="edit-name">שם האידאבוק</Label>
              <Input
                id="edit-name"
                value={newIdeabookName}
                onChange={(e) => setNewIdeabookName(e.target.value)}
                placeholder="הזן שם לאידאבוק..."
              />
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <Switch
                id="edit-public"
                checked={newIdeabookPublic}
                onCheckedChange={setNewIdeabookPublic}
              />
              <Label htmlFor="edit-public">אידאבוק ציבורי</Label>
            </div>
            <div className="flex gap-2">
              <Button onClick={updateIdeabook} className="flex-1">
                שמור שינויים
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditingIdeabook(null)}
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