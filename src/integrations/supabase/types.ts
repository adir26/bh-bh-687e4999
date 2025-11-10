export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      admin_audit_events: {
        Row: {
          admin_id: string
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
        }
        Relationships: []
      }
      admin_audit_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          metadata: Json | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_credentials: {
        Row: {
          created_at: string
          id: string
          last_login_at: string | null
          locked_until: string | null
          login_attempts: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_login_at?: string | null
          locked_until?: string | null
          login_attempts?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_login_at?: string | null
          locked_until?: string | null
          login_attempts?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      app_events: {
        Row: {
          event_name: string
          id: number
          metadata: Json | null
          occurred_at: string
          role: string | null
          user_id: string | null
        }
        Insert: {
          event_name: string
          id?: number
          metadata?: Json | null
          occurred_at?: string
          role?: string | null
          user_id?: string | null
        }
        Update: {
          event_name?: string
          id?: number
          metadata?: Json | null
          occurred_at?: string
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          changed_fields: string[] | null
          created_at: string
          id: string
          ip_address: unknown
          new_values: Json | null
          old_values: Json | null
          operation: string
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          changed_fields?: string[] | null
          created_at?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          operation: string
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          changed_fields?: string[] | null
          created_at?: string
          id?: string
          ip_address?: unknown
          new_values?: Json | null
          old_values?: Json | null
          operation?: string
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      automation_jobs: {
        Row: {
          automation_id: string
          created_at: string | null
          delivery_log: Json | null
          entity_id: string
          entity_type: string
          error_message: string | null
          executed_at: string | null
          id: string
          scheduled_for: string
          status: string | null
        }
        Insert: {
          automation_id: string
          created_at?: string | null
          delivery_log?: Json | null
          entity_id: string
          entity_type: string
          error_message?: string | null
          executed_at?: string | null
          id?: string
          scheduled_for: string
          status?: string | null
        }
        Update: {
          automation_id?: string
          created_at?: string | null
          delivery_log?: Json | null
          entity_id?: string
          entity_type?: string
          error_message?: string | null
          executed_at?: string | null
          id?: string
          scheduled_for?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_jobs_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "communication_automations"
            referencedColumns: ["id"]
          },
        ]
      }
      availability: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          start_time: string
          supplier_id: string
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          start_time: string
          supplier_id: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          start_time?: string
          supplier_id?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          client_id: string
          created_at: string
          ends_at: string
          id: string
          notes: string | null
          starts_at: string
          status: string
          supplier_id: string
          updated_at: string
        }
        Insert: {
          client_id: string
          created_at?: string
          ends_at: string
          id?: string
          notes?: string | null
          starts_at: string
          status?: string
          supplier_id: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          ends_at?: string
          id?: string
          notes?: string | null
          starts_at?: string
          status?: string
          supplier_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      budget_categories: {
        Row: {
          actual_amount: number
          budget_id: string
          committed_amount: number
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          name: string
          planned_amount: number
          updated_at: string | null
          variance_amount: number
          variance_percentage: number
        }
        Insert: {
          actual_amount?: number
          budget_id: string
          committed_amount?: number
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          name: string
          planned_amount?: number
          updated_at?: string | null
          variance_amount?: number
          variance_percentage?: number
        }
        Update: {
          actual_amount?: number
          budget_id?: string
          committed_amount?: number
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          name?: string
          planned_amount?: number
          updated_at?: string | null
          variance_amount?: number
          variance_percentage?: number
        }
        Relationships: [
          {
            foreignKeyName: "budget_categories_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_transactions: {
        Row: {
          amount: number
          budget_id: string
          category_id: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          reference_id: string | null
          reference_type: string
          transaction_date: string | null
          transaction_type: string
        }
        Insert: {
          amount: number
          budget_id: string
          category_id: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type: string
          transaction_date?: string | null
          transaction_type: string
        }
        Update: {
          amount?: number
          budget_id?: string
          category_id?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          reference_type?: string
          transaction_date?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_transactions_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "budget_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          client_id: string
          created_at: string | null
          id: string
          imported_at: string | null
          imported_from_quote_id: string | null
          order_id: string
          supplier_id: string
          total_actual: number
          total_committed: number
          total_planned: number
          updated_at: string | null
          variance: number
        }
        Insert: {
          client_id: string
          created_at?: string | null
          id?: string
          imported_at?: string | null
          imported_from_quote_id?: string | null
          order_id: string
          supplier_id: string
          total_actual?: number
          total_committed?: number
          total_planned?: number
          updated_at?: string | null
          variance?: number
        }
        Update: {
          client_id?: string
          created_at?: string | null
          id?: string
          imported_at?: string | null
          imported_from_quote_id?: string | null
          order_id?: string
          supplier_id?: string
          total_actual?: number
          total_committed?: number
          total_planned?: number
          updated_at?: string | null
          variance?: number
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_public: boolean | null
          name: string
          parent_id: string | null
          position: number | null
          slug: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          name: string
          parent_id?: string | null
          position?: number | null
          slug: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          name?: string
          parent_id?: string | null
          position?: number | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "top_categories_30d"
            referencedColumns: ["category_id"]
          },
        ]
      }
      change_order_events: {
        Row: {
          actor_id: string | null
          change_order_id: string
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
        }
        Insert: {
          actor_id?: string | null
          change_order_id: string
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          actor_id?: string | null
          change_order_id?: string
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      change_order_items: {
        Row: {
          change_order_id: string
          created_at: string
          description: string | null
          id: string
          item_type: string
          line_total: number
          name: string
          quantity: number
          unit_price: number
        }
        Insert: {
          change_order_id: string
          created_at?: string
          description?: string | null
          id?: string
          item_type: string
          line_total: number
          name: string
          quantity?: number
          unit_price: number
        }
        Update: {
          change_order_id?: string
          created_at?: string
          description?: string | null
          id?: string
          item_type?: string
          line_total?: number
          name?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: []
      }
      change_orders: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          client_id: string
          co_number: string
          created_at: string
          created_by: string
          description: string | null
          id: string
          order_id: string
          rejected_at: string | null
          rejection_reason: string | null
          sent_at: string | null
          status: string
          subtotal: number
          supplier_id: string
          tax_amount: number | null
          time_delta_days: number | null
          title: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          client_id: string
          co_number: string
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          order_id: string
          rejected_at?: string | null
          rejection_reason?: string | null
          sent_at?: string | null
          status?: string
          subtotal?: number
          supplier_id: string
          tax_amount?: number | null
          time_delta_days?: number | null
          title: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          client_id?: string
          co_number?: string
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          order_id?: string
          rejected_at?: string | null
          rejection_reason?: string | null
          sent_at?: string | null
          status?: string
          subtotal?: number
          supplier_id?: string
          tax_amount?: number | null
          time_delta_days?: number | null
          title?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      client_profiles: {
        Row: {
          budget_range: string | null
          created_at: string
          home_type: string | null
          id: string
          interests: string[] | null
          preferences: Json | null
          project_timeline: string | null
          property_size: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          budget_range?: string | null
          created_at?: string
          home_type?: string | null
          id?: string
          interests?: string[] | null
          preferences?: Json | null
          project_timeline?: string | null
          property_size?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          budget_range?: string | null
          created_at?: string
          home_type?: string | null
          id?: string
          interests?: string[] | null
          preferences?: Json | null
          project_timeline?: string | null
          property_size?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_automations: {
        Row: {
          channel: string
          created_at: string | null
          created_by: string | null
          delay_hours: number | null
          description: string | null
          id: string
          is_active: boolean | null
          message_template: Json
          name: string
          supplier_id: string | null
          template_id: string | null
          trigger_conditions: Json | null
          trigger_event: string
          updated_at: string | null
        }
        Insert: {
          channel: string
          created_at?: string | null
          created_by?: string | null
          delay_hours?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          message_template?: Json
          name: string
          supplier_id?: string | null
          template_id?: string | null
          trigger_conditions?: Json | null
          trigger_event: string
          updated_at?: string | null
        }
        Update: {
          channel?: string
          created_at?: string | null
          created_by?: string | null
          delay_hours?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          message_template?: Json
          name?: string
          supplier_id?: string | null
          template_id?: string | null
          trigger_conditions?: Json | null
          trigger_event?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      communication_opt_outs: {
        Row: {
          automation_type: string | null
          channel: string
          id: string
          opted_out_at: string | null
          reason: string | null
          supplier_id: string | null
          user_id: string
        }
        Insert: {
          automation_type?: string | null
          channel: string
          id?: string
          opted_out_at?: string | null
          reason?: string | null
          supplier_id?: string | null
          user_id: string
        }
        Update: {
          automation_type?: string | null
          channel?: string
          id?: string
          opted_out_at?: string | null
          reason?: string | null
          supplier_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          about_text: string | null
          address: string | null
          area: string | null
          banner_url: string | null
          business_hours: Json | null
          business_license: string | null
          city: string | null
          created_at: string
          description: string | null
          email: string | null
          featured: boolean | null
          gallery: Json | null
          id: string
          is_public: boolean | null
          logo_url: string | null
          meeting_availability: Json | null
          name: string
          owner_id: string
          phone: string | null
          price_range: Json | null
          products_count: number
          rating: number | null
          review_count: number | null
          services: Json | null
          slug: string
          status: string | null
          tagline: string | null
          tax_id: string | null
          updated_at: string
          verification_notes: string | null
          verification_status: string | null
          verified: boolean | null
          verified_at: string | null
          verified_by: string | null
          website: string | null
        }
        Insert: {
          about_text?: string | null
          address?: string | null
          area?: string | null
          banner_url?: string | null
          business_hours?: Json | null
          business_license?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          featured?: boolean | null
          gallery?: Json | null
          id?: string
          is_public?: boolean | null
          logo_url?: string | null
          meeting_availability?: Json | null
          name: string
          owner_id: string
          phone?: string | null
          price_range?: Json | null
          products_count?: number
          rating?: number | null
          review_count?: number | null
          services?: Json | null
          slug: string
          status?: string | null
          tagline?: string | null
          tax_id?: string | null
          updated_at?: string
          verification_notes?: string | null
          verification_status?: string | null
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
          website?: string | null
        }
        Update: {
          about_text?: string | null
          address?: string | null
          area?: string | null
          banner_url?: string | null
          business_hours?: Json | null
          business_license?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          featured?: boolean | null
          gallery?: Json | null
          id?: string
          is_public?: boolean | null
          logo_url?: string | null
          meeting_availability?: Json | null
          name?: string
          owner_id?: string
          phone?: string | null
          price_range?: Json | null
          products_count?: number
          rating?: number | null
          review_count?: number | null
          services?: Json | null
          slug?: string
          status?: string | null
          tagline?: string | null
          tax_id?: string | null
          updated_at?: string
          verification_notes?: string | null
          verification_status?: string | null
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_analytics: {
        Row: {
          company_id: string
          created_at: string
          id: string
          metadata: Json | null
          metric_date: string
          metric_name: string
          metric_value: number
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_date: string
          metric_name: string
          metric_value: number
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_date?: string
          metric_name?: string
          metric_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_company_analytics_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      company_categories: {
        Row: {
          category_id: string
          company_id: string
          created_at: string
          id: string
        }
        Insert: {
          category_id: string
          company_id: string
          created_at?: string
          id?: string
        }
        Update: {
          category_id?: string
          company_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "top_categories_30d"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "company_categories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          entity: string
          entity_id: string
          id: string
          meta: Json | null
          occurred_at: string | null
          type: string
          user_id: string | null
        }
        Insert: {
          entity: string
          entity_id: string
          id?: string
          meta?: Json | null
          occurred_at?: string | null
          type: string
          user_id?: string | null
        }
        Update: {
          entity?: string
          entity_id?: string
          id?: string
          meta?: Json | null
          occurred_at?: string | null
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          supplier_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          supplier_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          supplier_id?: string
          user_id?: string
        }
        Relationships: []
      }
      homepage_content: {
        Row: {
          block_name: string
          content_data: Json
          created_at: string
          display_order: number
          end_date: string | null
          id: string
          is_enabled: boolean
          start_date: string | null
          updated_at: string
        }
        Insert: {
          block_name: string
          content_data?: Json
          created_at?: string
          display_order?: number
          end_date?: string | null
          id?: string
          is_enabled?: boolean
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          block_name?: string
          content_data?: Json
          created_at?: string
          display_order?: number
          end_date?: string | null
          id?: string
          is_enabled?: boolean
          start_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      homepage_items: {
        Row: {
          created_at: string | null
          cta_label_he: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          link_target_id: string | null
          link_type: string | null
          link_url: string | null
          order_index: number | null
          section_id: string
          subtitle_he: string | null
          title_he: string | null
        }
        Insert: {
          created_at?: string | null
          cta_label_he?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link_target_id?: string | null
          link_type?: string | null
          link_url?: string | null
          order_index?: number | null
          section_id: string
          subtitle_he?: string | null
          title_he?: string | null
        }
        Update: {
          created_at?: string | null
          cta_label_he?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          link_target_id?: string | null
          link_type?: string | null
          link_url?: string | null
          order_index?: number | null
          section_id?: string
          subtitle_he?: string | null
          title_he?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "homepage_items_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "homepage_public"
            referencedColumns: ["section_id"]
          },
          {
            foreignKeyName: "homepage_items_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "homepage_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      homepage_sections: {
        Row: {
          audience_json: Json | null
          created_at: string | null
          description_he: string | null
          end_at: string | null
          id: string
          is_active: boolean | null
          key: string | null
          platform: string | null
          priority: number | null
          start_at: string | null
          status: string | null
          title_he: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          audience_json?: Json | null
          created_at?: string | null
          description_he?: string | null
          end_at?: string | null
          id?: string
          is_active?: boolean | null
          key?: string | null
          platform?: string | null
          priority?: number | null
          start_at?: string | null
          status?: string | null
          title_he?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          audience_json?: Json | null
          created_at?: string | null
          description_he?: string | null
          end_at?: string | null
          id?: string
          is_active?: boolean | null
          key?: string | null
          platform?: string | null
          priority?: number | null
          start_at?: string | null
          status?: string | null
          title_he?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ideabook_collaborators: {
        Row: {
          created_at: string
          id: string
          ideabook_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          ideabook_id: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          ideabook_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ideabook_collaborators_ideabook_id_fkey"
            columns: ["ideabook_id"]
            isOneToOne: false
            referencedRelation: "ideabooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ideabook_collaborators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ideabook_photos: {
        Row: {
          added_by: string
          created_at: string
          id: string
          ideabook_id: string
          photo_id: string
        }
        Insert: {
          added_by: string
          created_at?: string
          id?: string
          ideabook_id: string
          photo_id: string
        }
        Update: {
          added_by?: string
          created_at?: string
          id?: string
          ideabook_id?: string
          photo_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ideabook_photos_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ideabook_photos_ideabook_id_fkey"
            columns: ["ideabook_id"]
            isOneToOne: false
            referencedRelation: "ideabooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ideabook_photos_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "photos"
            referencedColumns: ["id"]
          },
        ]
      }
      ideabooks: {
        Row: {
          created_at: string
          id: string
          is_public: boolean
          name: string
          owner_id: string
          share_token: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_public?: boolean
          name: string
          owner_id: string
          share_token?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_public?: boolean
          name?: string
          owner_id?: string
          share_token?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ideabooks_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_costs: {
        Row: {
          created_at: string
          id: string
          item_id: string
          quantity: number
          total: number | null
          unit: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          quantity?: number
          total?: number | null
          unit?: string
          unit_price?: number
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          quantity?: number
          total?: number | null
          unit?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "inspection_costs_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inspection_items"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_items: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          location: string | null
          report_id: string
          severity: string | null
          standard_clause: string | null
          standard_code: string | null
          standard_quote: string | null
          status_check: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          report_id: string
          severity?: string | null
          standard_clause?: string | null
          standard_code?: string | null
          standard_quote?: string | null
          status_check?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          report_id?: string
          severity?: string | null
          standard_clause?: string | null
          standard_code?: string | null
          standard_quote?: string | null
          status_check?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspection_items_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "inspection_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_media: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          item_id: string | null
          report_id: string
          type: string
          url: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          item_id?: string | null
          report_id: string
          type: string
          url: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          item_id?: string | null
          report_id?: string
          type?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "inspection_media_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inspection_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_media_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "inspection_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_reports: {
        Row: {
          address: string | null
          brand_color: string | null
          client_id: string | null
          client_signature_url: string | null
          created_at: string
          created_by: string | null
          id: string
          inspection_date: string | null
          inspector_company: string | null
          inspector_email: string | null
          inspector_license: string | null
          inspector_name: string | null
          inspector_phone: string | null
          inspector_signature_url: string | null
          intro_text: string | null
          is_recurring: boolean | null
          logo_url: string | null
          notes: string | null
          outro_text: string | null
          pdf_url: string | null
          project_id: string | null
          project_name: string | null
          report_sent_at: string | null
          report_sent_via: string | null
          report_type: string
          status: string
          supplier_id: string
          template: string | null
          template_id: string | null
          updated_at: string
          version: number
        }
        Insert: {
          address?: string | null
          brand_color?: string | null
          client_id?: string | null
          client_signature_url?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          inspection_date?: string | null
          inspector_company?: string | null
          inspector_email?: string | null
          inspector_license?: string | null
          inspector_name?: string | null
          inspector_phone?: string | null
          inspector_signature_url?: string | null
          intro_text?: string | null
          is_recurring?: boolean | null
          logo_url?: string | null
          notes?: string | null
          outro_text?: string | null
          pdf_url?: string | null
          project_id?: string | null
          project_name?: string | null
          report_sent_at?: string | null
          report_sent_via?: string | null
          report_type: string
          status?: string
          supplier_id: string
          template?: string | null
          template_id?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          address?: string | null
          brand_color?: string | null
          client_id?: string | null
          client_signature_url?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          inspection_date?: string | null
          inspector_company?: string | null
          inspector_email?: string | null
          inspector_license?: string | null
          inspector_name?: string | null
          inspector_phone?: string | null
          inspector_signature_url?: string | null
          intro_text?: string | null
          is_recurring?: boolean | null
          logo_url?: string | null
          notes?: string | null
          outro_text?: string | null
          pdf_url?: string | null
          project_id?: string | null
          project_name?: string | null
          report_sent_at?: string | null
          report_sent_via?: string | null
          report_type?: string
          status?: string
          supplier_id?: string
          template?: string | null
          template_id?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "inspection_reports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inspection_reports_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "inspection_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      inspection_templates: {
        Row: {
          brand_color: string | null
          created_at: string
          created_by: string | null
          id: string
          intro_text: string | null
          layout_json: Json | null
          logo_url: string | null
          name: string
          outro_text: string | null
          report_type: string
          updated_at: string
        }
        Insert: {
          brand_color?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          intro_text?: string | null
          layout_json?: Json | null
          logo_url?: string | null
          name: string
          outro_text?: string | null
          report_type: string
          updated_at?: string
        }
        Update: {
          brand_color?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          intro_text?: string | null
          layout_json?: Json | null
          logo_url?: string | null
          name?: string
          outro_text?: string | null
          report_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      kpi_daily: {
        Row: {
          d: string
          dau: number
          mau: number
          signups_customers: number
          signups_suppliers: number
          signups_total: number
          wau: number
        }
        Insert: {
          d: string
          dau?: number
          mau?: number
          signups_customers?: number
          signups_suppliers?: number
          signups_total?: number
          wau?: number
        }
        Update: {
          d?: string
          dau?: number
          mau?: number
          signups_customers?: number
          signups_suppliers?: number
          signups_total?: number
          wau?: number
        }
        Relationships: []
      }
      lead_activities: {
        Row: {
          activity_type: string
          completed_at: string | null
          created_at: string
          description: string | null
          id: string
          lead_id: string
          next_action: string | null
          outcome: string | null
          scheduled_for: string | null
          title: string
          user_id: string
        }
        Insert: {
          activity_type: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          lead_id: string
          next_action?: string | null
          outcome?: string | null
          scheduled_for?: string | null
          title: string
          user_id: string
        }
        Update: {
          activity_type?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          lead_id?: string
          next_action?: string | null
          outcome?: string | null
          scheduled_for?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_lead_activities_lead"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_assignments: {
        Row: {
          assigned_at: string | null
          lead_id: string
          supplier_id: string
        }
        Insert: {
          assigned_at?: string | null
          lead_id: string
          supplier_id: string
        }
        Update: {
          assigned_at?: string | null
          lead_id?: string
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_assignments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_assignments_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_automations: {
        Row: {
          created_at: string
          executed_at: string | null
          id: string
          lead_id: string
          next_run_at: string
          rule_config: Json | null
          rule_type: string
          status: string | null
        }
        Insert: {
          created_at?: string
          executed_at?: string | null
          id?: string
          lead_id: string
          next_run_at: string
          rule_config?: Json | null
          rule_type: string
          status?: string | null
        }
        Update: {
          created_at?: string
          executed_at?: string | null
          id?: string
          lead_id?: string
          next_run_at?: string
          rule_config?: Json | null
          rule_type?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_automations_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_history: {
        Row: {
          changed_by: string | null
          created_at: string | null
          from_status: string | null
          id: string
          lead_id: string
          note: string | null
          to_status: string | null
        }
        Insert: {
          changed_by?: string | null
          created_at?: string | null
          from_status?: string | null
          id?: string
          lead_id: string
          note?: string | null
          to_status?: string | null
        }
        Update: {
          changed_by?: string | null
          created_at?: string | null
          from_status?: string | null
          id?: string
          lead_id?: string
          note?: string | null
          to_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_history_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_priority_dim: {
        Row: {
          active: boolean
          key: string
          label: string
          rank: number
        }
        Insert: {
          active?: boolean
          key: string
          label: string
          rank: number
        }
        Update: {
          active?: boolean
          key?: string
          label?: string
          rank?: number
        }
        Relationships: []
      }
      lead_scores: {
        Row: {
          breakdown: Json
          id: string
          lead_id: string
          score: number
          updated_at: string
        }
        Insert: {
          breakdown?: Json
          id?: string
          lead_id: string
          score: number
          updated_at?: string
        }
        Update: {
          breakdown?: Json
          id?: string
          lead_id?: string
          score?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_scores_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: true
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_source_dim: {
        Row: {
          channel: string
          key: string
          label: string
        }
        Insert: {
          channel?: string
          key: string
          label: string
        }
        Update: {
          channel?: string
          key?: string
          label?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          assigned_to: string | null
          budget_range: string | null
          campaign_name: string | null
          client_id: string | null
          company_id: string | null
          consent_to_share: boolean | null
          contact_email: string | null
          contact_method: string | null
          contact_phone: string | null
          converted_at: string | null
          created_at: string
          end_date: string | null
          estimated_value: number | null
          expected_close_date: string | null
          first_response_at: string | null
          id: string
          last_contact_date: string | null
          lead_number: string
          lost_reason: string | null
          metadata: Json | null
          name: string | null
          next_follow_up_date: string | null
          notes: string | null
          priority: string | null
          priority_key: string
          probability: number | null
          project_id: string | null
          sla_risk: boolean | null
          snoozed_until: string | null
          source: string | null
          source_key: string
          start_date: string | null
          status: string | null
          supplier_id: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          budget_range?: string | null
          campaign_name?: string | null
          client_id?: string | null
          company_id?: string | null
          consent_to_share?: boolean | null
          contact_email?: string | null
          contact_method?: string | null
          contact_phone?: string | null
          converted_at?: string | null
          created_at?: string
          end_date?: string | null
          estimated_value?: number | null
          expected_close_date?: string | null
          first_response_at?: string | null
          id?: string
          last_contact_date?: string | null
          lead_number: string
          lost_reason?: string | null
          metadata?: Json | null
          name?: string | null
          next_follow_up_date?: string | null
          notes?: string | null
          priority?: string | null
          priority_key?: string
          probability?: number | null
          project_id?: string | null
          sla_risk?: boolean | null
          snoozed_until?: string | null
          source?: string | null
          source_key?: string
          start_date?: string | null
          status?: string | null
          supplier_id?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          budget_range?: string | null
          campaign_name?: string | null
          client_id?: string | null
          company_id?: string | null
          consent_to_share?: boolean | null
          contact_email?: string | null
          contact_method?: string | null
          contact_phone?: string | null
          converted_at?: string | null
          created_at?: string
          end_date?: string | null
          estimated_value?: number | null
          expected_close_date?: string | null
          first_response_at?: string | null
          id?: string
          last_contact_date?: string | null
          lead_number?: string
          lost_reason?: string | null
          metadata?: Json | null
          name?: string | null
          next_follow_up_date?: string | null
          notes?: string | null
          priority?: string | null
          priority_key?: string
          probability?: number | null
          project_id?: string | null
          sla_risk?: boolean | null
          snoozed_until?: string | null
          source?: string | null
          source_key?: string
          start_date?: string | null
          status?: string | null
          supplier_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_leads_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_priority_fk"
            columns: ["priority_key"]
            isOneToOne: false
            referencedRelation: "lead_priority_dim"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "leads_priority_key_fkey"
            columns: ["priority_key"]
            isOneToOne: false
            referencedRelation: "lead_priority_dim"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "leads_source_key_fkey"
            columns: ["source_key"]
            isOneToOne: false
            referencedRelation: "lead_source_dim"
            referencedColumns: ["key"]
          },
        ]
      }
      meetings: {
        Row: {
          created_at: string
          datetime: string
          id: string
          notes: string | null
          status: string
          supplier_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          datetime: string
          id?: string
          notes?: string | null
          status?: string
          supplier_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          datetime?: string
          id?: string
          notes?: string | null
          status?: string
          supplier_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          order_id: string | null
          project_id: string | null
          read_at: string | null
          recipient_id: string
          sender_id: string
          status: Database["public"]["Enums"]["message_status"]
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          order_id?: string | null
          project_id?: string | null
          read_at?: string | null
          recipient_id: string
          sender_id: string
          status?: Database["public"]["Enums"]["message_status"]
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          order_id?: string | null
          project_id?: string | null
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
          status?: Database["public"]["Enums"]["message_status"]
        }
        Relationships: [
          {
            foreignKeyName: "messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mood_board_comments: {
        Row: {
          client_email: string | null
          client_name: string | null
          comment_text: string
          created_at: string
          id: string
          is_supplier: boolean
          item_id: string | null
          mood_board_id: string
          user_id: string | null
        }
        Insert: {
          client_email?: string | null
          client_name?: string | null
          comment_text: string
          created_at?: string
          id?: string
          is_supplier?: boolean
          item_id?: string | null
          mood_board_id: string
          user_id?: string | null
        }
        Update: {
          client_email?: string | null
          client_name?: string | null
          comment_text?: string
          created_at?: string
          id?: string
          is_supplier?: boolean
          item_id?: string | null
          mood_board_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mood_board_comments_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "mood_board_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mood_board_comments_mood_board_id_fkey"
            columns: ["mood_board_id"]
            isOneToOne: false
            referencedRelation: "mood_boards"
            referencedColumns: ["id"]
          },
        ]
      }
      mood_board_items: {
        Row: {
          created_at: string
          currency: string | null
          description: string | null
          display_order: number
          height: number
          id: string
          image_url: string
          is_featured: boolean
          mood_board_id: string
          position_x: number
          position_y: number
          price: number | null
          product_id: string | null
          supplier_id: string
          supplier_notes: string | null
          title: string
          updated_at: string
          width: number
        }
        Insert: {
          created_at?: string
          currency?: string | null
          description?: string | null
          display_order?: number
          height?: number
          id?: string
          image_url: string
          is_featured?: boolean
          mood_board_id: string
          position_x?: number
          position_y?: number
          price?: number | null
          product_id?: string | null
          supplier_id: string
          supplier_notes?: string | null
          title: string
          updated_at?: string
          width?: number
        }
        Update: {
          created_at?: string
          currency?: string | null
          description?: string | null
          display_order?: number
          height?: number
          id?: string
          image_url?: string
          is_featured?: boolean
          mood_board_id?: string
          position_x?: number
          position_y?: number
          price?: number | null
          product_id?: string | null
          supplier_id?: string
          supplier_notes?: string | null
          title?: string
          updated_at?: string
          width?: number
        }
        Relationships: [
          {
            foreignKeyName: "mood_board_items_mood_board_id_fkey"
            columns: ["mood_board_id"]
            isOneToOne: false
            referencedRelation: "mood_boards"
            referencedColumns: ["id"]
          },
        ]
      }
      mood_board_reactions: {
        Row: {
          client_identifier: string | null
          created_at: string
          id: string
          item_id: string | null
          mood_board_id: string
          reaction_type: string
          user_id: string | null
        }
        Insert: {
          client_identifier?: string | null
          created_at?: string
          id?: string
          item_id?: string | null
          mood_board_id: string
          reaction_type?: string
          user_id?: string | null
        }
        Update: {
          client_identifier?: string | null
          created_at?: string
          id?: string
          item_id?: string | null
          mood_board_id?: string
          reaction_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mood_board_reactions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "mood_board_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mood_board_reactions_mood_board_id_fkey"
            columns: ["mood_board_id"]
            isOneToOne: false
            referencedRelation: "mood_boards"
            referencedColumns: ["id"]
          },
        ]
      }
      mood_boards: {
        Row: {
          client_can_interact: boolean
          client_id: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          order_id: string | null
          share_token: string
          status: string
          supplier_id: string
          title: string
          updated_at: string
        }
        Insert: {
          client_can_interact?: boolean
          client_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          order_id?: string | null
          share_token?: string
          status?: string
          supplier_id: string
          title: string
          updated_at?: string
        }
        Update: {
          client_can_interact?: boolean
          client_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          order_id?: string | null
          share_token?: string
          status?: string
          supplier_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          categories: Json
          created_at: string
          email_opt_in: boolean
          marketing: boolean
          orders: boolean
          push_opt_in: boolean
          system: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          categories?: Json
          created_at?: string
          email_opt_in?: boolean
          marketing?: boolean
          orders?: boolean
          push_opt_in?: boolean
          system?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          categories?: Json
          created_at?: string
          email_opt_in?: boolean
          marketing?: boolean
          orders?: boolean
          push_opt_in?: boolean
          system?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          payload: Json
          priority: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          payload?: Json
          priority?: string | null
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          payload?: Json
          priority?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      onboarding_analytics: {
        Row: {
          completed_at: string
          completion_duration_seconds: number | null
          created_at: string
          id: string
          onboarding_data: Json | null
          user_id: string
          user_role: string
        }
        Insert: {
          completed_at?: string
          completion_duration_seconds?: number | null
          created_at?: string
          id?: string
          onboarding_data?: Json | null
          user_id: string
          user_role: string
        }
        Update: {
          completed_at?: string
          completion_duration_seconds?: number | null
          created_at?: string
          id?: string
          onboarding_data?: Json | null
          user_id?: string
          user_role?: string
        }
        Relationships: []
      }
      order_attachments: {
        Row: {
          created_at: string
          file_url: string
          id: string
          label: string | null
          order_id: string
        }
        Insert: {
          created_at?: string
          file_url: string
          id?: string
          label?: string | null
          order_id: string
        }
        Update: {
          created_at?: string
          file_url?: string
          id?: string
          label?: string | null
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_attachments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_calls: {
        Row: {
          created_at: string
          id: string
          note: string | null
          order_id: string
          outcome: string
          phone_e164: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          order_id: string
          outcome: string
          phone_e164: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          order_id?: string
          outcome?: string
          phone_e164?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_calls_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_events: {
        Row: {
          actor_id: string | null
          created_at: string
          event_type: string
          id: string
          meta: Json | null
          order_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          meta?: Json | null
          order_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          meta?: Json | null
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_files: {
        Row: {
          created_at: string
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          mime_type: string | null
          order_id: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          mime_type?: string | null
          order_id: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          mime_type?: string | null
          order_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_files_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          line_total: number
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          line_total?: number
          order_id: string
          product_id?: string | null
          product_name: string
          quantity?: number
          unit_price: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          line_total?: number
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_messages: {
        Row: {
          created_at: string
          file_name: string | null
          file_url: string | null
          id: string
          message_text: string | null
          order_id: string
          read_by: Json | null
          sender_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          message_text?: string | null
          order_id: string
          read_by?: Json | null
          sender_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          message_text?: string | null
          order_id?: string
          read_by?: Json | null
          sender_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_events: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          is_customer_visible: boolean
          new_status: string
          note: string | null
          old_status: string | null
          order_id: string
          reason: string | null
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          is_customer_visible?: boolean
          new_status: string
          note?: string | null
          old_status?: string | null
          order_id: string
          reason?: string | null
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          is_customer_visible?: boolean
          new_status?: string
          note?: string | null
          old_status?: string | null
          order_id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_status_events_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_status_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_by: string
          created_at: string
          id: string
          notes: string | null
          order_id: string
          status: string
        }
        Insert: {
          changed_by: string
          created_at?: string
          id?: string
          notes?: string | null
          order_id: string
          status: string
        }
        Update: {
          changed_by?: string
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_order_status_history_order"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address_json: Json
          amount: number
          client_id: string
          closed_at: string | null
          completed_at: string | null
          created_at: string
          current_status: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          customer_phone_e164: string | null
          description: string | null
          due_date: string | null
          end_date: string | null
          eta_at: string | null
          id: string
          lead_id: string | null
          order_number: string | null
          payment_status: string | null
          project_id: string
          refunded_total: number | null
          shipping_address: Json | null
          start_date: string | null
          status: Database["public"]["Enums"]["order_status"]
          supplier_id: string
          title: string
          total_amount: number
          total_ils: number | null
          updated_at: string
        }
        Insert: {
          address_json?: Json
          amount: number
          client_id: string
          closed_at?: string | null
          completed_at?: string | null
          created_at?: string
          current_status?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          customer_phone_e164?: string | null
          description?: string | null
          due_date?: string | null
          end_date?: string | null
          eta_at?: string | null
          id?: string
          lead_id?: string | null
          order_number?: string | null
          payment_status?: string | null
          project_id: string
          refunded_total?: number | null
          shipping_address?: Json | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          supplier_id: string
          title: string
          total_amount?: number
          total_ils?: number | null
          updated_at?: string
        }
        Update: {
          address_json?: Json
          amount?: number
          client_id?: string
          closed_at?: string | null
          completed_at?: string | null
          created_at?: string
          current_status?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          customer_phone_e164?: string | null
          description?: string | null
          due_date?: string | null
          end_date?: string | null
          eta_at?: string | null
          id?: string
          lead_id?: string | null
          order_number?: string | null
          payment_status?: string | null
          project_id?: string
          refunded_total?: number | null
          shipping_address?: Json | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          supplier_id?: string
          title?: string
          total_amount?: number
          total_ils?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_links: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          expires_at: string | null
          external_id: string | null
          id: string
          order_id: string
          paid_at: string | null
          payment_url: string | null
          provider: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          expires_at?: string | null
          external_id?: string | null
          id?: string
          order_id: string
          paid_at?: string | null
          payment_url?: string | null
          provider?: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          expires_at?: string | null
          external_id?: string | null
          id?: string
          order_id?: string
          paid_at?: string | null
          payment_url?: string | null
          provider?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_links_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      photo_likes: {
        Row: {
          created_at: string
          id: string
          photo_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          photo_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          photo_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "photo_likes_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "photos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      photo_products: {
        Row: {
          created_at: string
          id: string
          note: string | null
          photo_id: string
          product_id: string | null
          supplier_id: string | null
          tag_position: Json
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          photo_id: string
          product_id?: string | null
          supplier_id?: string | null
          tag_position?: Json
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          photo_id?: string
          product_id?: string | null
          supplier_id?: string | null
          tag_position?: Json
        }
        Relationships: [
          {
            foreignKeyName: "photo_products_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "photos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      photo_tags: {
        Row: {
          created_at: string
          id: string
          photo_id: string
          tag: string
        }
        Insert: {
          created_at?: string
          id?: string
          photo_id: string
          tag: string
        }
        Update: {
          created_at?: string
          id?: string
          photo_id?: string
          tag?: string
        }
        Relationships: [
          {
            foreignKeyName: "photo_tags_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: false
            referencedRelation: "photos"
            referencedColumns: ["id"]
          },
        ]
      }
      photos: {
        Row: {
          color_palette: Json | null
          company_id: string | null
          created_at: string
          description: string | null
          height: number | null
          id: string
          is_public: boolean
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          room: string | null
          status: string | null
          storage_path: string
          style: string | null
          title: string
          updated_at: string
          uploader_id: string
          width: number | null
        }
        Insert: {
          color_palette?: Json | null
          company_id?: string | null
          created_at?: string
          description?: string | null
          height?: number | null
          id?: string
          is_public?: boolean
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          room?: string | null
          status?: string | null
          storage_path: string
          style?: string | null
          title: string
          updated_at?: string
          uploader_id: string
          width?: number | null
        }
        Update: {
          color_palette?: Json | null
          company_id?: string | null
          created_at?: string
          description?: string | null
          height?: number | null
          id?: string
          is_public?: boolean
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          room?: string | null
          status?: string | null
          storage_path?: string
          style?: string | null
          title?: string
          updated_at?: string
          uploader_id?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "photos_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photos_uploader_id_fkey"
            columns: ["uploader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          category_id: string
          created_at: string
          id: string
          product_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          product_id: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_product_categories_category"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_product_categories_category"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "top_categories_30d"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "fk_product_categories_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean
          product_id: string
          public_url: string | null
          sort_order: number
          storage_path: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean
          product_id: string
          public_url?: string | null
          sort_order?: number
          storage_path: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean
          product_id?: string
          public_url?: string | null
          sort_order?: number
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          company_id: string | null
          created_at: string
          currency: string
          delivery_time_days: number | null
          description: string | null
          id: string
          images: string[] | null
          is_published: boolean | null
          is_service: boolean | null
          minimum_order: number | null
          name: string
          price: number | null
          price_unit: string | null
          specifications: Json | null
          stock_quantity: number | null
          supplier_id: string
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          company_id?: string | null
          created_at?: string
          currency?: string
          delivery_time_days?: number | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_published?: boolean | null
          is_service?: boolean | null
          minimum_order?: number | null
          name: string
          price?: number | null
          price_unit?: string | null
          specifications?: Json | null
          stock_quantity?: number | null
          supplier_id: string
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          company_id?: string | null
          created_at?: string
          currency?: string
          delivery_time_days?: number | null
          description?: string | null
          id?: string
          images?: string[] | null
          is_published?: boolean | null
          is_service?: boolean | null
          minimum_order?: number | null
          name?: string
          price?: number | null
          price_unit?: string | null
          specifications?: Json | null
          stock_quantity?: number | null
          supplier_id?: string
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_products_category"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_products_category"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "top_categories_30d"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "fk_products_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          block_reason: string | null
          blocked_at: string | null
          blocked_by: string | null
          created_at: string
          email: string
          first_login_at: string | null
          full_name: string | null
          id: string
          is_blocked: boolean | null
          last_login_at: string | null
          last_onboarding_at: string | null
          onboarding_completed: boolean | null
          onboarding_completed_at: string | null
          onboarding_context: Json | null
          onboarding_data: Json | null
          onboarding_skipped: boolean | null
          onboarding_status:
            | Database["public"]["Enums"]["onboarding_status"]
            | null
          onboarding_step: number | null
          onboarding_version: number | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          block_reason?: string | null
          blocked_at?: string | null
          blocked_by?: string | null
          created_at?: string
          email: string
          first_login_at?: string | null
          full_name?: string | null
          id: string
          is_blocked?: boolean | null
          last_login_at?: string | null
          last_onboarding_at?: string | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          onboarding_context?: Json | null
          onboarding_data?: Json | null
          onboarding_skipped?: boolean | null
          onboarding_status?:
            | Database["public"]["Enums"]["onboarding_status"]
            | null
          onboarding_step?: number | null
          onboarding_version?: number | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          block_reason?: string | null
          blocked_at?: string | null
          blocked_by?: string | null
          created_at?: string
          email?: string
          first_login_at?: string | null
          full_name?: string | null
          id?: string
          is_blocked?: boolean | null
          last_login_at?: string | null
          last_onboarding_at?: string | null
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          onboarding_context?: Json | null
          onboarding_data?: Json | null
          onboarding_skipped?: boolean | null
          onboarding_status?:
            | Database["public"]["Enums"]["onboarding_status"]
            | null
          onboarding_step?: number | null
          onboarding_version?: number | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_blocked_by_fkey"
            columns: ["blocked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_participants: {
        Row: {
          created_at: string
          id: string
          project_id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_participants_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          budget_max: number | null
          budget_min: number | null
          category_id: string | null
          client_id: string
          created_at: string
          description: string | null
          detailed_status:
            | Database["public"]["Enums"]["project_detailed_status"]
            | null
          end_date: string | null
          id: string
          location: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"]
          title: string
          updated_at: string
        }
        Insert: {
          budget_max?: number | null
          budget_min?: number | null
          category_id?: string | null
          client_id: string
          created_at?: string
          description?: string | null
          detailed_status?:
            | Database["public"]["Enums"]["project_detailed_status"]
            | null
          end_date?: string | null
          id?: string
          location?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          title: string
          updated_at?: string
        }
        Update: {
          budget_max?: number | null
          budget_min?: number | null
          category_id?: string | null
          client_id?: string
          created_at?: string
          description?: string | null
          detailed_status?:
            | Database["public"]["Enums"]["project_detailed_status"]
            | null
          end_date?: string | null
          id?: string
          location?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "top_categories_30d"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_events: {
        Row: {
          actor_id: string | null
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          proposal_id: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          proposal_id: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          proposal_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposal_events_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          created_at: string
          html_content: string | null
          id: string
          pdf_url: string | null
          quote_id: string
          status: string
          updated_at: string
          version: number
        }
        Insert: {
          created_at?: string
          html_content?: string | null
          id?: string
          pdf_url?: string | null
          quote_id: string
          status?: string
          updated_at?: string
          version?: number
        }
        Update: {
          created_at?: string
          html_content?: string | null
          id?: string
          pdf_url?: string | null
          quote_id?: string
          status?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "proposals_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiet_hours_config: {
        Row: {
          created_at: string | null
          days_of_week: number[] | null
          end_time: string
          id: string
          is_active: boolean | null
          start_time: string
          supplier_id: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          days_of_week?: number[] | null
          end_time?: string
          id?: string
          is_active?: boolean | null
          start_time?: string
          supplier_id?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          days_of_week?: number[] | null
          end_time?: string
          id?: string
          is_active?: boolean | null
          start_time?: string
          supplier_id?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      quote_approvals: {
        Row: {
          approval_date: string
          client_email: string | null
          client_id_number: string
          client_name: string
          client_phone: string
          consent_text: string
          created_at: string
          id: string
          ip_address: unknown
          quote_id: string
          rejection_reason: string | null
          share_token: string
          signature_hash: string | null
          signature_storage_path: string | null
          status: string
          supplier_id: string
          user_agent: string
        }
        Insert: {
          approval_date?: string
          client_email?: string | null
          client_id_number: string
          client_name: string
          client_phone: string
          consent_text: string
          created_at?: string
          id?: string
          ip_address: unknown
          quote_id: string
          rejection_reason?: string | null
          share_token: string
          signature_hash?: string | null
          signature_storage_path?: string | null
          status: string
          supplier_id: string
          user_agent: string
        }
        Update: {
          approval_date?: string
          client_email?: string | null
          client_id_number?: string
          client_name?: string
          client_phone?: string
          consent_text?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          quote_id?: string
          rejection_reason?: string | null
          share_token?: string
          signature_hash?: string | null
          signature_storage_path?: string | null
          status?: string
          supplier_id?: string
          user_agent?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_approvals_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          product_id: string | null
          quantity: number
          quote_id: string
          sort_order: number
          subtotal: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          product_id?: string | null
          quantity?: number
          quote_id: string
          sort_order?: number
          subtotal: number
          unit_price: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          product_id?: string | null
          quantity?: number
          quote_id?: string
          sort_order?: number
          subtotal?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_quote_items_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_quote_items_quote"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_share_links: {
        Row: {
          access_count: number
          accessed_at: string | null
          created_at: string
          expires_at: string
          id: string
          quote_id: string
          token: string
        }
        Insert: {
          access_count?: number
          accessed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          quote_id: string
          token: string
        }
        Update: {
          access_count?: number
          accessed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          quote_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_share_links_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          client_id: string | null
          created_at: string
          description: string | null
          discount_amount: number | null
          id: string
          lead_id: string | null
          notes: string | null
          order_id: string | null
          project_id: string | null
          quote_number: string
          responded_at: string | null
          sent_at: string | null
          status: string | null
          subtotal: number
          supplier_id: string
          tax_amount: number | null
          template: string | null
          terms_conditions: string | null
          title: string
          total_amount: number
          updated_at: string
          valid_until: string | null
          viewed_at: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          discount_amount?: number | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          order_id?: string | null
          project_id?: string | null
          quote_number: string
          responded_at?: string | null
          sent_at?: string | null
          status?: string | null
          subtotal?: number
          supplier_id: string
          tax_amount?: number | null
          template?: string | null
          terms_conditions?: string | null
          title: string
          total_amount?: number
          updated_at?: string
          valid_until?: string | null
          viewed_at?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string
          description?: string | null
          discount_amount?: number | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          order_id?: string | null
          project_id?: string | null
          quote_number?: string
          responded_at?: string | null
          sent_at?: string | null
          status?: string | null
          subtotal?: number
          supplier_id?: string
          tax_amount?: number | null
          template?: string | null
          terms_conditions?: string | null
          title?: string
          total_amount?: number
          updated_at?: string
          valid_until?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_quotes_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits_config: {
        Row: {
          channel: string
          created_at: string | null
          id: string
          is_active: boolean | null
          max_per_day: number | null
          max_per_hour: number | null
          supplier_id: string | null
          updated_at: string | null
        }
        Insert: {
          channel: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_per_day?: number | null
          max_per_hour?: number | null
          supplier_id?: string | null
          updated_at?: string | null
        }
        Update: {
          channel?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_per_day?: number | null
          max_per_hour?: number | null
          supplier_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      refunds: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          order_id: string
          processed_at: string | null
          processed_by: string | null
          reason: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          order_id: string
          processed_at?: string | null
          processed_by?: string | null
          reason?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          order_id?: string
          processed_at?: string | null
          processed_by?: string | null
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "refunds_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          content: string | null
          created_at: string
          id: string
          order_id: string | null
          project_id: string | null
          rating: number
          reviewed_id: string
          reviewer_id: string
          title: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          order_id?: string | null
          project_id?: string | null
          rating: number
          reviewed_id: string
          reviewer_id: string
          title?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          order_id?: string | null
          project_id?: string | null
          rating?: number
          reviewed_id?: string
          reviewer_id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewed_id_fkey"
            columns: ["reviewed_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      search_history: {
        Row: {
          clicked_result_id: string | null
          clicked_result_type: string | null
          created_at: string
          id: string
          ip_address: unknown
          results_count: number | null
          search_filters: Json | null
          search_query: string
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          clicked_result_id?: string | null
          clicked_result_type?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown
          results_count?: number | null
          search_filters?: Json | null
          search_query: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          clicked_result_id?: string | null
          clicked_result_type?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown
          results_count?: number | null
          search_filters?: Json | null
          search_query?: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      selection_approvals: {
        Row: {
          allowance_amount: number
          approval_token: string | null
          approved_at: string | null
          approved_by: string | null
          client_id: string
          created_at: string | null
          expires_at: string | null
          group_id: string
          id: string
          order_id: string
          over_allowance_amount: number
          selected_items: Json
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          allowance_amount?: number
          approval_token?: string | null
          approved_at?: string | null
          approved_by?: string | null
          client_id: string
          created_at?: string | null
          expires_at?: string | null
          group_id: string
          id?: string
          order_id: string
          over_allowance_amount?: number
          selected_items?: Json
          total_amount?: number
          updated_at?: string | null
        }
        Update: {
          allowance_amount?: number
          approval_token?: string | null
          approved_at?: string | null
          approved_by?: string | null
          client_id?: string
          created_at?: string | null
          expires_at?: string | null
          group_id?: string
          id?: string
          order_id?: string
          over_allowance_amount?: number
          selected_items?: Json
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "selection_approvals_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "selection_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      selection_comments: {
        Row: {
          comment_text: string
          created_at: string | null
          group_id: string
          id: string
          is_internal: boolean | null
          user_id: string
        }
        Insert: {
          comment_text: string
          created_at?: string | null
          group_id: string
          id?: string
          is_internal?: boolean | null
          user_id: string
        }
        Update: {
          comment_text?: string
          created_at?: string | null
          group_id?: string
          id?: string
          is_internal?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "selection_comments_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "selection_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      selection_groups: {
        Row: {
          allowance_amount: number | null
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          order_id: string
          supplier_id: string
          updated_at: string | null
        }
        Insert: {
          allowance_amount?: number | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          order_id: string
          supplier_id: string
          updated_at?: string | null
        }
        Update: {
          allowance_amount?: number | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          order_id?: string
          supplier_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      selection_items: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          group_id: string
          id: string
          image_url: string | null
          is_available: boolean | null
          name: string
          price: number
          sku: string | null
          specifications: Json | null
          vendor_info: Json | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          group_id: string
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          name: string
          price?: number
          sku?: string | null
          specifications?: Json | null
          vendor_info?: Json | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          group_id?: string
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          name?: string
          price?: number
          sku?: string | null
          specifications?: Json | null
          vendor_info?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "selection_items_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "selection_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      signature_links: {
        Row: {
          acted_at: string | null
          acted_by: string | null
          action: string | null
          created_at: string
          expires_at: string
          id: string
          proposal_id: string
          token: string
        }
        Insert: {
          acted_at?: string | null
          acted_by?: string | null
          action?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          proposal_id: string
          token?: string
        }
        Update: {
          acted_at?: string | null
          acted_by?: string | null
          action?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          proposal_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "signature_links_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      standards_library: {
        Row: {
          category: string
          created_at: string
          default_severity: string | null
          description: string | null
          domain: string
          id: string
          standard_clause: string | null
          standard_code: string | null
          standard_quote: string | null
          title: string
        }
        Insert: {
          category: string
          created_at?: string
          default_severity?: string | null
          description?: string | null
          domain: string
          id?: string
          standard_clause?: string | null
          standard_code?: string | null
          standard_quote?: string | null
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          default_severity?: string | null
          description?: string | null
          domain?: string
          id?: string
          standard_clause?: string | null
          standard_code?: string | null
          standard_quote?: string | null
          title?: string
        }
        Relationships: []
      }
      supplier_verifications: {
        Row: {
          company_id: string
          created_at: string
          documents: Json | null
          id: string
          notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          submitted_by: string
        }
        Insert: {
          company_id: string
          created_at?: string
          documents?: Json | null
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submitted_by: string
        }
        Update: {
          company_id?: string
          created_at?: string
          documents?: Json | null
          id?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submitted_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_verifications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_verifications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_verifications_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_webhooks: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          last_used_at: string | null
          secret_token: string
          supplier_id: string
          updated_at: string | null
          webhook_url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          secret_token: string
          supplier_id: string
          updated_at?: string | null
          webhook_url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          secret_token?: string
          supplier_id?: string
          updated_at?: string | null
          webhook_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_webhooks_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: true
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      support_messages: {
        Row: {
          attachments: string[] | null
          content: string
          created_at: string
          id: string
          is_internal: boolean | null
          sender_id: string
          ticket_id: string
        }
        Insert: {
          attachments?: string[] | null
          content: string
          created_at?: string
          id?: string
          is_internal?: boolean | null
          sender_id: string
          ticket_id: string
        }
        Update: {
          attachments?: string[] | null
          content?: string
          created_at?: string
          id?: string
          is_internal?: boolean | null
          sender_id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_support_messages_ticket"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          admin_notes: string | null
          assigned_to: string | null
          closed_at: string | null
          created_at: string
          description: string
          id: string
          order_id: string | null
          priority: string | null
          project_id: string | null
          rating: number | null
          rating_feedback: string | null
          resolution: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string | null
          ticket_number: string
          title: string
          type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          assigned_to?: string | null
          closed_at?: string | null
          created_at?: string
          description: string
          id?: string
          order_id?: string | null
          priority?: string | null
          project_id?: string | null
          rating?: number | null
          rating_feedback?: string | null
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          ticket_number: string
          title: string
          type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          assigned_to?: string | null
          closed_at?: string | null
          created_at?: string
          description?: string
          id?: string
          order_id?: string | null
          priority?: string | null
          project_id?: string | null
          rating?: number | null
          rating_feedback?: string | null
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          ticket_number?: string
          title?: string
          type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_support_tickets_order"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_support_tickets_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      system_metrics: {
        Row: {
          id: string
          labels: Json | null
          metric_name: string
          metric_type: string
          metric_value: number
          timestamp: string
        }
        Insert: {
          id?: string
          labels?: Json | null
          metric_name: string
          metric_type: string
          metric_value: number
          timestamp?: string
        }
        Update: {
          id?: string
          labels?: Json | null
          metric_name?: string
          metric_type?: string
          metric_value?: number
          timestamp?: string
        }
        Relationships: []
      }
      ticket_messages: {
        Row: {
          created_at: string
          file_name: string | null
          file_url: string | null
          id: string
          is_internal: boolean
          message_text: string | null
          read_by: Json
          sender_id: string
          ticket_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          is_internal?: boolean
          message_text?: string | null
          read_by?: Json
          sender_id: string
          ticket_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          is_internal?: boolean
          message_text?: string | null
          read_by?: Json
          sender_id?: string
          ticket_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_ticket_messages_ticket_id"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          assigned_to: string | null
          closed_at: string | null
          closed_by: string | null
          created_at: string
          description: string | null
          escalated_at: string | null
          id: string
          opened_by: string
          order_id: string
          priority: string
          reason: string
          sla_due_at: string | null
          status: string
          ticket_number: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string
          description?: string | null
          escalated_at?: string | null
          id?: string
          opened_by: string
          order_id: string
          priority?: string
          reason: string
          sla_due_at?: string | null
          status?: string
          ticket_number?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string
          description?: string | null
          escalated_at?: string | null
          id?: string
          opened_by?: string
          order_id?: string
          priority?: string
          reason?: string
          sla_due_at?: string | null
          status?: string
          ticket_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_tickets_order_id"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_analytics: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          metric_date: string
          metric_name: string
          metric_value: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_date: string
          metric_name: string
          metric_value: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          metric_date?: string
          metric_name?: string
          metric_value?: number
          user_id?: string
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          request_ip: string | null
          request_payload: Json | null
          response_message: string | null
          response_status: number | null
          supplier_id: string
          webhook_id: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          request_ip?: string | null
          request_payload?: Json | null
          response_message?: string | null
          response_status?: number | null
          supplier_id: string
          webhook_id?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          request_ip?: string | null
          request_payload?: Json | null
          response_message?: string | null
          response_status?: number | null
          supplier_id?: string
          webhook_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_logs_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_logs_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "supplier_webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      homepage_public: {
        Row: {
          cta_label_he: string | null
          image_url: string | null
          item_id: string | null
          link_target_id: string | null
          link_type: string | null
          link_url: string | null
          order_index: number | null
          priority: number | null
          section_id: string | null
          section_title: string | null
          subtitle_he: string | null
          title_he: string | null
          type: string | null
        }
        Relationships: []
      }
      top_categories_30d: {
        Row: {
          category_id: string | null
          category_name: string | null
          gmv_ils: number | null
          orders: number | null
        }
        Relationships: []
      }
      top_suppliers_30d: {
        Row: {
          gmv_ils: number | null
          name: string | null
          orders: number | null
          revenue_ils: number | null
          supplier_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      add_mood_board_item_to_selection: {
        Args: { p_item_id: string; p_selection_group_id: string }
        Returns: string
      }
      admin_assign_leads: {
        Args: { _lead_ids: string[]; _supplier_id: string }
        Returns: number
      }
      admin_get_kpis: {
        Args: { p_from: string; p_to: string }
        Returns: {
          d: string
          dau: number
          mau: number
          signups_customers: number
          signups_suppliers: number
          signups_total: number
          wau: number
        }[]
      }
      admin_merge_leads: {
        Args: { _duplicate_ids: string[]; _primary_id: string }
        Returns: undefined
      }
      admin_refund_order: {
        Args: { _amount: number; _order_id: string; _reason: string }
        Returns: string
      }
      admin_reorder_categories: { Args: { _ids: string[] }; Returns: undefined }
      admin_update_lead_status: {
        Args: { _lead_ids: string[]; _status: string }
        Returns: number
      }
      admin_update_user_role: {
        Args: {
          new_role: Database["public"]["Enums"]["user_role"]
          target_user_id: string
        }
        Returns: undefined
      }
      apply_change_order_to_budget: {
        Args: {
          p_amount: number
          p_budget_id: string
          p_category_id: string
          p_change_order_id: string
        }
        Returns: undefined
      }
      approve_change_order: {
        Args: { p_approver_id: string; p_change_order_id: string }
        Returns: Json
      }
      approve_selections: {
        Args: {
          p_approval_token: string
          p_client_signature?: string
          p_selected_items: Json
        }
        Returns: Json
      }
      auto_assign_leads: { Args: never; Returns: number }
      calculate_selection_totals: {
        Args: { p_group_id: string; p_selected_items: Json }
        Returns: Json
      }
      check_booking_conflict: {
        Args: {
          p_ends_at: string
          p_exclude_booking_id?: string
          p_starts_at: string
          p_supplier_id: string
        }
        Returns: boolean
      }
      check_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      close_ticket: {
        Args: { p_reason?: string; p_ticket_id: string }
        Returns: undefined
      }
      create_first_admin: { Args: { _user_id: string }; Returns: undefined }
      create_notification: {
        Args: {
          p_message: string
          p_payload?: Json
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      create_order_bundle: { Args: { payload: Json }; Returns: Json }
      create_order_event: {
        Args: { p_event_type: string; p_meta?: Json; p_order_id: string }
        Returns: string
      }
      create_proposal_from_quote: {
        Args: { p_html_content?: string; p_quote_id: string }
        Returns: string
      }
      delete_user_account: { Args: { user_id: string }; Returns: undefined }
      escalate_overdue_tickets: { Args: never; Returns: undefined }
      generate_co_number: { Args: never; Returns: string }
      generate_lead_number: { Args: never; Returns: string }
      generate_order_number: { Args: never; Returns: string }
      generate_quote_number: { Args: never; Returns: string }
      generate_ticket_number: { Args: never; Returns: string }
      generate_webhook_token: { Args: never; Returns: string }
      get_category_performance: {
        Args: { _category_id?: string }
        Returns: {
          avg_rating: number
          category_id: string
          category_name: string
          product_count: number
          supplier_count: number
          total_orders: number
          total_revenue: number
        }[]
      }
      get_homepage_content: {
        Args: { _platform?: string }
        Returns: {
          item_cta_label: string
          item_id: string
          item_image_url: string
          item_link_target_id: string
          item_link_type: string
          item_link_url: string
          item_order: number
          item_subtitle: string
          item_title: string
          section_audience: Json
          section_id: string
          section_platform: string
          section_priority: number
          section_title: string
          section_type: string
        }[]
      }
      get_mood_board_by_token: {
        Args: { p_token: string }
        Returns: {
          client_can_interact: boolean
          client_id: string
          created_at: string
          description: string
          id: string
          status: string
          supplier_id: string
          title: string
          updated_at: string
        }[]
      }
      get_or_create_supplier_webhook: {
        Args: { p_supplier_id: string }
        Returns: {
          created_at: string
          id: string
          is_active: boolean
          secret_token: string
          supplier_id: string
          webhook_url: string
        }[]
      }
      get_popular_products: {
        Args: { _limit?: number; _supplier_id?: string }
        Returns: {
          favorite_count: number
          order_count: number
          popularity_score: number
          product_id: string
          product_name: string
          supplier_id: string
          view_count: number
        }[]
      }
      get_primary_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_project_analytics: {
        Args: { _client_id?: string }
        Returns: {
          active_projects: number
          avg_project_value: number
          client_id: string
          completed_projects: number
          total_projects: number
          total_spent: number
        }[]
      }
      get_sla_metrics: {
        Args: { p_days?: number; p_supplier_id: string }
        Returns: Json
      }
      get_supplier_dashboard_data: {
        Args: {
          _from: string
          _recent_limit?: number
          _supplier_id: string
          _to: string
        }
        Returns: Json
      }
      get_supplier_stats: {
        Args: { _supplier_id?: string }
        Returns: {
          active_leads: number
          avg_rating: number
          conversion_rate: number
          supplier_id: string
          total_orders: number
          total_revenue: number
          total_reviews: number
        }[]
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      import_budget_from_quote: {
        Args: {
          p_client_id: string
          p_order_id: string
          p_quote_id: string
          p_supplier_id: string
        }
        Returns: string
      }
      is_admin: { Args: { user_id: string }; Returns: boolean }
      is_ideabook_collaborator: {
        Args: { _ideabook_id: string; _user_id: string }
        Returns: boolean
      }
      log_performance_metric: {
        Args: { p_labels?: Json; p_metric_name: string; p_metric_value: number }
        Returns: undefined
      }
      map_detailed_to_status: {
        Args: { ds: Database["public"]["Enums"]["project_detailed_status"] }
        Returns: Database["public"]["Enums"]["project_status"]
      }
      mark_all_notifications_read: { Args: never; Returns: undefined }
      mark_notification_read: {
        Args: { notification_id: string }
        Returns: undefined
      }
      mark_order_messages_read: {
        Args: { p_message_ids?: string[]; p_order_id: string }
        Returns: undefined
      }
      mark_ticket_messages_read: {
        Args: { p_message_ids?: string[]; p_ticket_id: string }
        Returns: undefined
      }
      process_sla_reminders: { Args: never; Returns: number }
      promote_to_admin: { Args: { target_user_id: string }; Returns: undefined }
      recalculate_budget_totals: {
        Args: { p_budget_id: string }
        Returns: undefined
      }
      record_payment_actual: {
        Args: {
          p_amount: number
          p_budget_id: string
          p_category_id: string
          p_payment_link_id: string
        }
        Returns: undefined
      }
      refresh_all_analytics: { Args: never; Returns: undefined }
      refresh_category_performance: { Args: never; Returns: undefined }
      refresh_kpi_daily: { Args: { p_date?: string }; Returns: undefined }
      refresh_popular_products: { Args: never; Returns: undefined }
      refresh_project_analytics: { Args: never; Returns: undefined }
      refresh_supplier_stats: { Args: never; Returns: undefined }
      rpc_create_project_with_participants: {
        Args: {
          p_budget_max?: number
          p_budget_min?: number
          p_category_id?: string
          p_client_id: string
          p_description: string
          p_detailed?: Database["public"]["Enums"]["project_detailed_status"]
          p_location?: string
          p_supplier_id: string
          p_title: string
        }
        Returns: string
      }
      rpc_log_call: {
        Args: {
          p_note?: string
          p_order_id: string
          p_outcome: string
          p_phone_e164: string
        }
        Returns: boolean
      }
      rpc_supplier_can_access: {
        Args: { p_order_id: string }
        Returns: boolean
      }
      rpc_update_order_status: {
        Args: {
          p_changed_by?: string
          p_is_customer_visible?: boolean
          p_new_status: string
          p_order_id: string
          p_reason?: string
        }
        Returns: {
          message: string
          success: boolean
          updated_order: Database["public"]["Tables"]["orders"]["Row"]
        }[]
      }
      send_proposal_for_signature: {
        Args: { p_proposal_id: string }
        Returns: string
      }
      set_notification_pref: {
        Args: { p_marketing: boolean; p_orders: boolean; p_system: boolean }
        Returns: undefined
      }
      sign_proposal: {
        Args: { p_action: string; p_actor_id?: string; p_token: string }
        Returns: Json
      }
      slugify: { Args: { txt: string }; Returns: string }
      slugify_company_name: { Args: { name: string }; Returns: string }
      snooze_lead: {
        Args: { p_hours?: number; p_lead_id: string }
        Returns: boolean
      }
      supplier_client_projects: {
        Args: { p_client_id: string }
        Returns: {
          created_at: string
          id: string
          title: string
        }[]
      }
      supplier_dashboard_metrics: {
        Args: { _from: string; _supplier_id: string; _to: string }
        Returns: Json
      }
      supplier_recent_leads: {
        Args: { _limit?: number; _supplier_id: string }
        Returns: {
          contact_email: string
          created_at: string
          id: string
          last_contact_date: string
          name: string
          priority: string
          sla_risk: boolean
          source: string
          status: string
        }[]
      }
      supplier_recent_orders: {
        Args: { _limit?: number; _supplier_id: string }
        Returns: {
          amount: number
          client_name: string
          created_at: string
          due_date: string
          id: string
          status: string
          title: string
          unread_messages: number
        }[]
      }
      supplier_recent_reviews: {
        Args: { _limit?: number; _supplier_id: string }
        Returns: {
          content: string
          created_at: string
          id: string
          rating: number
          reviewer_name: string
          title: string
        }[]
      }
      supplier_timeseries: {
        Args: {
          _from: string
          _grain: string
          _supplier_id: string
          _to: string
        }
        Returns: {
          bucket: string
          leads_count: number
          orders_count: number
          profile_views: number
          revenue: number
          reviews_count: number
        }[]
      }
      toggle_favorite: {
        Args: { p_entity_id: string; p_entity_type: string }
        Returns: boolean
      }
      track_profile_view: { Args: { p_company_id: string }; Returns: undefined }
      update_order_status: {
        Args: {
          p_new_status: string
          p_order_id: string
          p_reason?: string
          p_visible_to_customer?: boolean
        }
        Returns: Json
      }
      validate_admin_session: { Args: { _user_id: string }; Returns: Json }
      validate_booking_availability: {
        Args: { p_ends_at: string; p_starts_at: string; p_supplier_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "supplier" | "client"
      message_status: "sent" | "delivered" | "read"
      onboarding_status: "not_started" | "in_progress" | "completed"
      order_status:
        | "pending"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
      project_detailed_status:
        | "new"
        | "waiting_for_scheduling"
        | "measurement"
        | "waiting_for_client_approval"
        | "in_progress"
        | "in_progress_preparation"
        | "on_hold"
        | "completed"
        | "waiting_for_final_payment"
        | "closed_paid_in_full"
        | "cancelled"
      project_status: "planning" | "active" | "completed" | "cancelled"
      user_role: "client" | "supplier" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "supplier", "client"],
      message_status: ["sent", "delivered", "read"],
      onboarding_status: ["not_started", "in_progress", "completed"],
      order_status: [
        "pending",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
      ],
      project_detailed_status: [
        "new",
        "waiting_for_scheduling",
        "measurement",
        "waiting_for_client_approval",
        "in_progress",
        "in_progress_preparation",
        "on_hold",
        "completed",
        "waiting_for_final_payment",
        "closed_paid_in_full",
        "cancelled",
      ],
      project_status: ["planning", "active", "completed", "cancelled"],
      user_role: ["client", "supplier", "admin"],
    },
  },
} as const
