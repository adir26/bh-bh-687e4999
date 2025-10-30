import { supabase } from '@/integrations/supabase/client';
import { showToast } from '@/utils/toast';

export interface ClientOnboardingData {
  interests: string[];
  contactChannels: string[];
  languages: string[];
  notes?: string;
  agreeToMatchedSuppliers?: boolean;
  homeDetails?: {
    homeType: string;
    homeSize: string;
    rooms: number;
    currentStage: string;
    fullName?: string;
    street?: string;
    city?: string;
    apartmentSize?: string;
    email?: string;
    phone?: string;
  };
  projectPlanning?: {
    projectTypes?: string[];
    otherProject?: string;
    budgetRange?: string;
    startDate?: string;
    endDate?: string;
    // Legacy fields for backward compatibility
    budget?: string;
    timeline?: string;
    priorityAreas?: string[];
    renovationType?: string;
  };
  documents?: {
    hasDocuments: boolean;
    documentTypes: string[];
  };
}

export interface SupplierOnboardingData {
  companyInfo: {
    companyName: string;
    category: string | { id: string; name: string };
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
        budget_range: data.projectPlanning?.budgetRange || data.projectPlanning?.budget || '',
        project_timeline: data.projectPlanning?.timeline || '',
        preferences: {
          interests: data.interests,
          contactChannels: data.contactChannels,
          languages: data.languages,
          notes: data.notes,
          agreeToMatchedSuppliers: data.agreeToMatchedSuppliers,
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

      // Create lead record ALWAYS (consent only controls visibility)
      console.log('🎯 [ONBOARDING] Creating lead record');
      
      try {
        // Generate lead number
        const { data: leadNumber, error: leadNumberError } = await supabase
          .rpc('generate_lead_number');
        
        if (leadNumberError) {
          console.error('⚠️ [ONBOARDING] Failed to generate lead number:', leadNumberError);
          throw leadNumberError;
        }

        const leadData = {
          client_id: userId,
          name: data.homeDetails?.fullName || null,
          contact_email: data.homeDetails?.email || null,
          contact_phone: data.homeDetails?.phone || null,
          status: 'new' as const,
          source_key: 'onboarding',
          priority_key: 'medium',
          budget_range: data.projectPlanning?.budgetRange || null,
          start_date: data.projectPlanning?.startDate || null,
          end_date: data.projectPlanning?.endDate || null,
          consent_to_share: data.agreeToMatchedSuppliers || false,
          lead_number: leadNumber as string,
          notes: [
            data.notes,
            data.projectPlanning?.projectTypes?.join(', '),
            data.projectPlanning?.otherProject,
          ].filter(Boolean).join('\n') || null,
          address: data.homeDetails?.street || null,
          project_size: data.homeDetails?.homeSize
            ? `${data.homeDetails.homeSize}, ${data.homeDetails.rooms} חדרים`
            : null,
        };

        const { data: newLead, error: leadError } = await supabase
          .from('leads')
          .insert([leadData])
          .select()
          .single();

        if (leadError) {
          console.error('⚠️ [ONBOARDING] Failed to create lead:', leadError);
          // Don't fail the onboarding if lead creation fails
        } else {
          console.log('✅ [ONBOARDING] Lead created:', newLead.id);
          
          // Trigger score calculation ALWAYS
          try {
            await supabase.functions.invoke('compute-lead-score', {
              body: { leadId: newLead.id },
            });
            console.log('✅ [ONBOARDING] Lead score computed');
          } catch (scoreError) {
            console.error('⚠️ [ONBOARDING] Failed to compute lead score:', scoreError);
            // Don't fail the entire operation if scoring fails
          }
        }
      } catch (leadCreationError) {
        console.error('⚠️ [ONBOARDING] Lead creation process failed:', leadCreationError);
        // Don't fail the onboarding
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
      
      // Extract category info before any destructuring
      const selectedCategory = data.companyInfo?.category;
      const categoryId = typeof selectedCategory === 'object' ? selectedCategory.id : selectedCategory;
      
      // Check if company already exists
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', userId)
        .maybeSingle();

      let company;
      const companyData = {
        owner_id: userId,
        name: data.companyInfo.companyName,
        description: data.branding?.description || '',
        website: data.companyInfo.website || null,
        city: data.companyInfo.operatingArea,
        email: data.companyInfo.email,
        phone: data.companyInfo.phone,
        logo_url: data.branding?.logo || null,
        banner_url: data.branding?.coverImage || null,
        services: data.branding?.services || [],
        slug: null // Will be auto-generated by trigger
      };

      console.log('🔍 [ONBOARDING] Attempting to save company:', {
        userId,
        existingCompany: !!existingCompany,
        companyData: {
          name: companyData.name,
          email: companyData.email,
          city: companyData.city,
          servicesCount: companyData.services?.length || 0
        }
      });

      if (existingCompany) {
        console.log('📝 [ONBOARDING] Updating existing company:', existingCompany.id);
        const { data, error } = await supabase
          .from('companies')
          .update(companyData)
          .eq('owner_id', userId)
          .select()
          .single();

        if (error) {
          console.error('❌ [ONBOARDING] Company update failed:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
            userId,
            operation: 'UPDATE'
          });
          
          // Log audit (fire and forget)
          supabase.from('audit_logs').insert([{
            table_name: 'companies',
            operation: 'UPDATE',
            user_id: userId,
            record_id: existingCompany.id,
            old_values: { error: error.message },
            new_values: { 
              error_code: error.code,
              error_message: error.message,
              error_details: error.details,
              error_hint: error.hint
            }
          }]);
          
          throw error;
        }
        company = data;
        console.log('✅ [ONBOARDING] Company updated successfully:', company.id);
      } else {
        console.log('➕ [ONBOARDING] Creating new company');
        const { data, error } = await supabase
          .from('companies')
          .insert({
            ...companyData,
            status: 'approved',  // ✅ Auto-approve new companies
            is_public: true      // ✅ Make publicly visible immediately
          })
          .select()
          .single();

        if (error) {
          console.error('❌ [ONBOARDING] Company creation failed:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
            userId,
            operation: 'INSERT',
            companyData
          });
          
          // Log audit (fire and forget)
          supabase.from('audit_logs').insert([{
            table_name: 'companies',
            operation: 'INSERT',
            user_id: userId,
            old_values: null,
            new_values: { 
              error_code: error.code,
              error_message: error.message,
              error_details: error.details,
              error_hint: error.hint,
              attempted_data: JSON.parse(JSON.stringify(companyData))
            }
          }]);
          
          throw error;
        }
        company = data;
        console.log('✅ [ONBOARDING] Company created successfully:', company.id);
        
        // ✅ NEW: Link company to selected category from onboarding data
        if (categoryId) {
          console.log('🏷️ [ONBOARDING] Linking company to category:', categoryId);
          
          const { error: categoryError } = await supabase
            .from('company_categories')
            .insert({
              company_id: company.id,
              category_id: categoryId
            });
          
          if (categoryError) {
            console.error('⚠️ [ONBOARDING] Failed to link category:', categoryError);
            // Don't throw - category is not critical for onboarding
            // User can add it later from profile
          } else {
            console.log('✅ [ONBOARDING] Category linked successfully');
          }
        }
      }

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
      console.log('📋 [ONBOARDING] Updating profile with onboarding data');
      
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          role: 'supplier' as const,
          onboarding_completed: true,
          onboarding_status: 'completed' as const,
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

      if (profileError) {
        console.error('❌ [ONBOARDING] Profile update failed:', profileError);
        throw profileError;
      }

      console.log('✅ [ONBOARDING] Profile updated:', {
        userId,
        onboarding_completed: true,
        onboarding_data_saved: !!data.companyInfo
      });

      // ✅ CRITICAL: Add supplier role to user_roles table for proper authorization
      console.log('🔐 [ONBOARDING] Adding supplier role to user_roles...');
      
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'supplier'
        })
        .select()
        .maybeSingle();

      if (roleError) {
        // ✅ Duplicate key is OK - role already exists
        if (roleError.code === '23505') {
          console.log('ℹ️ [ONBOARDING] Supplier role already exists for user');
        } else {
          // ❌ CRITICAL ERROR: Failed to add supplier role
          console.error('❌ [ONBOARDING] CRITICAL: Failed to add supplier role:', {
            code: roleError.code,
            message: roleError.message,
            details: roleError.details,
            hint: roleError.hint
          });
          
          // Show error to user
          showToast.error(
            'לא הצלחנו להוסיף הרשאות ספק מלאות. אנא פנה לתמיכה כדי להשלים את ההרשמה.'
          );
          
          // Log to audit_logs for tracking
          await supabase.from('audit_logs').insert([{
            table_name: 'user_roles_failed',
            operation: 'INSERT',
            user_id: userId,
            record_id: userId,
            old_values: null,
            new_values: { 
              error_code: roleError.code,
              error_message: roleError.message,
              intended_role: 'supplier',
              timestamp: new Date().toISOString()
            },
            changed_fields: ['role_assignment_failed']
          }]);
          
          // ⚠️ Don't throw - allow onboarding to continue but user is warned
        }
      } else {
        console.log('✅ [ONBOARDING] Supplier role added successfully:', roleData);
      }

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

      console.log('🎉 [ONBOARDING] Supplier onboarding completed successfully');
      return { success: true, company };
    } catch (error: any) {
      console.error('❌ [ONBOARDING] CRITICAL ERROR:', error);
      
      // Save error to audit logs (fire and forget)
      supabase.from('audit_logs').insert([{
        table_name: 'onboarding_failure',
        operation: 'SAVE_SUPPLIER',
        user_id: userId,
        old_values: null,
        new_values: { 
          error: error.message, 
          stack: error.stack,
          code: error.code,
          details: error.details 
        }
      }]);
      
      return { 
        success: false, 
        error,
        errorMessage: error.message || 'Unknown error',
        errorCode: error.code
      };
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