import { supabase } from '@/integrations/supabase/client';

export interface ClientOnboardingData {
  interests: string[];
  contactChannels: string[];
  languages: string[];
  notes?: string;
  homeDetails?: {
    homeType: string;
    homeSize: string;
    rooms: number;
    currentStage: string;
  };
  projectPlanning?: {
    budget: string;
    timeline: string;
    priorityAreas: string[];
    renovationType: string;
  };
  documents?: {
    hasDocuments: boolean;
    documentTypes: string[];
  };
}

export interface SupplierOnboardingData {
  companyInfo: {
    companyName: string;
    category: string;
    operatingArea: string;
    contactName: string;
    phone: string;
    email: string;
    website?: string;
  };
  branding?: {
    logo?: string;
    coverImage?: string;
    description?: string;
    services?: string[];
  };
  products?: Array<{
    name: string;
    category: string;
    price: number;
    description: string;
    image?: string;
  }>;
}

class OnboardingService {
  async saveClientOnboarding(userId: string, data: ClientOnboardingData) {
    try {
      // Update profile to mark onboarding as completed
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      // Save interests and preferences as user analytics
      const analyticsData = {
        user_id: userId,
        metric_name: 'onboarding_completion',
        metric_value: 1,
        metric_date: new Date().toISOString().split('T')[0],
        metadata: {
          type: 'client_onboarding',
          interests: data.interests,
          contactChannels: data.contactChannels,
          languages: data.languages,
          notes: data.notes,
          homeDetails: data.homeDetails,
          projectPlanning: data.projectPlanning,
          documents: data.documents,
          completed_at: new Date().toISOString()
        }
      };

      const { error: analyticsError } = await supabase
        .from('user_analytics')
        .insert(analyticsData);

      if (analyticsError) throw analyticsError;

      return { success: true };
    } catch (error) {
      console.error('Error saving client onboarding:', error);
      return { success: false, error };
    }
  }

  async saveSupplierOnboarding(userId: string, data: SupplierOnboardingData) {
    try {
      // Create company record first
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          owner_id: userId,
          name: data.companyInfo.companyName,
          description: data.branding?.description || '',
          website: data.companyInfo.website || null,
          city: data.companyInfo.operatingArea,
          phone: data.companyInfo.phone,
          email: data.companyInfo.email,
          logo_url: data.branding?.logo || null
        })
        .select()
        .single();

      if (companyError) throw companyError;

      // Create products if any
      if (data.products && data.products.length > 0) {
        const productsToInsert = data.products
          .filter(product => product.name && product.price)
          .map(product => ({
            supplier_id: userId,
            company_id: company.id,
            name: product.name,
            description: product.description || '',
            price: parseFloat(product.price.toString()),
            currency: 'ILS',
            is_published: false,
            images: product.image ? [product.image] : []
          }));

        if (productsToInsert.length > 0) {
          const { error: productsError } = await supabase
            .from('products')
            .insert(productsToInsert);

          if (productsError) throw productsError;
        }
      }

      // Update profile to mark onboarding as completed
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('id', userId);

      if (profileError) throw profileError;

      // Save company analytics
      const { error: analyticsError } = await supabase
        .from('company_analytics')
        .insert({
          company_id: company.id,
          metric_name: 'onboarding_completed',
          metric_value: 1,
          metric_date: new Date().toISOString().split('T')[0],
          metadata: {
            type: 'supplier_onboarding',
            category: data.companyInfo.category,
            operating_area: data.companyInfo.operatingArea,
            has_products: data.products && data.products.length > 0,
            products_count: data.products ? data.products.length : 0,
            completed_at: new Date().toISOString()
          }
        });

      if (analyticsError) {
        console.error('Error saving company analytics:', analyticsError);
        // Don't throw here as it's not critical
      }

      return { success: true, company };
    } catch (error) {
      console.error('Error saving supplier onboarding:', error);
      return { success: false, error };
    }
  }

  async getClientOnboardingData(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_analytics')
        .select('*')
        .eq('user_id', userId)
        .eq('metric_name', 'onboarding_interests')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      return { data: data?.metadata, error: null };
    } catch (error) {
      console.error('Error getting client onboarding data:', error);
      return { data: null, error };
    }
  }

  async getSupplierOnboardingData(userId: string) {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select(`
          *,
          products (*)
        `)
        .eq('owner_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error getting supplier onboarding data:', error);
      return { data: null, error };
    }
  }
}

export const onboardingService = new OnboardingService();