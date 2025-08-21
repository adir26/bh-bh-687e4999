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
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          changed_fields: string[] | null
          created_at: string
          id: string
          ip_address: unknown | null
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
          ip_address?: unknown | null
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
          ip_address?: unknown | null
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
            referencedRelation: "category_performance"
            referencedColumns: ["category_id"]
          },
        ]
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
      companies: {
        Row: {
          address: string | null
          area: string | null
          business_license: string | null
          city: string | null
          created_at: string
          description: string | null
          email: string | null
          featured: boolean | null
          id: string
          is_public: boolean | null
          logo_url: string | null
          name: string
          owner_id: string
          phone: string | null
          rating: number | null
          review_count: number | null
          status: string | null
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
          address?: string | null
          area?: string | null
          business_license?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          featured?: boolean | null
          id?: string
          is_public?: boolean | null
          logo_url?: string | null
          name: string
          owner_id: string
          phone?: string | null
          rating?: number | null
          review_count?: number | null
          status?: string | null
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
          address?: string | null
          area?: string | null
          business_license?: string | null
          city?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          featured?: boolean | null
          id?: string
          is_public?: boolean | null
          logo_url?: string | null
          name?: string
          owner_id?: string
          phone?: string | null
          rating?: number | null
          review_count?: number | null
          status?: string | null
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
            isOneToOne: false
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
          {
            foreignKeyName: "fk_company_analytics_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "supplier_stats"
            referencedColumns: ["company_id"]
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
            referencedRelation: "category_performance"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "company_categories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_categories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "supplier_stats"
            referencedColumns: ["company_id"]
          },
        ]
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
      leads: {
        Row: {
          assigned_to: string | null
          client_id: string
          contact_email: string | null
          contact_method: string | null
          contact_phone: string | null
          converted_at: string | null
          created_at: string
          estimated_value: number | null
          expected_close_date: string | null
          id: string
          last_contact_date: string | null
          lead_number: string
          lost_reason: string | null
          name: string | null
          next_follow_up_date: string | null
          notes: string | null
          priority: string | null
          probability: number | null
          project_id: string | null
          source: string | null
          status: string | null
          supplier_id: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          client_id: string
          contact_email?: string | null
          contact_method?: string | null
          contact_phone?: string | null
          converted_at?: string | null
          created_at?: string
          estimated_value?: number | null
          expected_close_date?: string | null
          id?: string
          last_contact_date?: string | null
          lead_number: string
          lost_reason?: string | null
          name?: string | null
          next_follow_up_date?: string | null
          notes?: string | null
          priority?: string | null
          probability?: number | null
          project_id?: string | null
          source?: string | null
          status?: string | null
          supplier_id?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          client_id?: string
          contact_email?: string | null
          contact_method?: string | null
          contact_phone?: string | null
          converted_at?: string | null
          created_at?: string
          estimated_value?: number | null
          expected_close_date?: string | null
          id?: string
          last_contact_date?: string | null
          lead_number?: string
          lost_reason?: string | null
          name?: string | null
          next_follow_up_date?: string | null
          notes?: string | null
          priority?: string | null
          probability?: number | null
          project_id?: string | null
          source?: string | null
          status?: string | null
          supplier_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_leads_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_analytics"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "fk_leads_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
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
            referencedRelation: "project_analytics"
            referencedColumns: ["project_id"]
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
      notifications: {
        Row: {
          action_url: string | null
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          metadata: Json | null
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
          metadata?: Json | null
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
          metadata?: Json | null
          priority?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
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
          amount: number
          client_id: string
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          order_number: string | null
          payment_status: string | null
          project_id: string
          refunded_total: number | null
          status: Database["public"]["Enums"]["order_status"]
          supplier_id: string
          title: string
          updated_at: string
        }
        Insert: {
          amount: number
          client_id: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          order_number?: string | null
          payment_status?: string | null
          project_id: string
          refunded_total?: number | null
          status?: Database["public"]["Enums"]["order_status"]
          supplier_id: string
          title: string
          updated_at?: string
        }
        Update: {
          amount?: number
          client_id?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          order_number?: string | null
          payment_status?: string | null
          project_id?: string
          refunded_total?: number | null
          status?: Database["public"]["Enums"]["order_status"]
          supplier_id?: string
          title?: string
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
            foreignKeyName: "orders_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_analytics"
            referencedColumns: ["project_id"]
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
            referencedRelation: "popular_products"
            referencedColumns: ["product_id"]
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
          room: string | null
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
          room?: string | null
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
          room?: string | null
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
            foreignKeyName: "photos_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "supplier_stats"
            referencedColumns: ["company_id"]
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
            referencedRelation: "category_performance"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "fk_product_categories_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "popular_products"
            referencedColumns: ["product_id"]
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
            referencedRelation: "category_performance"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "fk_products_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_products_company"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "supplier_stats"
            referencedColumns: ["company_id"]
          },
        ]
      }
      profiles: {
        Row: {
          block_reason: string | null
          blocked_at: string | null
          blocked_by: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_blocked: boolean | null
          onboarding_completed: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          block_reason?: string | null
          blocked_at?: string | null
          blocked_by?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_blocked?: boolean | null
          onboarding_completed?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          block_reason?: string | null
          blocked_at?: string | null
          blocked_by?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_blocked?: boolean | null
          onboarding_completed?: boolean | null
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
      projects: {
        Row: {
          budget_max: number | null
          budget_min: number | null
          category_id: string | null
          client_id: string
          created_at: string
          description: string | null
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
            referencedRelation: "category_performance"
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
      quote_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          product_id: string | null
          quantity: number
          quote_id: string
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
          subtotal?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_quote_items_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "popular_products"
            referencedColumns: ["product_id"]
          },
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
      quotes: {
        Row: {
          client_id: string
          created_at: string
          description: string | null
          discount_amount: number | null
          id: string
          notes: string | null
          project_id: string | null
          quote_number: string
          responded_at: string | null
          sent_at: string | null
          status: string | null
          subtotal: number
          supplier_id: string
          tax_amount: number | null
          terms_conditions: string | null
          title: string
          total_amount: number
          updated_at: string
          valid_until: string | null
          viewed_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          description?: string | null
          discount_amount?: number | null
          id?: string
          notes?: string | null
          project_id?: string | null
          quote_number: string
          responded_at?: string | null
          sent_at?: string | null
          status?: string | null
          subtotal?: number
          supplier_id: string
          tax_amount?: number | null
          terms_conditions?: string | null
          title: string
          total_amount?: number
          updated_at?: string
          valid_until?: string | null
          viewed_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          description?: string | null
          discount_amount?: number | null
          id?: string
          notes?: string | null
          project_id?: string | null
          quote_number?: string
          responded_at?: string | null
          sent_at?: string | null
          status?: string | null
          subtotal?: number
          supplier_id?: string
          tax_amount?: number | null
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
            referencedRelation: "project_analytics"
            referencedColumns: ["project_id"]
          },
          {
            foreignKeyName: "fk_quotes_project"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
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
            referencedRelation: "project_analytics"
            referencedColumns: ["project_id"]
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
          ip_address: unknown | null
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
          ip_address?: unknown | null
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
          ip_address?: unknown | null
          results_count?: number | null
          search_filters?: Json | null
          search_query?: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
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
            foreignKeyName: "supplier_verifications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "supplier_stats"
            referencedColumns: ["company_id"]
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
            referencedRelation: "project_analytics"
            referencedColumns: ["project_id"]
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
          id: string
          item_id: string
          item_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          item_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          item_type?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      category_performance: {
        Row: {
          avg_quote_value: number | null
          category_id: string | null
          category_name: string | null
          created_at: string | null
          last_updated: string | null
          projects_in_category: number | null
          published_products: number | null
          search_frequency: number | null
          total_products: number | null
        }
        Relationships: []
      }
      popular_products: {
        Row: {
          category_id: string | null
          created_at: string | null
          favorite_count: number | null
          last_updated: string | null
          name: string | null
          popularity_score: number | null
          price: number | null
          product_id: string | null
          search_mentions: number | null
          supplier_id: string | null
          times_quoted: number | null
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
            referencedRelation: "category_performance"
            referencedColumns: ["category_id"]
          },
        ]
      }
      project_analytics: {
        Row: {
          avg_quote_value: number | null
          budget_max: number | null
          budget_min: number | null
          client_id: string | null
          created_at: string | null
          end_date: string | null
          last_updated: string | null
          project_id: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"] | null
          title: string | null
          total_leads: number | null
          total_orders: number | null
          total_quotes: number | null
          total_spent: number | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_stats: {
        Row: {
          accepted_quotes: number | null
          avg_rating: number | null
          company_id: string | null
          company_name: string | null
          completed_orders: number | null
          converted_leads: number | null
          created_at: string | null
          last_updated: string | null
          product_count: number | null
          published_products: number | null
          review_count: number | null
          supplier_id: string | null
          total_leads: number | null
          total_orders: number | null
          total_quotes: number | null
          total_revenue: number | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_owner_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      admin_assign_leads: {
        Args: { _lead_ids: string[]; _supplier_id: string }
        Returns: number
      }
      admin_merge_leads: {
        Args: { _duplicate_ids: string[]; _primary_id: string }
        Returns: undefined
      }
      admin_refund_order: {
        Args: { _amount: number; _order_id: string; _reason: string }
        Returns: string
      }
      admin_reorder_categories: {
        Args: { _ids: string[] }
        Returns: undefined
      }
      admin_update_lead_status: {
        Args: { _lead_ids: string[]; _status: string }
        Returns: number
      }
      check_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      generate_lead_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_quote_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_ticket_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      log_performance_metric: {
        Args: { p_labels?: Json; p_metric_name: string; p_metric_value: number }
        Returns: undefined
      }
      promote_to_admin: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      refresh_all_analytics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      refresh_category_performance: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      refresh_popular_products: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      refresh_project_analytics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      refresh_supplier_stats: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      slugify: {
        Args: { txt: string }
        Returns: string
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
    }
    Enums: {
      message_status: "sent" | "delivered" | "read"
      order_status:
        | "pending"
        | "confirmed"
        | "in_progress"
        | "completed"
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
      message_status: ["sent", "delivered", "read"],
      order_status: [
        "pending",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
      ],
      project_status: ["planning", "active", "completed", "cancelled"],
      user_role: ["client", "supplier", "admin"],
    },
  },
} as const
