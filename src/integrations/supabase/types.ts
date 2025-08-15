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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      account_security: {
        Row: {
          account_locked_until: string | null
          created_at: string
          failed_login_attempts: number
          id: string
          last_failed_login: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          account_locked_until?: string | null
          created_at?: string
          failed_login_attempts?: number
          id?: string
          last_failed_login?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          account_locked_until?: string | null
          created_at?: string
          failed_login_attempts?: number
          id?: string
          last_failed_login?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      animals: {
        Row: {
          age: number | null
          animal_code: string
          birth_date: string | null
          breed: string | null
          created_at: string
          health_status: string | null
          id: string
          is_vet_verified: boolean | null
          last_vaccination: string | null
          name: string
          parent_id: string | null
          photo_url: string | null
          type: string
          updated_at: string
          user_id: string
          weight: number | null
        }
        Insert: {
          age?: number | null
          animal_code: string
          birth_date?: string | null
          breed?: string | null
          created_at?: string
          health_status?: string | null
          id?: string
          is_vet_verified?: boolean | null
          last_vaccination?: string | null
          name: string
          parent_id?: string | null
          photo_url?: string | null
          type: string
          updated_at?: string
          user_id: string
          weight?: number | null
        }
        Update: {
          age?: number | null
          animal_code?: string
          birth_date?: string | null
          breed?: string | null
          created_at?: string
          health_status?: string | null
          id?: string
          is_vet_verified?: boolean | null
          last_vaccination?: string | null
          name?: string
          parent_id?: string | null
          photo_url?: string | null
          type?: string
          updated_at?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "animals_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      buyer_interests: {
        Row: {
          buyer_user_id: string
          created_at: string | null
          id: string
          listing_id: string
          message: string | null
          seller_user_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          buyer_user_id: string
          created_at?: string | null
          id?: string
          listing_id: string
          message?: string | null
          seller_user_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          buyer_user_id?: string
          created_at?: string | null
          id?: string
          listing_id?: string
          message?: string | null
          seller_user_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "buyer_interests_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "market_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buyer_interests_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "public_market_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buyer_interests_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "public_market_view"
            referencedColumns: ["id"]
          },
        ]
      }
      farm_assistants: {
        Row: {
          assistant_user_id: string
          created_at: string
          farm_owner_id: string
          id: string
          permissions: Json | null
          status: string | null
          updated_at: string
        }
        Insert: {
          assistant_user_id: string
          created_at?: string
          farm_owner_id: string
          id?: string
          permissions?: Json | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          assistant_user_id?: string
          created_at?: string
          farm_owner_id?: string
          id?: string
          permissions?: Json | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      farm_profiles: {
        Row: {
          created_at: string
          farm_name: string
          farm_prefix: string
          id: string
          location: string | null
          owner_name: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          farm_name: string
          farm_prefix: string
          id?: string
          location?: string | null
          owner_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          farm_name?: string
          farm_prefix?: string
          id?: string
          location?: string | null
          owner_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      feed_inventory: {
        Row: {
          cost_per_kg: number | null
          created_at: string | null
          expiry_date: string | null
          feed_type: string
          id: string
          purchase_date: string | null
          quantity_kg: number
          supplier: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cost_per_kg?: number | null
          created_at?: string | null
          expiry_date?: string | null
          feed_type: string
          id?: string
          purchase_date?: string | null
          quantity_kg: number
          supplier?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cost_per_kg?: number | null
          created_at?: string | null
          expiry_date?: string | null
          feed_type?: string
          id?: string
          purchase_date?: string | null
          quantity_kg?: number
          supplier?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      financial_records: {
        Row: {
          amount: number
          animal_id: string | null
          category: string
          created_at: string | null
          description: string | null
          id: string
          transaction_date: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          animal_id?: string | null
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          transaction_date?: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          animal_id?: string | null
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          transaction_date?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_records_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
        ]
      }
      growth_records: {
        Row: {
          animal_id: string | null
          created_at: string
          height: number | null
          id: string
          notes: string | null
          recorded_date: string
          user_id: string
          weight: number
        }
        Insert: {
          animal_id?: string | null
          created_at?: string
          height?: number | null
          id?: string
          notes?: string | null
          recorded_date?: string
          user_id: string
          weight: number
        }
        Update: {
          animal_id?: string | null
          created_at?: string
          height?: number | null
          id?: string
          notes?: string | null
          recorded_date?: string
          user_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "growth_records_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
        ]
      }
      health_records: {
        Row: {
          administered_date: string
          animal_id: string | null
          created_at: string
          id: string
          medicine_name: string | null
          notes: string | null
          photo_url: string | null
          record_type: string
          severity: string | null
          symptoms: string | null
          user_id: string
        }
        Insert: {
          administered_date: string
          animal_id?: string | null
          created_at?: string
          id?: string
          medicine_name?: string | null
          notes?: string | null
          photo_url?: string | null
          record_type: string
          severity?: string | null
          symptoms?: string | null
          user_id: string
        }
        Update: {
          administered_date?: string
          animal_id?: string | null
          created_at?: string
          id?: string
          medicine_name?: string | null
          notes?: string | null
          photo_url?: string | null
          record_type?: string
          severity?: string | null
          symptoms?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_records_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
        ]
      }
      health_submissions: {
        Row: {
          admin_notes: string | null
          animal_id: string
          created_at: string
          description: string | null
          id: string
          photo_url: string | null
          status: string | null
          symptoms: string
          updated_at: string
          urgency: string | null
          user_id: string
          vet_advice: string | null
        }
        Insert: {
          admin_notes?: string | null
          animal_id: string
          created_at?: string
          description?: string | null
          id?: string
          photo_url?: string | null
          status?: string | null
          symptoms: string
          updated_at?: string
          urgency?: string | null
          user_id: string
          vet_advice?: string | null
        }
        Update: {
          admin_notes?: string | null
          animal_id?: string
          created_at?: string
          description?: string | null
          id?: string
          photo_url?: string | null
          status?: string | null
          symptoms?: string
          updated_at?: string
          urgency?: string | null
          user_id?: string
          vet_advice?: string | null
        }
        Relationships: []
      }
      listing_views: {
        Row: {
          id: string
          ip_address: unknown | null
          listing_id: string
          session_id: string
          user_agent: string | null
          viewed_at: string | null
        }
        Insert: {
          id?: string
          ip_address?: unknown | null
          listing_id: string
          session_id: string
          user_agent?: string | null
          viewed_at?: string | null
        }
        Update: {
          id?: string
          ip_address?: unknown | null
          listing_id?: string
          session_id?: string
          user_agent?: string | null
          viewed_at?: string | null
        }
        Relationships: []
      }
      market_listings: {
        Row: {
          age: number | null
          animal_id: string
          contact_method: string | null
          contact_value: string | null
          created_at: string
          description: string | null
          id: string
          is_vet_verified: boolean | null
          location: string | null
          photos: string[] | null
          price: number
          status: string | null
          title: string
          updated_at: string
          user_id: string
          weight: number | null
        }
        Insert: {
          age?: number | null
          animal_id: string
          contact_method?: string | null
          contact_value?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_vet_verified?: boolean | null
          location?: string | null
          photos?: string[] | null
          price: number
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
          weight?: number | null
        }
        Update: {
          age?: number | null
          animal_id?: string
          contact_method?: string | null
          contact_value?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_vet_verified?: boolean | null
          location?: string | null
          photos?: string[] | null
          price?: number
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      milk_production: {
        Row: {
          animal_id: string | null
          created_at: string | null
          evening_yield: number | null
          fat_content: number | null
          id: string
          morning_yield: number | null
          notes: string | null
          production_date: string
          quality_grade: string | null
          total_yield: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          animal_id?: string | null
          created_at?: string | null
          evening_yield?: number | null
          fat_content?: number | null
          id?: string
          morning_yield?: number | null
          notes?: string | null
          production_date?: string
          quality_grade?: string | null
          total_yield?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          animal_id?: string | null
          created_at?: string | null
          evening_yield?: number | null
          fat_content?: number | null
          id?: string
          morning_yield?: number | null
          notes?: string | null
          production_date?: string
          quality_grade?: string | null
          total_yield?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "milk_production_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      poultry_groups: {
        Row: {
          batch_date: string
          breed: string | null
          created_at: string
          current_count: number
          group_code: string
          group_name: string
          id: string
          notes: string | null
          total_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          batch_date?: string
          breed?: string | null
          created_at?: string
          current_count?: number
          group_code: string
          group_name: string
          id?: string
          notes?: string | null
          total_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          batch_date?: string
          breed?: string | null
          created_at?: string
          current_count?: number
          group_code?: string
          group_name?: string
          id?: string
          notes?: string | null
          total_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vaccination_schedules: {
        Row: {
          age_days: number
          animal_type: string
          created_at: string
          description: string | null
          id: string
          is_mandatory: boolean | null
          vaccine_name: string
        }
        Insert: {
          age_days: number
          animal_type: string
          created_at?: string
          description?: string | null
          id?: string
          is_mandatory?: boolean | null
          vaccine_name: string
        }
        Update: {
          age_days?: number
          animal_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_mandatory?: boolean | null
          vaccine_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_market_listings: {
        Row: {
          age: number | null
          animal_id: string | null
          contact_method: string | null
          contact_value: string | null
          created_at: string | null
          description: string | null
          id: string | null
          is_vet_verified: boolean | null
          location: string | null
          photos: string[] | null
          price: number | null
          status: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
          weight: number | null
        }
        Insert: {
          age?: number | null
          animal_id?: string | null
          contact_method?: never
          contact_value?: never
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_vet_verified?: boolean | null
          location?: string | null
          photos?: string[] | null
          price?: never
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: never
          weight?: number | null
        }
        Update: {
          age?: number | null
          animal_id?: string | null
          contact_method?: never
          contact_value?: never
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_vet_verified?: boolean | null
          location?: string | null
          photos?: string[] | null
          price?: never
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: never
          weight?: number | null
        }
        Relationships: []
      }
      public_market_view: {
        Row: {
          age: number | null
          animal_id: string | null
          contact_method: string | null
          contact_value: string | null
          created_at: string | null
          description: string | null
          id: string | null
          is_vet_verified: boolean | null
          location: string | null
          photos: string[] | null
          price: number | null
          status: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
          weight: number | null
        }
        Insert: {
          age?: number | null
          animal_id?: string | null
          contact_method?: never
          contact_value?: never
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_vet_verified?: boolean | null
          location?: string | null
          photos?: string[] | null
          price?: number | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          weight?: number | null
        }
        Update: {
          age?: number | null
          animal_id?: string | null
          contact_method?: never
          contact_value?: never
          created_at?: string | null
          description?: string | null
          id?: string | null
          is_vet_verified?: boolean | null
          location?: string | null
          photos?: string[] | null
          price?: number | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
          weight?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_view_contact_info: {
        Args: { listing_id: string; listing_user_id: string }
        Returns: boolean
      }
      generate_animal_code: {
        Args: {
          p_animal_type: string
          p_farm_prefix: string
          p_user_id: string
        }
        Returns: string
      }
      generate_poultry_group_code: {
        Args: { p_farm_prefix: string; p_user_id: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
