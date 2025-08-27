export type SectionType = 'banner' | 'category_carousel' | 'supplier_cards' | 'tabs';
export type SectionStatus = 'draft' | 'published';
export type Platform = 'web' | 'ios' | 'android';
export type LinkType = 'url' | 'category' | 'supplier' | 'screen';

export interface HomepageSection {
  id: string;
  key?: string;
  type: SectionType;
  title_he?: string;
  description_he?: string;
  priority: number;
  is_active: boolean;
  start_at?: string;
  end_at?: string;
  platform: Platform;
  audience_json: Record<string, any>;
  status: SectionStatus;
  created_at: string;
  updated_at: string;
}

export interface HomepageItem {
  id: string;
  section_id: string;
  title_he?: string;
  subtitle_he?: string;
  image_url?: string;
  cta_label_he?: string;
  link_type?: LinkType;
  link_target_id?: string;
  link_url?: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

export interface HomepagePublicContent {
  section_id: string;
  section_type: SectionType;
  section_title?: string;
  section_priority: number;
  section_platform: Platform;
  section_audience: Record<string, any>;
  item_id: string;
  item_title?: string;
  item_subtitle?: string;
  item_image_url?: string;
  item_cta_label?: string;
  item_link_type?: LinkType;
  item_link_target_id?: string;
  item_link_url?: string;
  item_order: number;
}

export interface TelemetryEvent {
  id: string;
  occurred_at: string;
  user_id?: string;
  type: 'impression' | 'click';
  entity: string;
  entity_id: string;
  meta: Record<string, any>;
}

export interface CreateSectionRequest {
  key?: string;
  type: SectionType;
  title_he?: string;
  description_he?: string;
  priority?: number;
  is_active?: boolean;
  start_at?: string;
  end_at?: string;
  platform?: Platform;
  audience_json?: Record<string, any>;
  status?: SectionStatus;
}

export interface CreateItemRequest {
  section_id: string;
  title_he?: string;
  subtitle_he?: string;
  image_url?: string;
  cta_label_he?: string;
  link_type?: LinkType;
  link_target_id?: string;
  link_url?: string;
  order_index?: number;
  is_active?: boolean;
}

export interface UpdateSectionRequest extends Partial<CreateSectionRequest> {}
export interface UpdateItemRequest extends Partial<CreateItemRequest> {}

// Aspect ratio presets for image uploads
export const ASPECT_RATIOS = {
  hero: { width: 16, height: 9, label: 'גיבור 16:9' },
  card: { width: 4, height: 3, label: 'כרטיס 4:3' },
  avatar: { width: 1, height: 1, label: 'אווטר 1:1' }
} as const;

export type AspectRatioKey = keyof typeof ASPECT_RATIOS;

// Client-side audience targeting resolver
export interface AudienceContext {
  isNewUser?: boolean;
  city?: string;
  platform?: Platform;
  userRole?: string;
}

export function shouldShowToAudience(
  audienceRules: Record<string, any>,
  context: AudienceContext
): boolean {
  // If no rules, show to everyone
  if (!audienceRules || Object.keys(audienceRules).length === 0) {
    return true;
  }

  // Check each rule
  for (const [key, value] of Object.entries(audienceRules)) {
    switch (key) {
      case 'new_user':
        if (audienceRules.new_user !== context.isNewUser) return false;
        break;
      case 'city':
        if (audienceRules.city && audienceRules.city !== context.city) return false;
        break;
      case 'platform':
        if (audienceRules.platform && audienceRules.platform !== context.platform) return false;
        break;
      case 'user_role':
        if (audienceRules.user_role && audienceRules.user_role !== context.userRole) return false;
        break;
    }
  }

  return true;
}