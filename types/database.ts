export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          phone: string
          name: string | null
          email: string | null
          type: 'seller' | 'buyer' | 'admin'
          status: 'active' | 'suspended' | 'pending'
          language: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          phone: string
          name?: string | null
          email?: string | null
          type?: 'seller' | 'buyer' | 'admin'
          status?: 'active' | 'suspended' | 'pending'
          language?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          phone?: string
          name?: string | null
          email?: string | null
          type?: 'seller' | 'buyer' | 'admin'
          status?: 'active' | 'suspended' | 'pending'
          language?: string
          created_at?: string
          updated_at?: string
        }
      }
      sellers: {
        Row: {
          user_id: string
          business_name: string
          category: string | null
          upi_id: string | null
          pan: string | null
          gst_number: string | null
          virtual_account: string | null
          ifsc: string
          tier: 'free' | 'growth' | 'premium'
          onboarding_source: string
          referral_code: string | null
          referred_by: string | null
          commission_rate: number
          total_gmv: number
          total_orders: number
          rating: number
          shiprocket_token: string | null
          store_url: string | null
          settings: Json
          created_at: string
        }
        Insert: {
          user_id: string
          business_name: string
          category?: string | null
          upi_id?: string | null
          pan?: string | null
          gst_number?: string | null
          virtual_account?: string | null
          ifsc?: string
          tier?: 'free' | 'growth' | 'premium'
          onboarding_source?: string
          referral_code?: string | null
          referred_by?: string | null
          commission_rate?: number
          total_gmv?: number
          total_orders?: number
          rating?: number
          shiprocket_token?: string | null
          store_url?: string | null
          settings?: Json
          created_at?: string
        }
        Update: {
          user_id?: string
          business_name?: string
          category?: string | null
          upi_id?: string | null
          pan?: string | null
          gst_number?: string | null
          virtual_account?: string | null
          ifsc?: string
          tier?: 'free' | 'growth' | 'premium'
          onboarding_source?: string
          referral_code?: string | null
          referred_by?: string | null
          commission_rate?: number
          total_gmv?: number
          total_orders?: number
          rating?: number
          shiprocket_token?: string | null
          store_url?: string | null
          settings?: Json
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          seller_id: string
          name: string
          description: string | null
          images: Json
          category: string | null
          subcategory: string | null
          price: number
          compare_at_price: number | null
          cost_price: number | null
          stock: number
          reserved_stock: number
          sku: string | null
          weight: number | null
          status: 'active' | 'paused' | 'deleted'
          source: string | null
          source_metadata: Json
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          seller_id: string
          name: string
          description?: string | null
          images?: Json
          category?: string | null
          subcategory?: string | null
          price: number
          compare_at_price?: number | null
          cost_price?: number | null
          stock?: number
          reserved_stock?: number
          sku?: string | null
          weight?: number | null
          status?: 'active' | 'paused' | 'deleted'
          source?: string | null
          source_metadata?: Json
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          seller_id?: string
          name?: string
          description?: string | null
          images?: Json
          category?: string | null
          subcategory?: string | null
          price?: number
          compare_at_price?: number | null
          cost_price?: number | null
          stock?: number
          reserved_stock?: number
          sku?: string | null
          weight?: number | null
          status?: 'active' | 'paused' | 'deleted'
          source?: string | null
          source_metadata?: Json
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          attributes: Json
          price: number | null
          stock: number
          sku: string | null
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          attributes: Json
          price?: number | null
          stock?: number
          sku?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          attributes?: Json
          price?: number | null
          stock?: number
          sku?: string | null
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          seller_id: string
          buyer_id: string
          items: Json
          subtotal: number
          shipping_charge: number
          cod_charge: number
          discount: number
          total_amount: number
          payment_method: string
          payment_status: 'pending' | 'processing' | 'verified' | 'failed' | 'refunded'
          payment_reference: string | null
          shipping_address: Json
          billing_address: Json | null
          awb_number: string | null
          courier_name: string | null
          tracking_url: string | null
          status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'in_transit' | 'delivered' | 'cancelled' | 'returned'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: string
          seller_id: string
          buyer_id: string
          items: Json
          subtotal: number
          shipping_charge?: number
          cod_charge?: number
          discount?: number
          total_amount: number
          payment_method: string
          payment_status?: 'pending' | 'processing' | 'verified' | 'failed' | 'refunded'
          payment_reference?: string | null
          shipping_address: Json
          billing_address?: Json | null
          awb_number?: string | null
          courier_name?: string | null
          tracking_url?: string | null
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'in_transit' | 'delivered' | 'cancelled' | 'returned'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          seller_id?: string
          buyer_id?: string
          items?: Json
          subtotal?: number
          shipping_charge?: number
          cod_charge?: number
          discount?: number
          total_amount?: number
          payment_method?: string
          payment_status?: 'pending' | 'processing' | 'verified' | 'failed' | 'refunded'
          payment_reference?: string | null
          shipping_address?: Json
          billing_address?: Json | null
          awb_number?: string | null
          courier_name?: string | null
          tracking_url?: string | null
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'in_transit' | 'delivered' | 'cancelled' | 'returned'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          order_id: string
          transaction_id: string
          payment_method: string | null
          amount: number
          currency: string
          status: string
          gateway_response: Json
          utr_number: string | null
          payer_vpa: string | null
          verified_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          transaction_id: string
          payment_method?: string | null
          amount: number
          currency?: string
          status: string
          gateway_response?: Json
          utr_number?: string | null
          payer_vpa?: string | null
          verified_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          transaction_id?: string
          payment_method?: string | null
          amount?: number
          currency?: string
          status?: string
          gateway_response?: Json
          utr_number?: string | null
          payer_vpa?: string | null
          verified_at?: string | null
          created_at?: string
        }
      }
      chats: {
        Row: {
          id: string
          seller_id: string
          buyer_id: string
          product_id: string | null
          status: 'active' | 'archived'
          last_message_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          seller_id: string
          buyer_id: string
          product_id?: string | null
          status?: 'active' | 'archived'
          last_message_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          seller_id?: string
          buyer_id?: string
          product_id?: string | null
          status?: 'active' | 'archived'
          last_message_at?: string | null
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          chat_id: string
          sender_id: string
          message_type: 'text' | 'image' | 'product' | 'order'
          content: string | null
          metadata: Json
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          chat_id: string
          sender_id: string
          message_type?: 'text' | 'image' | 'product' | 'order'
          content?: string | null
          metadata?: Json
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          chat_id?: string
          sender_id?: string
          message_type?: 'text' | 'image' | 'product' | 'order'
          content?: string | null
          metadata?: Json
          read_at?: string | null
          created_at?: string
        }
      }
      livestreams: {
        Row: {
          id: string
          seller_id: string
          title: string | null
          platform: string | null
          stream_url: string | null
          status: 'scheduled' | 'live' | 'ended'
          started_at: string | null
          ended_at: string | null
          duration: number | null
          viewer_count: number
          products_captured: number
          orders_generated: number
          gmv_generated: number
          created_at: string
        }
        Insert: {
          id?: string
          seller_id: string
          title?: string | null
          platform?: string | null
          stream_url?: string | null
          status?: 'scheduled' | 'live' | 'ended'
          started_at?: string | null
          ended_at?: string | null
          duration?: number | null
          viewer_count?: number
          products_captured?: number
          orders_generated?: number
          gmv_generated?: number
          created_at?: string
        }
        Update: {
          id?: string
          seller_id?: string
          title?: string | null
          platform?: string | null
          stream_url?: string | null
          status?: 'scheduled' | 'live' | 'ended'
          started_at?: string | null
          ended_at?: string | null
          duration?: number | null
          viewer_count?: number
          products_captured?: number
          orders_generated?: number
          gmv_generated?: number
          created_at?: string
        }
      }
      admin_groups: {
        Row: {
          id: string
          admin_id: string
          group_name: string
          group_id: string | null
          platform: string
          member_count: number
          sellers_onboarded: number
          total_gmv: number
          commission_rate: number
          total_earnings: number
          settings: Json
          created_at: string
        }
        Insert: {
          id?: string
          admin_id: string
          group_name: string
          group_id?: string | null
          platform?: string
          member_count?: number
          sellers_onboarded?: number
          total_gmv?: number
          commission_rate?: number
          total_earnings?: number
          settings?: Json
          created_at?: string
        }
        Update: {
          id?: string
          admin_id?: string
          group_name?: string
          group_id?: string | null
          platform?: string
          member_count?: number
          sellers_onboarded?: number
          total_gmv?: number
          commission_rate?: number
          total_earnings?: number
          settings?: Json
          created_at?: string
        }
      }
      admin_sellers: {
        Row: {
          admin_id: string
          seller_id: string
          commission_rate: number
          total_gmv: number
          total_commission: number
          status: 'active' | 'inactive'
          created_at: string
        }
        Insert: {
          admin_id: string
          seller_id: string
          commission_rate?: number
          total_gmv?: number
          total_commission?: number
          status?: 'active' | 'inactive'
          created_at?: string
        }
        Update: {
          admin_id?: string
          seller_id?: string
          commission_rate?: number
          total_gmv?: number
          total_commission?: number
          status?: 'active' | 'inactive'
          created_at?: string
        }
      }
      shipments: {
        Row: {
          id: string
          order_id: string
          shipment_id: string | null
          courier_id: number | null
          courier_name: string | null
          awb_number: string | null
          pickup_token: string | null
          pickup_scheduled_date: string | null
          estimated_delivery: string | null
          actual_cost: number | null
          charged_cost: number | null
          profit: number | null
          status: string | null
          tracking_events: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_id: string
          shipment_id?: string | null
          courier_id?: number | null
          courier_name?: string | null
          awb_number?: string | null
          pickup_token?: string | null
          pickup_scheduled_date?: string | null
          estimated_delivery?: string | null
          actual_cost?: number | null
          charged_cost?: number | null
          profit?: number | null
          status?: string | null
          tracking_events?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          shipment_id?: string | null
          courier_id?: number | null
          courier_name?: string | null
          awb_number?: string | null
          pickup_token?: string | null
          pickup_scheduled_date?: string | null
          estimated_delivery?: string | null
          actual_cost?: number | null
          charged_cost?: number | null
          profit?: number | null
          status?: string | null
          tracking_events?: Json
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          metadata: Json
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          metadata?: Json
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          metadata?: Json
          read_at?: string | null
          created_at?: string
        }
      }
      events: {
        Row: {
          id: string
          user_id: string
          event_type: string
          event_data: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event_type: string
          event_data?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          event_type?: string
          event_data?: Json
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}