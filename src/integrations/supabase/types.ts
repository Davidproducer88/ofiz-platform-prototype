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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      advertisements: {
        Row: {
          ad_type: string
          budget: number
          business_id: string
          category: Database["public"]["Enums"]["service_category"] | null
          clicks_count: number
          cost_per_impression: number
          created_at: string
          cta_text: string
          cta_url: string
          description: string
          end_date: string
          id: string
          impressions_count: number
          is_active: boolean
          media_url: string | null
          start_date: string
          status: string
          target_audience: string
          title: string
          updated_at: string
        }
        Insert: {
          ad_type: string
          budget: number
          business_id: string
          category?: Database["public"]["Enums"]["service_category"] | null
          clicks_count?: number
          cost_per_impression?: number
          created_at?: string
          cta_text?: string
          cta_url: string
          description: string
          end_date: string
          id?: string
          impressions_count?: number
          is_active?: boolean
          media_url?: string | null
          start_date: string
          status?: string
          target_audience: string
          title: string
          updated_at?: string
        }
        Update: {
          ad_type?: string
          budget?: number
          business_id?: string
          category?: Database["public"]["Enums"]["service_category"] | null
          clicks_count?: number
          cost_per_impression?: number
          created_at?: string
          cta_text?: string
          cta_url?: string
          description?: string
          end_date?: string
          id?: string
          impressions_count?: number
          is_active?: boolean
          media_url?: string | null
          start_date?: string
          status?: string
          target_audience?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "advertisements_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          client_address: string
          client_confirmed_at: string | null
          client_id: string
          client_photos: Json | null
          created_at: string
          id: string
          master_id: string
          mp_fee_estimated: number | null
          neto_profesional: number | null
          notes: string | null
          payment_method_selected: string | null
          payment_type: string | null
          pending_amount: number | null
          platform_fee: number | null
          price_base: number | null
          scheduled_date: string
          service_id: string | null
          status: Database["public"]["Enums"]["booking_status"] | null
          total_price: number
          updated_at: string
          upfront_amount: number | null
        }
        Insert: {
          client_address: string
          client_confirmed_at?: string | null
          client_id: string
          client_photos?: Json | null
          created_at?: string
          id?: string
          master_id: string
          mp_fee_estimated?: number | null
          neto_profesional?: number | null
          notes?: string | null
          payment_method_selected?: string | null
          payment_type?: string | null
          pending_amount?: number | null
          platform_fee?: number | null
          price_base?: number | null
          scheduled_date: string
          service_id?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_price: number
          updated_at?: string
          upfront_amount?: number | null
        }
        Update: {
          client_address?: string
          client_confirmed_at?: string | null
          client_id?: string
          client_photos?: Json | null
          created_at?: string
          id?: string
          master_id?: string
          mp_fee_estimated?: number | null
          neto_profesional?: number | null
          notes?: string | null
          payment_method_selected?: string | null
          payment_type?: string | null
          pending_amount?: number | null
          platform_fee?: number | null
          price_base?: number | null
          scheduled_date?: string
          service_id?: string | null
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_price?: number
          updated_at?: string
          upfront_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_master_id_fkey"
            columns: ["master_id"]
            isOneToOne: false
            referencedRelation: "masters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_master_id_fkey"
            columns: ["master_id"]
            isOneToOne: false
            referencedRelation: "masters_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_master_id_fkey"
            columns: ["master_id"]
            isOneToOne: false
            referencedRelation: "masters_with_profile_and_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      business_contract_applications: {
        Row: {
          contract_id: string
          created_at: string
          id: string
          master_id: string
          message: string | null
          proposed_price: number
          status: string
          updated_at: string
        }
        Insert: {
          contract_id: string
          created_at?: string
          id?: string
          master_id: string
          message?: string | null
          proposed_price: number
          status?: string
          updated_at?: string
        }
        Update: {
          contract_id?: string
          created_at?: string
          id?: string
          master_id?: string
          message?: string | null
          proposed_price?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_contract_applications_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "business_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_contract_applications_master_id_fkey"
            columns: ["master_id"]
            isOneToOne: false
            referencedRelation: "masters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_contract_applications_master_id_fkey"
            columns: ["master_id"]
            isOneToOne: false
            referencedRelation: "masters_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_contract_applications_master_id_fkey"
            columns: ["master_id"]
            isOneToOne: false
            referencedRelation: "masters_with_profile_and_services"
            referencedColumns: ["id"]
          },
        ]
      }
      business_contracts: {
        Row: {
          budget_max: number | null
          budget_min: number | null
          business_id: string
          category: Database["public"]["Enums"]["service_category"]
          created_at: string
          deadline: string | null
          description: string
          id: string
          location: string
          required_masters: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          budget_max?: number | null
          budget_min?: number | null
          business_id: string
          category: Database["public"]["Enums"]["service_category"]
          created_at?: string
          deadline?: string | null
          description: string
          id?: string
          location: string
          required_masters?: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          budget_max?: number | null
          budget_min?: number | null
          business_id?: string
          category?: Database["public"]["Enums"]["service_category"]
          created_at?: string
          deadline?: string | null
          description?: string
          id?: string
          location?: string
          required_masters?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_contracts_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      business_profiles: {
        Row: {
          billing_address: string | null
          billing_email: string | null
          billing_phone: string | null
          company_name: string
          company_size: string | null
          company_type: string
          created_at: string
          id: string
          industry: string | null
          tax_id: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          billing_address?: string | null
          billing_email?: string | null
          billing_phone?: string | null
          company_name: string
          company_size?: string | null
          company_type: string
          created_at?: string
          id: string
          industry?: string | null
          tax_id?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          billing_address?: string | null
          billing_email?: string | null
          billing_phone?: string | null
          company_name?: string
          company_size?: string | null
          company_type?: string
          created_at?: string
          id?: string
          industry?: string | null
          tax_id?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      business_subscriptions: {
        Row: {
          ad_impressions_limit: number | null
          business_id: string
          can_post_ads: boolean
          cancelled_at: string | null
          contacts_used: number
          created_at: string
          current_period_end: string
          current_period_start: string
          has_founder_discount: boolean | null
          id: string
          mercadopago_subscription_id: string | null
          monthly_contacts_limit: number
          plan_type: string
          price: number
          status: string
          updated_at: string
        }
        Insert: {
          ad_impressions_limit?: number | null
          business_id: string
          can_post_ads?: boolean
          cancelled_at?: string | null
          contacts_used?: number
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          has_founder_discount?: boolean | null
          id?: string
          mercadopago_subscription_id?: string | null
          monthly_contacts_limit?: number
          plan_type?: string
          price: number
          status?: string
          updated_at?: string
        }
        Update: {
          ad_impressions_limit?: number | null
          business_id?: string
          can_post_ads?: boolean
          cancelled_at?: string | null
          contacts_used?: number
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          has_founder_discount?: boolean | null
          id?: string
          mercadopago_subscription_id?: string | null
          monthly_contacts_limit?: number
          plan_type?: string
          price?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_subscriptions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "business_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_addresses: {
        Row: {
          address: string
          city: string | null
          client_id: string
          created_at: string
          id: string
          is_default: boolean | null
          label: string
          latitude: number | null
          longitude: number | null
          notes: string | null
          updated_at: string
        }
        Insert: {
          address: string
          city?: string | null
          client_id: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          label: string
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          city?: string | null
          client_id?: string
          created_at?: string
          id?: string
          is_default?: boolean | null
          label?: string
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_addresses_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      commissions: {
        Row: {
          amount: number
          created_at: string
          id: string
          master_id: string
          payment_id: string
          percentage: number
          processed_at: string | null
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          master_id: string
          payment_id: string
          percentage?: number
          processed_at?: string | null
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          master_id?: string
          payment_id?: string
          percentage?: number
          processed_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "commissions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          booking_id: string | null
          client_id: string
          created_at: string | null
          id: string
          last_message_at: string | null
          master_id: string
        }
        Insert: {
          booking_id?: string | null
          client_id: string
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          master_id: string
        }
        Update: {
          booking_id?: string | null
          client_id?: string
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          master_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          admin_notes: string | null
          auto_escalated_at: string | null
          booking_id: string
          client_proposal: Json | null
          created_at: string
          description: string
          evidence_urls: Json | null
          id: string
          master_proposal: Json | null
          mediation_attempts: number | null
          mediation_deadline: string | null
          mediation_messages: Json | null
          mediation_status: string | null
          opened_by: string
          opened_by_role: string
          payment_id: string | null
          reason: string
          resolution: string | null
          resolution_type: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          auto_escalated_at?: string | null
          booking_id: string
          client_proposal?: Json | null
          created_at?: string
          description: string
          evidence_urls?: Json | null
          id?: string
          master_proposal?: Json | null
          mediation_attempts?: number | null
          mediation_deadline?: string | null
          mediation_messages?: Json | null
          mediation_status?: string | null
          opened_by: string
          opened_by_role: string
          payment_id?: string | null
          reason: string
          resolution?: string | null
          resolution_type?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          auto_escalated_at?: string | null
          booking_id?: string
          client_proposal?: Json | null
          created_at?: string
          description?: string
          evidence_urls?: Json | null
          id?: string
          master_proposal?: Json | null
          mediation_attempts?: number | null
          mediation_deadline?: string | null
          mediation_messages?: Json | null
          mediation_status?: string | null
          opened_by?: string
          opened_by_role?: string
          payment_id?: string | null
          reason?: string
          resolution?: string | null
          resolution_type?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "disputes_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      favorite_masters: {
        Row: {
          client_id: string
          created_at: string
          id: string
          master_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          master_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          master_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorite_masters_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorite_masters_master_id_fkey"
            columns: ["master_id"]
            isOneToOne: false
            referencedRelation: "masters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorite_masters_master_id_fkey"
            columns: ["master_id"]
            isOneToOne: false
            referencedRelation: "masters_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorite_masters_master_id_fkey"
            columns: ["master_id"]
            isOneToOne: false
            referencedRelation: "masters_with_profile_and_services"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_posts: {
        Row: {
          category: Database["public"]["Enums"]["service_category"] | null
          content: string
          created_at: string
          engagement_score: number | null
          id: string
          likes_count: number | null
          master_id: string
          media_urls: string[] | null
          title: string
          type: string
          updated_at: string
          views_count: number | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["service_category"] | null
          content: string
          created_at?: string
          engagement_score?: number | null
          id?: string
          likes_count?: number | null
          master_id: string
          media_urls?: string[] | null
          title: string
          type?: string
          updated_at?: string
          views_count?: number | null
        }
        Update: {
          category?: Database["public"]["Enums"]["service_category"] | null
          content?: string
          created_at?: string
          engagement_score?: number | null
          id?: string
          likes_count?: number | null
          master_id?: string
          media_urls?: string[] | null
          title?: string
          type?: string
          updated_at?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "feed_posts_master_id_fkey"
            columns: ["master_id"]
            isOneToOne: false
            referencedRelation: "masters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_posts_master_id_fkey"
            columns: ["master_id"]
            isOneToOne: false
            referencedRelation: "masters_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feed_posts_master_id_fkey"
            columns: ["master_id"]
            isOneToOne: false
            referencedRelation: "masters_with_profile_and_services"
            referencedColumns: ["id"]
          },
        ]
      }
      founder_alerts_sent: {
        Row: {
          id: string
          remaining_slots: number
          sent_at: string
          threshold: number
        }
        Insert: {
          id?: string
          remaining_slots: number
          sent_at?: string
          threshold: number
        }
        Update: {
          id?: string
          remaining_slots?: number
          sent_at?: string
          threshold?: number
        }
        Relationships: []
      }
      founder_code_usage: {
        Row: {
          booking_id: string | null
          code_id: string
          created_at: string
          discount_amount: number
          id: string
          used_by_user_id: string
        }
        Insert: {
          booking_id?: string | null
          code_id: string
          created_at?: string
          discount_amount: number
          id?: string
          used_by_user_id: string
        }
        Update: {
          booking_id?: string | null
          code_id?: string
          created_at?: string
          discount_amount?: number
          id?: string
          used_by_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "founder_code_usage_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "founder_code_usage_code_id_fkey"
            columns: ["code_id"]
            isOneToOne: false
            referencedRelation: "founder_discount_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      founder_discount_codes: {
        Row: {
          code: string
          created_at: string
          description: string | null
          discount_percentage: number
          id: string
          is_active: boolean
          max_uses: number | null
          times_used: number
          updated_at: string
          user_id: string
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          discount_percentage?: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          times_used?: number
          updated_at?: string
          user_id: string
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          discount_percentage?: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          times_used?: number
          updated_at?: string
          user_id?: string
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      marketplace_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_category_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_category_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_category_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "marketplace_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_favorites: {
        Row: {
          created_at: string | null
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "marketplace_products"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_orders: {
        Row: {
          buyer_id: string
          cancelled_at: string | null
          cancelled_reason: string | null
          confirmed_at: string | null
          created_at: string | null
          delivered_at: string | null
          id: string
          mercadopago_payment_id: string | null
          mercadopago_preference_id: string | null
          notes: string | null
          order_number: string
          payment_id: string | null
          payment_method: string | null
          payment_status: string | null
          platform_fee: number
          product_id: string
          quantity: number
          refund_reason: string | null
          seller_amount: number
          seller_id: string
          shipped_at: string | null
          shipping_address: Json
          shipping_cost: number | null
          status: string | null
          subtotal: number
          total_amount: number
          tracking_number: string | null
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          buyer_id: string
          cancelled_at?: string | null
          cancelled_reason?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          id?: string
          mercadopago_payment_id?: string | null
          mercadopago_preference_id?: string | null
          notes?: string | null
          order_number: string
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          platform_fee?: number
          product_id: string
          quantity: number
          refund_reason?: string | null
          seller_amount: number
          seller_id: string
          shipped_at?: string | null
          shipping_address: Json
          shipping_cost?: number | null
          status?: string | null
          subtotal: number
          total_amount: number
          tracking_number?: string | null
          unit_price: number
          updated_at?: string | null
        }
        Update: {
          buyer_id?: string
          cancelled_at?: string | null
          cancelled_reason?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          delivered_at?: string | null
          id?: string
          mercadopago_payment_id?: string | null
          mercadopago_preference_id?: string | null
          notes?: string | null
          order_number?: string
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          platform_fee?: number
          product_id?: string
          quantity?: number
          refund_reason?: string | null
          seller_amount?: number
          seller_id?: string
          shipped_at?: string | null
          shipping_address?: Json
          shipping_cost?: number | null
          status?: string | null
          subtotal?: number
          total_amount?: number
          tracking_number?: string | null
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "marketplace_products"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_products: {
        Row: {
          business_id: string
          category_id: string | null
          compare_at_price: number | null
          created_at: string | null
          description: string
          favorites_count: number | null
          featured: boolean | null
          id: string
          images: Json | null
          price: number
          rating: number | null
          reviews_count: number | null
          sales_count: number | null
          shipping_info: Json | null
          sku: string | null
          specifications: Json | null
          status: string | null
          stock_quantity: number | null
          title: string
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          business_id: string
          category_id?: string | null
          compare_at_price?: number | null
          created_at?: string | null
          description: string
          favorites_count?: number | null
          featured?: boolean | null
          id?: string
          images?: Json | null
          price: number
          rating?: number | null
          reviews_count?: number | null
          sales_count?: number | null
          shipping_info?: Json | null
          sku?: string | null
          specifications?: Json | null
          status?: string | null
          stock_quantity?: number | null
          title: string
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          business_id?: string
          category_id?: string | null
          compare_at_price?: number | null
          created_at?: string | null
          description?: string
          favorites_count?: number | null
          featured?: boolean | null
          id?: string
          images?: Json | null
          price?: number
          rating?: number | null
          reviews_count?: number | null
          sales_count?: number | null
          shipping_info?: Json | null
          sku?: string | null
          specifications?: Json | null
          status?: string | null
          stock_quantity?: number | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "marketplace_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_reviews: {
        Row: {
          buyer_id: string
          comment: string | null
          created_at: string | null
          helpful_count: number | null
          id: string
          images: Json | null
          order_id: string | null
          product_id: string
          rating: number
          seller_response: string | null
          seller_response_at: string | null
          title: string | null
          updated_at: string | null
          verified_purchase: boolean | null
        }
        Insert: {
          buyer_id: string
          comment?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          images?: Json | null
          order_id?: string | null
          product_id: string
          rating: number
          seller_response?: string | null
          seller_response_at?: string | null
          title?: string | null
          updated_at?: string | null
          verified_purchase?: boolean | null
        }
        Update: {
          buyer_id?: string
          comment?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          images?: Json | null
          order_id?: string | null
          product_id?: string
          rating?: number
          seller_response?: string | null
          seller_response_at?: string | null
          title?: string | null
          updated_at?: string | null
          verified_purchase?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "marketplace_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketplace_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "marketplace_products"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_seller_balance: {
        Row: {
          available_balance: number | null
          created_at: string | null
          id: string
          last_withdrawal_at: string | null
          pending_balance: number | null
          seller_id: string
          total_earnings: number | null
          total_withdrawn: number | null
          updated_at: string | null
        }
        Insert: {
          available_balance?: number | null
          created_at?: string | null
          id?: string
          last_withdrawal_at?: string | null
          pending_balance?: number | null
          seller_id: string
          total_earnings?: number | null
          total_withdrawn?: number | null
          updated_at?: string | null
        }
        Update: {
          available_balance?: number | null
          created_at?: string | null
          id?: string
          last_withdrawal_at?: string | null
          pending_balance?: number | null
          seller_id?: string
          total_earnings?: number | null
          total_withdrawn?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      marketplace_transactions: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          order_id: string
          payment_provider: string | null
          payment_reference: string | null
          platform_commission_amount: number
          platform_commission_rate: number
          processed_at: string | null
          seller_net_amount: number
          status: string | null
          transaction_type: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          order_id: string
          payment_provider?: string | null
          payment_reference?: string | null
          platform_commission_amount: number
          platform_commission_rate?: number
          processed_at?: string | null
          seller_net_amount: number
          status?: string | null
          transaction_type: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          order_id?: string
          payment_provider?: string | null
          payment_reference?: string | null
          platform_commission_amount?: number
          platform_commission_rate?: number
          processed_at?: string | null
          seller_net_amount?: number
          status?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "marketplace_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      master_portfolio: {
        Row: {
          category: Database["public"]["Enums"]["service_category"]
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          image_url: string
          master_id: string
          title: string
        }
        Insert: {
          category: Database["public"]["Enums"]["service_category"]
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          master_id: string
          title: string
        }
        Update: {
          category?: Database["public"]["Enums"]["service_category"]
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          master_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "master_portfolio_master_id_fkey"
            columns: ["master_id"]
            isOneToOne: false
            referencedRelation: "masters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "master_portfolio_master_id_fkey"
            columns: ["master_id"]
            isOneToOne: false
            referencedRelation: "masters_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "master_portfolio_master_id_fkey"
            columns: ["master_id"]
            isOneToOne: false
            referencedRelation: "masters_with_profile_and_services"
            referencedColumns: ["id"]
          },
        ]
      }
      master_rankings: {
        Row: {
          average_rating: number
          completion_rate: number
          id: string
          last_updated: string
          master_id: string
          rank_position: number | null
          ranking_score: number
          response_time_hours: number | null
          total_completed_jobs: number
          total_earnings: number
        }
        Insert: {
          average_rating?: number
          completion_rate?: number
          id?: string
          last_updated?: string
          master_id: string
          rank_position?: number | null
          ranking_score?: number
          response_time_hours?: number | null
          total_completed_jobs?: number
          total_earnings?: number
        }
        Update: {
          average_rating?: number
          completion_rate?: number
          id?: string
          last_updated?: string
          master_id?: string
          rank_position?: number | null
          ranking_score?: number
          response_time_hours?: number | null
          total_completed_jobs?: number
          total_earnings?: number
        }
        Relationships: [
          {
            foreignKeyName: "master_rankings_master_id_fkey"
            columns: ["master_id"]
            isOneToOne: true
            referencedRelation: "masters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "master_rankings_master_id_fkey"
            columns: ["master_id"]
            isOneToOne: true
            referencedRelation: "masters_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "master_rankings_master_id_fkey"
            columns: ["master_id"]
            isOneToOne: true
            referencedRelation: "masters_with_profile_and_services"
            referencedColumns: ["id"]
          },
        ]
      }
      masters: {
        Row: {
          availability_schedule: Json | null
          business_name: string | null
          created_at: string
          description: string | null
          experience_years: number | null
          hourly_rate: number | null
          id: string
          is_verified: boolean | null
          latitude: number | null
          longitude: number | null
          rating: number | null
          total_reviews: number | null
          updated_at: string
        }
        Insert: {
          availability_schedule?: Json | null
          business_name?: string | null
          created_at?: string
          description?: string | null
          experience_years?: number | null
          hourly_rate?: number | null
          id: string
          is_verified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          rating?: number | null
          total_reviews?: number | null
          updated_at?: string
        }
        Update: {
          availability_schedule?: Json | null
          business_name?: string | null
          created_at?: string
          description?: string | null
          experience_years?: number | null
          hourly_rate?: number | null
          id?: string
          is_verified?: boolean | null
          latitude?: number | null
          longitude?: number | null
          rating?: number | null
          total_reviews?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "masters_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_violations: {
        Row: {
          action_taken: string
          admin_notes: string | null
          admin_reviewed: boolean | null
          conversation_id: string
          created_at: string
          detected_info: Json | null
          id: string
          original_content: string
          sender_id: string
          severity: string
          violation_type: string
        }
        Insert: {
          action_taken?: string
          admin_notes?: string | null
          admin_reviewed?: boolean | null
          conversation_id: string
          created_at?: string
          detected_info?: Json | null
          id?: string
          original_content: string
          sender_id: string
          severity?: string
          violation_type: string
        }
        Update: {
          action_taken?: string
          admin_notes?: string | null
          admin_reviewed?: boolean | null
          conversation_id?: string
          created_at?: string
          detected_info?: Json | null
          id?: string
          original_content?: string
          sender_id?: string
          severity?: string
          violation_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_violations_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachment_type: string | null
          attachment_url: string | null
          block_reason: string | null
          blocked: boolean | null
          censored: boolean | null
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          read: boolean | null
          sender_id: string
        }
        Insert: {
          attachment_type?: string | null
          attachment_url?: string | null
          block_reason?: string | null
          blocked?: boolean | null
          censored?: boolean | null
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          read?: boolean | null
          sender_id: string
        }
        Update: {
          attachment_type?: string | null
          attachment_url?: string | null
          block_reason?: string | null
          blocked?: boolean | null
          censored?: boolean | null
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          read?: boolean | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscriptions: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          subscribed_at: string
          unsubscribed_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
          unsubscribed_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
          unsubscribed_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          booking_id: string | null
          conversation_id: string | null
          created_at: string | null
          id: string
          message: string
          metadata: Json | null
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          booking_id?: string | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          booking_id?: string | null
          conversation_id?: string | null
          created_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          client_id: string
          commission_amount: number
          created_at: string
          escrow_released_at: string | null
          id: string
          incentive_discount: number | null
          installments: number | null
          is_partial_payment: boolean | null
          master_amount: number
          master_id: string
          mercadopago_payment_id: string | null
          mercadopago_preference_id: string | null
          metadata: Json | null
          payment_method: string | null
          payment_percentage: number | null
          remaining_amount: number | null
          remaining_payment_id: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          booking_id: string
          client_id: string
          commission_amount?: number
          created_at?: string
          escrow_released_at?: string | null
          id?: string
          incentive_discount?: number | null
          installments?: number | null
          is_partial_payment?: boolean | null
          master_amount: number
          master_id: string
          mercadopago_payment_id?: string | null
          mercadopago_preference_id?: string | null
          metadata?: Json | null
          payment_method?: string | null
          payment_percentage?: number | null
          remaining_amount?: number | null
          remaining_payment_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          booking_id?: string
          client_id?: string
          commission_amount?: number
          created_at?: string
          escrow_released_at?: string | null
          id?: string
          incentive_discount?: number | null
          installments?: number | null
          is_partial_payment?: boolean | null
          master_amount?: number
          master_id?: string
          mercadopago_payment_id?: string | null
          mercadopago_preference_id?: string | null
          metadata?: Json | null
          payment_method?: string | null
          payment_percentage?: number | null
          remaining_amount?: number | null
          remaining_payment_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_remaining_payment_id_fkey"
            columns: ["remaining_payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          city: string | null
          created_at: string
          email_verified: boolean | null
          founder_discount_percentage: number | null
          founder_registered_at: string | null
          free_trial_ends_at: string | null
          full_name: string
          id: string
          is_founder: boolean | null
          latitude: number | null
          login_provider: string | null
          longitude: number | null
          phone: string | null
          updated_at: string
          user_type: Database["public"]["Enums"]["user_type"]
          verification_sent_at: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          email_verified?: boolean | null
          founder_discount_percentage?: number | null
          founder_registered_at?: string | null
          free_trial_ends_at?: string | null
          full_name: string
          id: string
          is_founder?: boolean | null
          latitude?: number | null
          login_provider?: string | null
          longitude?: number | null
          phone?: string | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"]
          verification_sent_at?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          email_verified?: boolean | null
          founder_discount_percentage?: number | null
          founder_registered_at?: string | null
          free_trial_ends_at?: string | null
          full_name?: string
          id?: string
          is_founder?: boolean | null
          latitude?: number | null
          login_provider?: string | null
          longitude?: number | null
          phone?: string | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"]
          verification_sent_at?: string | null
        }
        Relationships: []
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          user_id?: string
        }
        Relationships: []
      }
      referral_credits: {
        Row: {
          amount: number
          created_at: string
          expires_at: string | null
          id: string
          referral_id: string | null
          type: string
          used: boolean
          used_in_booking_id: string | null
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          referral_id?: string | null
          type: string
          used?: boolean
          used_in_booking_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          referral_id?: string | null
          type?: string
          used?: boolean
          used_in_booking_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_credits_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_credits_used_in_booking_id_fkey"
            columns: ["used_in_booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          referral_code: string
          referred_id: string
          referrer_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          referral_code: string
          referred_id: string
          referrer_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          referral_code?: string
          referred_id?: string
          referrer_id?: string
          status?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string
          client_id: string
          comment: string | null
          created_at: string
          id: string
          master_id: string
          rating: number
        }
        Insert: {
          booking_id: string
          client_id: string
          comment?: string | null
          created_at?: string
          id?: string
          master_id: string
          rating: number
        }
        Update: {
          booking_id?: string
          client_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          master_id?: string
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_master_id_fkey"
            columns: ["master_id"]
            isOneToOne: false
            referencedRelation: "masters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_master_id_fkey"
            columns: ["master_id"]
            isOneToOne: false
            referencedRelation: "masters_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_master_id_fkey"
            columns: ["master_id"]
            isOneToOne: false
            referencedRelation: "masters_with_profile_and_services"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit_log: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          ip_address: unknown
          metadata: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      service_applications: {
        Row: {
          created_at: string | null
          id: string
          master_id: string
          message: string
          proposed_price: number
          request_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          master_id: string
          message: string
          proposed_price: number
          request_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          master_id?: string
          message?: string
          proposed_price?: number
          request_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_applications_master_id_fkey"
            columns: ["master_id"]
            isOneToOne: false
            referencedRelation: "masters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_applications_master_id_fkey"
            columns: ["master_id"]
            isOneToOne: false
            referencedRelation: "masters_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_applications_master_id_fkey"
            columns: ["master_id"]
            isOneToOne: false
            referencedRelation: "masters_with_profile_and_services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_applications_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      service_from_chat: {
        Row: {
          created_at: string
          description: string
          id: string
          master_id: string
          price: number
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          master_id: string
          price: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          master_id?: string
          price?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_from_chat_master_id_fkey"
            columns: ["master_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_requests: {
        Row: {
          budget_range: string | null
          category: Database["public"]["Enums"]["service_category"]
          client_id: string
          created_at: string | null
          description: string
          id: string
          photos: string[] | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          budget_range?: string | null
          category: Database["public"]["Enums"]["service_category"]
          client_id: string
          created_at?: string | null
          description: string
          id?: string
          photos?: string[] | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          budget_range?: string | null
          category?: Database["public"]["Enums"]["service_category"]
          client_id?: string
          created_at?: string | null
          description?: string
          id?: string
          photos?: string[] | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          category: Database["public"]["Enums"]["service_category"]
          created_at: string
          description: string
          duration_minutes: number | null
          id: string
          master_id: string
          price: number
          status: Database["public"]["Enums"]["service_status"] | null
          title: string
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["service_category"]
          created_at?: string
          description: string
          duration_minutes?: number | null
          id?: string
          master_id: string
          price: number
          status?: Database["public"]["Enums"]["service_status"] | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["service_category"]
          created_at?: string
          description?: string
          duration_minutes?: number | null
          id?: string
          master_id?: string
          price?: number
          status?: Database["public"]["Enums"]["service_status"] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_master_id_fkey"
            columns: ["master_id"]
            isOneToOne: false
            referencedRelation: "masters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_master_id_fkey"
            columns: ["master_id"]
            isOneToOne: false
            referencedRelation: "masters_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_master_id_fkey"
            columns: ["master_id"]
            isOneToOne: false
            referencedRelation: "masters_with_profile_and_services"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsored_content: {
        Row: {
          budget: number | null
          category: Database["public"]["Enums"]["service_category"] | null
          clicks_count: number | null
          created_at: string
          cta_text: string | null
          cta_url: string | null
          description: string | null
          end_date: string
          id: string
          impressions_count: number | null
          is_active: boolean | null
          master_id: string | null
          media_url: string | null
          start_date: string
          title: string
          type: string
        }
        Insert: {
          budget?: number | null
          category?: Database["public"]["Enums"]["service_category"] | null
          clicks_count?: number | null
          created_at?: string
          cta_text?: string | null
          cta_url?: string | null
          description?: string | null
          end_date: string
          id?: string
          impressions_count?: number | null
          is_active?: boolean | null
          master_id?: string | null
          media_url?: string | null
          start_date: string
          title: string
          type?: string
        }
        Update: {
          budget?: number | null
          category?: Database["public"]["Enums"]["service_category"] | null
          clicks_count?: number | null
          created_at?: string
          cta_text?: string | null
          cta_url?: string | null
          description?: string | null
          end_date?: string
          id?: string
          impressions_count?: number | null
          is_active?: boolean | null
          master_id?: string | null
          media_url?: string | null
          start_date?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "sponsored_content_master_id_fkey"
            columns: ["master_id"]
            isOneToOne: false
            referencedRelation: "masters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sponsored_content_master_id_fkey"
            columns: ["master_id"]
            isOneToOne: false
            referencedRelation: "masters_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sponsored_content_master_id_fkey"
            columns: ["master_id"]
            isOneToOne: false
            referencedRelation: "masters_with_profile_and_services"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          applications_used: number
          cancelled_at: string | null
          created_at: string
          current_period_end: string
          current_period_start: string
          has_founder_discount: boolean | null
          id: string
          is_featured: boolean
          master_id: string
          mercadopago_payment_id: string | null
          mercadopago_subscription_id: string | null
          monthly_applications_limit: number
          plan: Database["public"]["Enums"]["subscription_plan"]
          price: number
          status: string | null
          updated_at: string
        }
        Insert: {
          applications_used?: number
          cancelled_at?: string | null
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          has_founder_discount?: boolean | null
          id?: string
          is_featured?: boolean
          master_id: string
          mercadopago_payment_id?: string | null
          mercadopago_subscription_id?: string | null
          monthly_applications_limit?: number
          plan?: Database["public"]["Enums"]["subscription_plan"]
          price?: number
          status?: string | null
          updated_at?: string
        }
        Update: {
          applications_used?: number
          cancelled_at?: string | null
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          has_founder_discount?: boolean | null
          id?: string
          is_featured?: boolean
          master_id?: string
          mercadopago_payment_id?: string | null
          mercadopago_subscription_id?: string | null
          monthly_applications_limit?: number
          plan?: Database["public"]["Enums"]["subscription_plan"]
          price?: number
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_interactions: {
        Row: {
          category: Database["public"]["Enums"]["service_category"] | null
          created_at: string
          id: string
          interaction_type: string
          target_id: string
          target_type: string
          user_id: string
          weight: number | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["service_category"] | null
          created_at?: string
          id?: string
          interaction_type: string
          target_id: string
          target_type: string
          user_id: string
          weight?: number | null
        }
        Update: {
          category?: Database["public"]["Enums"]["service_category"] | null
          created_at?: string
          id?: string
          interaction_type?: string
          target_id?: string
          target_type?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_warnings: {
        Row: {
          created_at: string
          id: string
          last_warning_at: string | null
          permanently_banned: boolean | null
          suspended_until: string | null
          updated_at: string
          user_id: string
          warning_count: number
        }
        Insert: {
          created_at?: string
          id?: string
          last_warning_at?: string | null
          permanently_banned?: boolean | null
          suspended_until?: string | null
          updated_at?: string
          user_id: string
          warning_count?: number
        }
        Update: {
          created_at?: string
          id?: string
          last_warning_at?: string | null
          permanently_banned?: boolean | null
          suspended_until?: string | null
          updated_at?: string
          user_id?: string
          warning_count?: number
        }
        Relationships: []
      }
    }
    Views: {
      masters_public: {
        Row: {
          availability_schedule: Json | null
          avatar_url: string | null
          business_name: string | null
          city: string | null
          created_at: string | null
          description: string | null
          experience_years: number | null
          full_name: string | null
          hourly_rate: number | null
          id: string | null
          is_verified: boolean | null
          rating: number | null
          total_reviews: number | null
        }
        Relationships: [
          {
            foreignKeyName: "masters_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      masters_with_profile_and_services: {
        Row: {
          business_name: string | null
          description: string | null
          experience_years: number | null
          hourly_rate: number | null
          id: string | null
          is_verified: boolean | null
          latitude: number | null
          longitude: number | null
          profiles: Json | null
          rating: number | null
          services: Json | null
          total_reviews: number | null
        }
        Relationships: [
          {
            foreignKeyName: "masters_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      assign_admin_role: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      auto_escalate_expired_mediations: { Args: never; Returns: undefined }
      calculate_distance: {
        Args: { lat1: number; lat2: number; lon1: number; lon2: number }
        Returns: number
      }
      calculate_master_ranking: {
        Args: { master_id_param: string }
        Returns: undefined
      }
      generate_founder_code: {
        Args: { founder_user_id: string }
        Returns: string
      }
      generate_order_number: { Args: never; Returns: string }
      generate_referral_code: {
        Args: { user_id_param: string }
        Returns: string
      }
      get_platform_stats: { Args: never; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { user_id?: string }; Returns: boolean }
      is_valid_email: { Args: { email: string }; Returns: boolean }
      recalculate_all_rankings: { Args: never; Returns: undefined }
      reset_monthly_applications: { Args: never; Returns: undefined }
      search_masters: {
        Args: { query: string }
        Returns: {
          avatar_url: string
          city: string
          full_name: string
          hourly_rate: number
          id: string
        }[]
      }
      seed_initial_feed_data: { Args: never; Returns: undefined }
      use_founder_code: {
        Args: {
          booking_id_param: string
          code_id_param: string
          discount_amount_param: number
          used_by_user_id_param: string
        }
        Returns: boolean
      }
      validate_founder_code: {
        Args: { code_to_validate: string; user_id_param: string }
        Returns: Json
      }
      validate_referral_code: {
        Args: { code_to_validate: string }
        Returns: {
          discount_percentage: number
          is_valid: boolean
        }[]
      }
    }
    Enums: {
      app_role: "client" | "master" | "admin" | "business"
      booking_status:
        | "pending"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
      payment_status:
        | "pending"
        | "approved"
        | "rejected"
        | "in_escrow"
        | "released"
        | "refunded"
      service_category:
        | "plumbing"
        | "electricity"
        | "carpentry"
        | "painting"
        | "cleaning"
        | "gardening"
        | "appliance_repair"
        | "computer_repair"
        | "construction"
        | "hvac"
        | "metalwork"
        | "automotive"
        | "industrial"
        | "appliances"
        | "computer"
        | "textiles"
        | "glass"
        | "moving"
        | "crafts"
        | "security"
        | "renewable"
        | "marine"
        | "emerging"
      service_status: "draft" | "active" | "paused" | "completed"
      subscription_plan: "free" | "premium" | "basic_plus"
      user_type: "client" | "master" | "admin" | "business"
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
      app_role: ["client", "master", "admin", "business"],
      booking_status: [
        "pending",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
      ],
      payment_status: [
        "pending",
        "approved",
        "rejected",
        "in_escrow",
        "released",
        "refunded",
      ],
      service_category: [
        "plumbing",
        "electricity",
        "carpentry",
        "painting",
        "cleaning",
        "gardening",
        "appliance_repair",
        "computer_repair",
        "construction",
        "hvac",
        "metalwork",
        "automotive",
        "industrial",
        "appliances",
        "computer",
        "textiles",
        "glass",
        "moving",
        "crafts",
        "security",
        "renewable",
        "marine",
        "emerging",
      ],
      service_status: ["draft", "active", "paused", "completed"],
      subscription_plan: ["free", "premium", "basic_plus"],
      user_type: ["client", "master", "admin", "business"],
    },
  },
} as const
