import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { 
  HomepageSection, 
  HomepageItem, 
  HomepagePublicContent,
  CreateSectionRequest,
  CreateItemRequest,
  UpdateSectionRequest,
  UpdateItemRequest,
  TelemetryEvent,
  Platform
} from '@/types/homepage';

// Homepage sections management
export const useHomepageSections = () => {
  return useQuery({
    queryKey: ['homepage-sections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('homepage_sections')
        .select('*')
        .order('priority', { ascending: true })
        .range(0, 99); // Add pagination - max 100 sections

      if (error) throw error;
      return data as HomepageSection[];
    }
  });
};

export const useCreateSection = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (section: CreateSectionRequest) => {
      const { data, error } = await supabase
        .from('homepage_sections')
        .insert(section)
        .select()
        .maybeSingle();

      if (error) throw error;
      return data as HomepageSection;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-sections'] });
      toast({ title: "הצלחה", description: "הקטע נוצר בהצלחה" });
    },
    onError: (error) => {
      console.error('Error creating section:', error);
      toast({ 
        title: "שגיאה", 
        description: "נכשל ביצירת הקטע", 
        variant: "destructive" 
      });
    }
  });
};

export const useUpdateSection = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & UpdateSectionRequest) => {
      const { data, error } = await supabase
        .from('homepage_sections')
        .update(updates)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;
      return data as HomepageSection;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-sections'] });
      queryClient.invalidateQueries({ queryKey: ['homepage-items'] });
      toast({ title: "הצלחה", description: "הקטע עודכן בהצלחה" });
    },
    onError: (error) => {
      console.error('Error updating section:', error);
      toast({ 
        title: "שגיאה", 
        description: "נכשל בעדכון הקטע", 
        variant: "destructive" 
      });
    }
  });
};

export const useDeleteSection = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('homepage_sections')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-sections'] });
      queryClient.invalidateQueries({ queryKey: ['homepage-items'] });
      toast({ title: "הצלחה", description: "הקטע נמחק בהצלחה" });
    },
    onError: (error) => {
      console.error('Error deleting section:', error);
      toast({ 
        title: "שגיאה", 
        description: "נכשל במחיקת הקטע", 
        variant: "destructive" 
      });
    }
  });
};

// Homepage items management
export const useHomepageItems = (sectionId?: string) => {
  return useQuery({
    queryKey: ['homepage-items', sectionId],
    queryFn: async () => {
      let query = supabase
        .from('homepage_items')
        .select('*')
        .order('order_index', { ascending: true })
        .range(0, 49); // Add pagination - max 50 items per section
      
      if (sectionId) {
        query = query.eq('section_id', sectionId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as HomepageItem[];
    },
    enabled: !!sectionId
  });
};

export const useCreateItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (item: CreateItemRequest) => {
      const { data, error } = await supabase
        .from('homepage_items')
        .insert(item)
        .select()
        .maybeSingle();

      if (error) throw error;
      return data as HomepageItem;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['homepage-items', variables.section_id] });
      queryClient.invalidateQueries({ queryKey: ['homepage-public-content'] });
      toast({ title: "הצלחה", description: "הפריט נוצר בהצלחה" });
    },
    onError: (error) => {
      console.error('Error creating item:', error);
      toast({ 
        title: "שגיאה", 
        description: "נכשל ביצירת הפריט", 
        variant: "destructive" 
      });
    }
  });
};

export const useUpdateItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, section_id, ...updates }: { id: string; section_id: string } & UpdateItemRequest) => {
      const { data, error } = await supabase
        .from('homepage_items')
        .update(updates)
        .eq('id', id)
        .select()
        .maybeSingle();

      if (error) throw error;
      return data as HomepageItem;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['homepage-items', variables.section_id] });
      queryClient.invalidateQueries({ queryKey: ['homepage-public-content'] });
      toast({ title: "הצלחה", description: "הפריט עודכן בהצלחה" });
    },
    onError: (error) => {
      console.error('Error updating item:', error);
      toast({ 
        title: "שגיאה", 
        description: "נכשל בעדכון הפריט", 
        variant: "destructive" 
      });
    }
  });
};

