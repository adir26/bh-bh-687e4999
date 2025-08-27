import { useQuery } from '@tanstack/react-query';
import { useHomepagePublicContent } from '@/hooks/useHomepageCMS';
import type { HomepagePublicContent, Platform, AudienceContext, shouldShowToAudience } from '@/types/homepage';
import { shouldShowToAudience as audienceResolver } from '@/types/homepage';
import { useAuth } from '@/contexts/AuthContext';

interface GroupedHomepageContent {
  [sectionId: string]: {
    section: {
      id: string;
      type: string;
      title?: string;
      priority: number;
      platform: Platform;
      audience: Record<string, any>;
    };
    items: Array<{
      id: string;
      title?: string;
      subtitle?: string;
      image_url?: string;
      cta_label?: string;
      link_type?: string;
      link_target_id?: string;
      link_url?: string;
      order: number;
    }>;
  };
}

export const useHomepageContent = (platform: Platform = 'web') => {
  const { user } = useAuth();
  const { data: rawContent = [], ...queryProps } = useHomepagePublicContent(platform);

  const processedContent = useQuery({
    queryKey: ['processed-homepage-content', platform, user?.id],
    queryFn: () => {
      // Group content by section
      const grouped: GroupedHomepageContent = {};
      
      rawContent.forEach((item) => {
        const sectionId = item.section_id;
        
        if (!grouped[sectionId]) {
          grouped[sectionId] = {
            section: {
              id: item.section_id,
              type: item.section_type,
              title: item.section_title,
              priority: item.section_priority,
              platform: item.section_platform,
              audience: item.section_audience
            },
            items: []
          };
        }

        // Add item to section
        grouped[sectionId].items.push({
          id: item.item_id,
          title: item.item_title,
          subtitle: item.item_subtitle,
          image_url: item.item_image_url,
          cta_label: item.item_cta_label,
          link_type: item.item_link_type,
          link_target_id: item.item_link_target_id,
          link_url: item.item_link_url,
          order: item.item_order
        });
      });

      // Sort items within each section by order
      Object.values(grouped).forEach(section => {
        section.items.sort((a, b) => a.order - b.order);
      });

      // Apply audience targeting filters
      const audienceContext: AudienceContext = {
        platform,
        userRole: user?.role || 'guest',
        isNewUser: user ? isNewUser(user.created_at) : true,
        // Add more context as needed
      };

      const filteredSections = Object.values(grouped)
        .filter(section => audienceResolver(section.section.audience, audienceContext))
        .sort((a, b) => a.section.priority - b.section.priority);

      return filteredSections;
    },
    enabled: rawContent.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    ...queryProps,
    data: processedContent.data || [],
    isLoading: queryProps.isLoading || processedContent.isLoading,
  };
};

// Helper function to determine if user is new (registered within last 7 days)
function isNewUser(createdAt: string): boolean {
  const createdDate = new Date(createdAt);
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return createdDate > weekAgo;
}

// Content renderer helpers
export const getNavigationTarget = (
  linkType?: string,
  linkTargetId?: string,
  linkUrl?: string
): string | null => {
  if (!linkType) return null;

  switch (linkType) {
    case 'url':
      return linkUrl || null;
    case 'category':
      return linkTargetId ? `/category/${linkTargetId}/suppliers` : null;
    case 'supplier':
      return linkTargetId ? `/supplier/${linkTargetId}` : null;
    case 'screen':
      return linkTargetId || null;
    default:
      return null;
  }
};