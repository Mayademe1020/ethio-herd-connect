export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
      [_ in never]: never
    }
    Functions: {
      generate_animal_code: {
        Args: {
          p_user_id: string
          p_farm_prefix: string
          p_animal_type: string
        }
        Returns: string
      }
      generate_poultry_group_code: {
        Args: { p_user_id: string; p_farm_prefix: string }
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