export const useDeleteItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, section_id }: { id: string; section_id: string }) => {
      const { error } = await supabase
        .from('homepage_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['homepage-items', variables.section_id] });
      queryClient.invalidateQueries({ queryKey: ['homepage-public-content'] });
      toast({ title: "הצלחה", description: "הפריט נמחק בהצלחה" });
    },
    onError: (error) => {
      console.error('Error deleting item:', error);
      toast({ 
        title: "שגיאה", 
        description: "נכשל במחיקת הפריט", 
        variant: "destructive" 
      });
    }
  });
};

// Reorder items within a section
export const useReorderItems = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ sectionId, itemIds }: { sectionId: string; itemIds: string[] }) => {
      // Update order_index for each item
      const updates = itemIds.map((itemId, index) => 
        supabase
          .from('homepage_items')
          .update({ order_index: index })
          .eq('id', itemId)
      );

      const results = await Promise.all(updates);
      
      // Check for errors
      for (const result of results) {
        if (result.error) throw result.error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['homepage-items', variables.sectionId] });
      queryClient.invalidateQueries({ queryKey: ['homepage-public-content'] });
    },
    onError: (error) => {
      console.error('Error reordering items:', error);
      toast({ 
        title: "שגיאה", 
        description: "נכשל בסידור מחדש של הפריטים", 
        variant: "destructive" 
      });
    }
  });
};

// Public content for frontend display
export const useHomepagePublicContent = (platform: Platform = 'web') => {
  return useQuery({
    queryKey: ['homepage-public-content', platform],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_homepage_content', { _platform: platform });

      if (error) throw error;
      return data as HomepagePublicContent[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Telemetry tracking
export const useTrackEvent = () => {
  return useMutation({
    mutationFn: async (event: Omit<TelemetryEvent, 'id' | 'occurred_at'>) => {
      const { error } = await supabase
        .from('events')
        .insert(event);

      if (error) throw error;
    },
    onError: (error) => {
      // Silent fail for telemetry - don't show user errors
      console.warn('Telemetry tracking failed:', error);
    }
  });
};

// File upload for homepage images
export const useHomepageImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadImage = async (file: File, folder = 'content'): Promise<string> => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}-${Math.random()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('homepage')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('homepage')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "שגיאה",
        description: "נכשל בהעלאת התמונה",
        variant: "destructive"
      });
      throw error;
    } finally {
      setUploading(false);
    }
  };

  return { uploadImage, uploading };
};

// Duplicate section
export const useDuplicateSection = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (sectionId: string) => {
      // Get original section
      const { data: section, error: sectionError } = await supabase
        .from('homepage_sections')
        .select('*')
        .eq('id', sectionId)
        .maybeSingle();

      if (sectionError) throw sectionError;

      // Get original items
      const { data: items, error: itemsError } = await supabase
        .from('homepage_items')
        .select('*')
        .eq('section_id', sectionId)
        .order('order_index');

      if (itemsError) throw itemsError;

      // Create duplicate section
      const { data: newSection, error: createSectionError } = await supabase
        .from('homepage_sections')
        .insert({
          ...section,
          id: undefined,
          title_he: `${section.title_he} (עותק)`,
          status: 'draft',
          created_at: undefined,
          updated_at: undefined
        })
        .select()
        .maybeSingle();

      if (createSectionError) throw createSectionError;

      // Create duplicate items
      if (items.length > 0) {
        const { error: createItemsError } = await supabase
          .from('homepage_items')
          .insert(
            items.map(item => ({
              ...item,
              id: undefined,
              section_id: newSection.id,
              created_at: undefined
            }))
          );

        if (createItemsError) throw createItemsError;
      }

      return newSection;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepage-sections'] });
      toast({ title: "הצלחה", description: "הקטע שוכפל בהצלחה" });
    },
    onError: (error) => {
      console.error('Error duplicating section:', error);
      toast({ 
        title: "שגיאה", 
        description: "נכשל בשכפול הקטע", 
        variant: "destructive" 
      });
    }
  });
};