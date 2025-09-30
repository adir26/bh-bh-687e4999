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
      const startTime = Date.now();
      
      // Check if client profile already exists
      const { data: existingProfile } = await supabase
        .from('client_profiles')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();

      // Save client profile data
      const clientProfileData = {
        user_id: userId,
        interests: data.interests || [],
        home_type: data.homeDetails?.homeType || '',
        property_size: data.homeDetails?.homeSize || '',
        budget_range: data.projectPlanning?.budget || '',
        project_timeline: data.projectPlanning?.timeline || '',
        preferences: {
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

      if (existingProfile) {
        // Update existing profile
        const { error: clientProfileError } = await supabase
          .from('client_profiles')
          .update(clientProfileData)
          .eq('user_id', userId);

        if (clientProfileError) throw clientProfileError;
      } else {
        // Insert new profile
        const { error: clientProfileError } = await supabase
          .from('client_profiles')
          .insert(clientProfileData);

        if (clientProfileError) {
          // If we get a duplicate key error, it means another process created it
          // Try to update instead
          if (clientProfileError.code === '23505') {
            const { error: updateError } = await supabase
              .from('client_profiles')
              .update(clientProfileData)
              .eq('user_id', userId);
            
            if (updateError) throw updateError;
          } else {
            throw clientProfileError;
          }
        }
      }

      // Update profile to mark onboarding as completed with new schema
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          onboarding_completed: true,
          onboarding_status: 'completed',
          onboarding_step: 0,
          onboarding_completed_at: new Date().toISOString(),
          onboarding_data: {
            interests: data.interests,
            contact_channels: data.contactChannels,
            languages: data.languages,
            home_details: data.homeDetails,
            project_planning: data.projectPlanning,
            documents: data.documents,
            completed_at: new Date().toISOString(),
            completion_duration_seconds: Math.round((Date.now() - startTime) / 1000)
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      // Save onboarding analytics for admin
      const completionDuration = Math.round((Date.now() - startTime) / 1000);
      const { error: analyticsError } = await supabase
        .from('onboarding_analytics')
        .insert({
          user_id: userId,
          user_role: 'client',
          completion_duration_seconds: completionDuration,
          onboarding_data: {
            interests: data.interests,
            contact_channels: data.contactChannels,
            languages: data.languages,
            home_details: data.homeDetails,
            project_planning: data.projectPlanning,
            documents: data.documents,
            completed_step: 'documents'
          }
        });

      if (analyticsError) {
        console.error('Error saving onboarding analytics:', analyticsError);
        // Don't fail the whole process for analytics
      }

      return { success: true };
    } catch (error) {
      console.error('Error saving client onboarding:', error);
      return { success: false, error };
    }
  }

  async saveSupplierOnboarding(userId: string, data: SupplierOnboardingData) {
    try {
      const startTime = Date.now();
      
      // Create company record first
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .upsert({
          owner_id: userId,
          name: data.companyInfo.companyName,
          description: data.branding?.description || '',
          website: data.companyInfo.website || null,
          city: data.companyInfo.operatingArea,
          email: data.companyInfo.email,
          logo_url: data.branding?.logo || null,
          slug: null // Will be auto-generated by trigger
        }, { onConflict: 'owner_id' })
        .select()
        .maybeSingle();

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

      // Update profile to mark onboarding as completed with new schema
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          onboarding_completed: true,
          onboarding_status: 'completed',
          onboarding_step: 0,
          onboarding_completed_at: new Date().toISOString(),
          onboarding_data: {
            company_info: data.companyInfo,
            branding: data.branding,
            products: data.products,
            completed_at: new Date().toISOString(),
            completion_duration_seconds: Math.round((Date.now() - startTime) / 1000)
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      // Save onboarding analytics for admin
      const completionDuration = Math.round((Date.now() - startTime) / 1000);
      const { error: onboardingAnalyticsError } = await supabase
        .from('onboarding_analytics')
        .insert({
          user_id: userId,
          user_role: 'supplier',
          completion_duration_seconds: completionDuration,
          onboarding_data: {
            company_info: data.companyInfo,
            branding: data.branding,
            products_count: data.products ? data.products.length : 0,
            has_products: data.products && data.products.length > 0,
            completed_step: 'supplier_summary'
          }
        });

      if (onboardingAnalyticsError) {
        console.error('Error saving onboarding analytics:', onboardingAnalyticsError);
        // Don't fail the whole process for analytics
      }

      // Save company analytics (existing)
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
        .from('client_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      return { data, error: null };
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