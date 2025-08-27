import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Edit, Eye, EyeOff, Calendar, Users, Grid3X3, Image, Layers, Plus, Settings, Copy, ExternalLink } from "lucide-react";
import { useHomepageSections, useUpdateSection, useDeleteSection } from "@/hooks/useHomepageCMS";
import { HomepageSectionEditor } from "@/components/admin/HomepageSectionEditor";
import { HomepageItemManager } from "@/components/admin/HomepageItemManager";
import type { HomepageSection } from "@/types/homepage";

export function HomepageContentManagement() {
  const [editingSection, setEditingSection] = useState<HomepageSection | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [managingSection, setManagingSection] = useState<HomepageSection | null>(null);
  const { toast } = useToast();

  const { data: sections = [], isLoading } = useHomepageSections();
  const updateSection = useUpdateSection();
  const deleteSection = useDeleteSection();

  const toggleSectionStatus = async (section: HomepageSection) => {
    try {
      await updateSection.mutateAsync({
        id: section.id,
        is_active: !section.is_active
      });
    } catch (error) {
      console.error('Error toggling section status:', error);
    }
  };

  const togglePublishStatus = async (section: HomepageSection) => {
    try {
      await updateSection.mutateAsync({
        id: section.id,
        status: section.status === 'published' ? 'draft' : 'published'
      });
    } catch (error) {
      console.error('Error toggling publish status:', error);
    }
  };

  const handleDeleteSection = async (section: HomepageSection) => {
    if (confirm(`האם אתה בטוח שברצונך למחוק את הקטע "${section.title_he || section.type}"?`)) {
      try {
        await deleteSection.mutateAsync(section.id);
      } catch (error) {
        console.error('Error deleting section:', error);
      }
    }
  };

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'banner':
        return <Image className="h-5 w-5" />;
      case 'category_carousel':
        return <Grid3X3 className="h-5 w-5" />;
      case 'supplier_cards':
        return <Users className="h-5 w-5" />;
      case 'tabs':
        return <Layers className="h-5 w-5" />;
      default:
        return <Calendar className="h-5 w-5" />;
    }
  };

  const getSectionDescription = (section: HomepageSection) => {
    const statusText = section.status === 'published' ? 'פורסם' : 'טיוטה';
    const activeText = section.is_active ? 'פעיל' : 'לא פעיל';
    const platformText = section.platform === 'web' ? 'ווב' : section.platform;
    
    return `${statusText} • ${activeText} • ${platformText}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">טוען קטעי תוכן...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ניהול תוכן עמוד הבית</h1>
          <p className="text-muted-foreground mt-2">
            נהל קטעי תוכן דינמיים המוצגים בעמוד הבית ובקטעים קידומיים
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => window.open('/admin/homepage-content/preview', '_blank')}
            className="gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            תצוגה מקדימה
          </Button>
          <Button onClick={() => setIsCreating(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            קטע חדש
          </Button>
        </div>
      </div>

      {sections.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="text-muted-foreground text-lg">אין קטעי תוכן עדיין</div>
              <Button onClick={() => setIsCreating(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                צור קטע ראשון
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {sections.map((section) => (
            <Card key={section.id} className="transition-all hover:shadow-md">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getSectionIcon(section.type)}
                    <div>
                      <CardTitle className="text-lg">
                        {section.title_he || section.type}
                      </CardTitle>
                      <CardDescription>
                        {getSectionDescription(section)}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={section.status === 'published' ? "default" : "secondary"}
                      className="gap-1"
                    >
                      {section.status === 'published' ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      {section.status === 'published' ? "פורסם" : "טיוטה"}
                    </Badge>
                    <Badge 
                      variant={section.is_active ? "default" : "secondary"}
                    >
                      {section.is_active ? "פעיל" : "לא פעיל"}
                    </Badge>
                    <Switch
                      checked={section.is_active}
                      onCheckedChange={() => toggleSectionStatus(section)}
                    />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>קדימות: {section.priority}</span>
                    <span>עודכן: {formatDate(section.updated_at)}</span>
                    {section.start_at && (
                      <span>מתחיל: {formatDate(section.start_at)}</span>
                    )}
                    {section.end_at && (
                      <span>מסתיים: {formatDate(section.end_at)}</span>
                    )}
                    <span>פלטפורמה: {section.platform}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setManagingSection(section)}
                      className="gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      נהל פריטים
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePublishStatus(section)}
                      className="gap-2"
                    >
                      {section.status === 'published' ? (
                        <>
                          <EyeOff className="h-4 w-4" />
                          בטל פרסום
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4" />
                          פרסם
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingSection(section)}
                      className="gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      ערוך
                    </Button>
                  </div>
                </div>
                
                {section.description_he && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {section.description_he}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <HomepageSectionEditor
        section={editingSection || undefined}
        open={isCreating || !!editingSection}
        onClose={() => {
          setIsCreating(false);
          setEditingSection(null);
        }}
      />

      {managingSection && (
        <HomepageItemManager
          section={managingSection}
          open={!!managingSection}
          onClose={() => setManagingSection(null)}
        />
      )}
    </div>
  );
}