import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Share2, Users, Settings, Grid, List, Plus, MoreVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryInvalidation } from '@/hooks/useQueryInvalidation';
import { toast } from 'sonner';
import { Ideabook, IdeabookPhoto, IdeabookCollaborator } from '@/types/inspiration';
import { getPublicImageUrl } from '@/utils/imageUrls';
import { useQuery } from '@tanstack/react-query';
import { supaSelect, supaSelectMaybe } from '@/lib/supaFetch';
import { PageBoundary } from '@/components/system/PageBoundary';


export default function IdeabookDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { invalidateIdeabook } = useQueryInvalidation();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCollaborators, setShowCollaborators] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState('');
  const [newCollaboratorRole, setNewCollaboratorRole] = useState<'viewer' | 'editor'>('viewer');

  const { data: ideabookData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['ideabook', id, user?.id],
    enabled: !!id && !!user?.id,
    queryFn: async ({ signal }) => {
      try {
        // Fetch ideabook details
        const ideabook = await supaSelectMaybe<Ideabook>(
          supabase
            .from('ideabooks')
            .select('*')
            .eq('id', id!),
          { 
            signal,
            errorMessage: 'שגיאה בטעינת פרטי האידאבוק',
            timeoutMs: 10_000
          }
        );

        if (!ideabook) {
          return null;
        }

        // Check access permissions
        let hasAccess = false;
        let currentUserRole: 'owner' | 'editor' | 'viewer' = 'viewer';

        if (ideabook.owner_id === user?.id) {
          hasAccess = true;
          currentUserRole = 'owner';
        } else if (ideabook.is_public) {
          hasAccess = true;
        } else if (user) {
          // Check if user is a collaborator
          const collaboratorData = await supaSelectMaybe<{role: string}>(
            supabase
              .from('ideabook_collaborators')
              .select('role')
              .eq('ideabook_id', id!)
              .eq('user_id', user.id),
            { signal, timeoutMs: 5_000 }
          );

          if (collaboratorData) {
            hasAccess = true;
            currentUserRole = collaboratorData.role as 'viewer' | 'editor';
          }
        }

        if (!hasAccess) {
          throw new Error('אין לך הרשאה לצפות באידאבוק זה');
        }

        // Fetch photos
        const photos = await supaSelect<IdeabookPhoto[]>(
          supabase
            .from('ideabook_photos')
            .select(`
              *,
              photos(id, title, storage_path, room, style)
            `)
            .eq('ideabook_id', id!)
            .order('created_at', { ascending: false }),
          { signal, timeoutMs: 10_000 }
        );

        // Fetch collaborators (only if owner or editor)
        let collaborators: IdeabookCollaborator[] = [];
        if (currentUserRole === 'owner' || currentUserRole === 'editor') {
          collaborators = await supaSelect<IdeabookCollaborator[]>(
            supabase
              .from('ideabook_collaborators')
              .select(`
                *,
                profiles(id, full_name, email)
              `)
              .eq('ideabook_id', id!),
            { signal, timeoutMs: 10_000 }
          );
        }

        return {
          ideabook,
          photos: photos || [],
          collaborators: collaborators || [],
          userRole: currentUserRole
        };
      } catch (error: any) {
        // Handle missing tables gracefully
        if (error.message?.includes('relation') || error.message?.includes('does not exist')) {
          return null;
        }
        throw error;
      }
    },
    retry: 1,
    staleTime: 60_000,
  });

  const ideabook = ideabookData?.ideabook || null;
  const photos = ideabookData?.photos || [];
  const collaborators = ideabookData?.collaborators || [];
  const userRole = ideabookData?.userRole || 'viewer';

  const shareIdeabook = async () => {
    if (!ideabook?.is_public) {
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

  const removePhoto = async (ideabookPhotoId: string) => {
    if (userRole === 'viewer') {
      toast.error('אין לך הרשאה להסיר תמונות');
      return;
    }

    try {
      const { error } = await supabase
        .from('ideabook_photos')
        .delete()
        .eq('id', ideabookPhotoId);

      if (error) throw error;

      invalidateIdeabook(id!, user?.id);
      toast.success('התמונה הוסרה מהאידאבוק');
    } catch (error) {
      console.error('Error removing photo:', error);
      toast.error('שגיאה בהסרת התמונה');
    }
  };

  const addCollaborator = async () => {
    if (userRole !== 'owner') {
      toast.error('רק הבעלים יכול להוסיף משתפים');
      return;
    }

    if (!newCollaboratorEmail.trim()) {
      toast.error('נדרש אימייל');
      return;
    }

    try {
      // Find user by email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', newCollaboratorEmail.trim())
        .maybeSingle();

      if (userError || !userData) {
        toast.error('משתמש לא נמצא');
        return;
      }

      // Add collaborator
      const { data, error } = await supabase
        .from('ideabook_collaborators')
        .insert({
          ideabook_id: ideabook?.id,
          user_id: userData.id,
          role: newCollaboratorRole
        })
        .select(`
          *,
          profiles(id, full_name, email)
        `)
        .maybeSingle();

      if (error) throw error;

      invalidateIdeabook(id!, user?.id);
      toast.success('משתף נוסף בהצלחה');
      setNewCollaboratorEmail('');
      setNewCollaboratorRole('viewer');
    } catch (error) {
      console.error('Error adding collaborator:', error);
      toast.error('שגיאה בהוספת המשתף');
    }
  };

  const removeCollaborator = async (collaboratorId: string) => {
    if (userRole !== 'owner') {
      toast.error('רק הבעלים יכול להסיר משתפים');
      return;
    }

    try {
      const { error } = await supabase
        .from('ideabook_collaborators')
        .delete()
        .eq('id', collaboratorId);

      if (error) throw error;

      invalidateIdeabook(id!, user?.id);
      toast.success('המשתף הוסר בהצלחה');
    } catch (error) {
      console.error('Error removing collaborator:', error);
      toast.error('שגיאה בהסרת המשתף');
    }
  };


  return (
    <PageBoundary 
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={() => refetch()}
      isEmpty={!ideabookData}
      empty={
        <div className="min-h-screen bg-background p-4 pb-32 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">האידאבוק לא נמצא</h2>
            <Link to="/ideabooks">
              <Button>חזור לאידאבוקים</Button>
            </Link>
          </div>
        </div>
      }
    >
    <div className="min-h-screen bg-background pb-32">
      fallback={
        <div className="min-h-screen bg-background p-4 pb-32 animate-pulse">
          <div className="container mx-auto">
            <div className="h-8 bg-muted rounded mb-6" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square bg-muted rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      }
    >
      {isLoading ? (
        <div className="min-h-screen bg-background p-4 pb-32">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
              <Skeleton className="h-8 w-48" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square" />
              ))}
            </div>
          </div>
        </div>
      ) : ideabookData === null ? (
        <div className="min-h-screen bg-background p-4 pb-32 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">האידאבוק לא נמצא</h2>
            <Link to="/ideabooks">
              <Button>חזור לאידאბוקים</Button>
            </Link>
          </div>
        </div>
      ) : (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link to="/ideabooks" aria-label="חזור לאידאבוקים">
                <Button variant="ghost" size="sm">
                  <ArrowRight className="h-4 w-4 ml-2" />
                  חזור
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold">{ideabook.name}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{photos.length} תמונות</span>
                  {ideabook.is_public ? (
                    <Badge variant="secondary">ציבורי</Badge>
                  ) : (
                    <Badge variant="outline">פרטי</Badge>
                  )}
                  {collaborators.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {collaborators.length} משתפים
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex border rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="h-8 w-8 p-0"
                  aria-label="תצוגת רשת"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="h-8 w-8 p-0"
                  aria-label="תצוגת רשימה"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {ideabook.is_public && (
                <Button variant="outline" size="sm" onClick={shareIdeabook} aria-label="שיתוף האידאבוק">
                  <Share2 className="h-4 w-4 ml-2" />
                  שיתוף
                </Button>
              )}

              {(userRole === 'owner' || userRole === 'editor') && (
                <Dialog open={showCollaborators} onOpenChange={setShowCollaborators}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" aria-label="ניהול משתפים">
                      <Users className="h-4 w-4 ml-2" />
                      משתפים
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>ניהול משתפים</DialogTitle>
                    </DialogHeader>
                    <div className="p-4 space-y-4">
                      {userRole === 'owner' && (
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="email">אימייל המשתף</Label>
                            <Input
                              id="email"
                              type="email"
                              value={newCollaboratorEmail}
                              onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                              placeholder="הזן אימייל..."
                            />
                          </div>
                          <div>
                            <Label htmlFor="role">תפקיד</Label>
                            <Select value={newCollaboratorRole} onValueChange={(value: 'viewer' | 'editor') => setNewCollaboratorRole(value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="viewer">צופה</SelectItem>
                                <SelectItem value="editor">עורך</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button onClick={addCollaborator} className="w-full">
                            הוסף משתף
                          </Button>
                        </div>
                      )}

                      <div className="space-y-2">
                        <h4 className="font-medium">משתפים נוכחיים</h4>
                        {collaborators.length === 0 ? (
                          <p className="text-sm text-muted-foreground">אין משתפים</p>
                        ) : (
                          collaborators.map((collaborator) => (
                            <div key={collaborator.id} className="flex items-center justify-between p-2 border rounded">
                              <div>
                                <p className="font-medium">
                                  {collaborator.profiles.full_name || collaborator.profiles.email}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {collaborator.role === 'viewer' ? 'צופה' : 'עורך'}
                                </p>
                              </div>
                              {userRole === 'owner' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeCollaborator(collaborator.id)}
                                  aria-label={`הסר את ${collaborator.profiles.full_name || collaborator.profiles.email}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {userRole === 'owner' && (
                <Button variant="outline" size="sm" onClick={() => setShowSettings(true)} aria-label="הגדרות האידאבוק">
                  <Settings className="h-4 w-4 ml-2" />
                  הגדרות
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Photos Grid/List */}
      <div className="container mx-auto px-4 py-6">
        {photos.length === 0 ? (
          <div className="text-center py-12">
            <Plus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">האידאבוק ריק</h3>
            <p className="text-muted-foreground mb-4">
              {userRole === 'viewer' 
                ? 'אין תמונות באידאבוק זה עדיין'
                : 'התחל להוסיף תמונות השראה לאידאבוק שלך'
              }
            </p>
            {userRole !== 'viewer' && (
              <Link to="/inspiration" aria-label="עבור לגלריית השראה">
                <Button>
                  עבור לגלריית השראה
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' : 'space-y-4'}>
            {photos.map((ideabookPhoto) => (
              <Card key={ideabookPhoto.id} className="group overflow-hidden">
                <CardContent className="p-0 relative">
                  <Link to={`/inspiration/photo/${ideabookPhoto.photos.id}`} aria-label={`צפה בתמונה: ${ideabookPhoto.photos.title}`}>
                    <div className={viewMode === 'grid' ? 'aspect-square' : 'aspect-video md:aspect-square'}>
                      <img
                        src={getPublicImageUrl(ideabookPhoto.photos.storage_path)}
                        alt={ideabookPhoto.photos.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    </div>
                  </Link>

                  {/* Remove Button */}
                  {userRole !== 'viewer' && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => removePhoto(ideabookPhoto.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 ml-2" />
                            הסר מהאידאבוק
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}

                  {/* Photo Info */}
                  <div className="p-3">
                    <h3 className="font-medium text-sm truncate">{ideabookPhoto.photos.title}</h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      {ideabookPhoto.photos.room && <span>{ideabookPhoto.photos.room}</span>}
                      {ideabookPhoto.photos.style && <span>• {ideabookPhoto.photos.style}</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
      )}
    </PageBoundary>
  );
}