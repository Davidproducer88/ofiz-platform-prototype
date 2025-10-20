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
          client_id: string
          created_at: string
          id: string
          master_id: string
          notes: string | null
          scheduled_date: string
          service_id: string
          status: Database["public"]["Enums"]["booking_status"] | null
          total_price: number
          updated_at: string
        }
        Insert: {
          client_address: string
          client_id: string
          created_at?: string
          id?: string
          master_id: string
          notes?: string | null
          scheduled_date: string
          service_id: string
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_price: number
          updated_at?: string
        }
        Update: {
          client_address?: string
          client_id?: string
          created_at?: string
          id?: string
          master_id?: string
          notes?: string | null
          scheduled_date?: string
          service_id?: string
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_price?: number
          updated_at?: string
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
          booking_id: string
          client_id: string
          created_at: string | null
          id: string
          last_message_at: string | null
          master_id: string
        }
        Insert: {
          booking_id: string
          client_id: string
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          master_id: string
        }
        Update: {
          booking_id?: string
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
      messages: {
        Row: {
          attachment_type: string | null
          attachment_url: string | null
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
          master_amount: number
          master_id: string
          mercadopago_payment_id: string | null
          mercadopago_preference_id: string | null
          metadata: Json | null
          payment_method: string | null
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
          master_amount: number
          master_id: string
          mercadopago_payment_id?: string | null
          mercadopago_preference_id?: string | null
          metadata?: Json | null
          payment_method?: string | null
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
          master_amount?: number
          master_id?: string
          mercadopago_payment_id?: string | null
          mercadopago_preference_id?: string | null
          metadata?: Json | null
          payment_method?: string | null
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
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          city: string | null
          created_at: string
          email_verified: boolean | null
          full_name: string
          id: string
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
          full_name: string
          id: string
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
          full_name?: string
          id?: string
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
        ]
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
            foreignKeyName: "service_applications_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
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
        ]
      }
      subscriptions: {
        Row: {
          applications_used: number
          cancelled_at: string | null
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          is_featured: boolean
          master_id: string
          mercadopago_subscription_id: string | null
          monthly_applications_limit: number
          plan: Database["public"]["Enums"]["subscription_plan"]
          price: number
          updated_at: string
        }
        Insert: {
          applications_used?: number
          cancelled_at?: string | null
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          is_featured?: boolean
          master_id: string
          mercadopago_subscription_id?: string | null
          monthly_applications_limit?: number
          plan?: Database["public"]["Enums"]["subscription_plan"]
          price?: number
          updated_at?: string
        }
        Update: {
          applications_used?: number
          cancelled_at?: string | null
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          is_featured?: boolean
          master_id?: string
          mercadopago_subscription_id?: string | null
          monthly_applications_limit?: number
          plan?: Database["public"]["Enums"]["subscription_plan"]
          price?: number
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_admin_role: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      calculate_distance: {
        Args: { lat1: number; lat2: number; lon1: number; lon2: number }
        Returns: number
      }
      calculate_master_ranking: {
        Args: { master_id_param: string }
        Returns: undefined
      }
      generate_referral_code: {
        Args: { user_id_param: string }
        Returns: string
      }
      get_platform_stats: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
      recalculate_all_rankings: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      reset_monthly_applications: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      seed_initial_feed_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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
      service_status: "draft" | "active" | "paused" | "completed"
      subscription_plan: "free" | "premium"
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
      ],
      service_status: ["draft", "active", "paused", "completed"],
      subscription_plan: ["free", "premium"],
      user_type: ["client", "master", "admin", "business"],
    },
  },
} as const
