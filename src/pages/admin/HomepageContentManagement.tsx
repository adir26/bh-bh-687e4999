import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { homepageContentService, companiesService, categoriesService, type HomepageContent } from "@/services/supabaseService";
import { Edit, Eye, EyeOff, Calendar, Users, Grid3X3, Image, Layers } from "lucide-react";
import { ContentBlockEditor } from "@/components/admin/ContentBlockEditor";

export function HomepageContentManagement() {
  const [contentBlocks, setContentBlocks] = useState<HomepageContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBlock, setEditingBlock] = useState<HomepageContent | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadContentBlocks();
  }, []);

  const loadContentBlocks = async () => {
    try {
      const blocks = await homepageContentService.getAll();
      setContentBlocks(blocks);
    } catch (error) {
      console.error('Error loading content blocks:', error);
      toast({
        title: "Error",
        description: "Failed to load content blocks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleBlockVisibility = async (block: HomepageContent) => {
    try {
      const updatedBlock = await homepageContentService.update(block.id, {
        is_enabled: !block.is_enabled
      });
      
      setContentBlocks(prev => 
        prev.map(b => b.id === block.id ? updatedBlock : b)
      );
      
      toast({
        title: "Success",
        description: `Block ${updatedBlock.is_enabled ? 'enabled' : 'disabled'} successfully`,
      });
    } catch (error) {
      console.error('Error toggling block visibility:', error);
      toast({
        title: "Error",
        description: "Failed to update block visibility",
        variant: "destructive",
      });
    }
  };

  const getBlockIcon = (blockName: string) => {
    switch (blockName) {
      case 'featured_suppliers':
      case 'trending_now':
      case 'new_suppliers':
        return <Users className="h-5 w-5" />;
      case 'top_categories':
        return <Grid3X3 className="h-5 w-5" />;
      case 'marketing_banner_1':
        return <Image className="h-5 w-5" />;
      case 'carousel_slides':
        return <Layers className="h-5 w-5" />;
      default:
        return <Calendar className="h-5 w-5" />;
    }
  };

  const getBlockDescription = (block: HomepageContent) => {
    const data = block.content_data;
    switch (block.block_name) {
      case 'featured_suppliers':
      case 'trending_now':
        return `${data.supplier_ids?.length || 0} suppliers selected`;
      case 'top_categories':
        return `${data.category_ids?.length || 0} categories selected`;
      case 'new_suppliers':
        return data.mode === 'auto' ? `Auto mode - ${data.count || 6} suppliers` : `${data.supplier_ids?.length || 0} suppliers selected`;
      case 'marketing_banner_1':
        return data.image_url ? 'Banner configured' : 'No banner image';
      case 'carousel_slides':
        return `${data.slides?.length || 0} slides`;
      default:
        return 'Content block';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleBlockSave = async (updatedBlock: HomepageContent) => {
    setContentBlocks(prev => 
      prev.map(b => b.id === updatedBlock.id ? updatedBlock : b)
    );
    setEditingBlock(null);
    toast({
      title: "Success",
      description: "Content block updated successfully",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading content blocks...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Homepage Content Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage dynamic content blocks displayed on the homepage and promotional sections
        </p>
      </div>

      <div className="grid gap-6">
        {contentBlocks.map((block) => (
          <Card key={block.id} className="transition-all hover:shadow-md">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getBlockIcon(block.block_name)}
                  <div>
                    <CardTitle className="text-lg capitalize">
                      {block.content_data.title || block.block_name.replace(/_/g, ' ')}
                    </CardTitle>
                    <CardDescription>
                      {getBlockDescription(block)}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={block.is_enabled ? "default" : "secondary"}
                    className="gap-1"
                  >
                    {block.is_enabled ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    {block.is_enabled ? "Visible" : "Hidden"}
                  </Badge>
                  <Switch
                    checked={block.is_enabled}
                    onCheckedChange={() => toggleBlockVisibility(block)}
                  />
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Order: {block.display_order}</span>
                  <span>Updated: {formatDate(block.updated_at)}</span>
                  {block.start_date && (
                    <span>Starts: {formatDate(block.start_date)}</span>
                  )}
                  {block.end_date && (
                    <span>Ends: {formatDate(block.end_date)}</span>
                  )}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingBlock(block)}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              </div>
              
              {block.content_data.description && (
                <p className="text-sm text-muted-foreground mt-2">
                  {block.content_data.description}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {editingBlock && (
        <ContentBlockEditor
          block={editingBlock}
          onSave={handleBlockSave}
          onClose={() => setEditingBlock(null)}
        />
      )}
    </div>
  );
}