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
      emission_test_schedules: {
        Row: {
          assigned_personnel: string
          conducted_on: string
          created_at: string
          id: string
          location: string
          quarter: number
          updated_at: string
          year: number
        }
        Insert: {
          assigned_personnel: string
          conducted_on: string
          created_at?: string
          id?: string
          location: string
          quarter: number
          updated_at?: string
          year: number
        }
        Update: {
          assigned_personnel?: string
          conducted_on?: string
          created_at?: string
          id?: string
          location?: string
          quarter?: number
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      emission_tests: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          quarter: number
          result: boolean
          test_date: string
          updated_at: string
          vehicle_id: string
          year: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          quarter: number
          result: boolean
          test_date: string
          updated_at?: string
          vehicle_id: string
          year: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          quarter?: number
          result?: boolean
          test_date?: string
          updated_at?: string
          vehicle_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "emission_tests_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicle_summary_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emission_tests_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      sapling_requests: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          quantity: number
          request_date: string
          requester_address: string
          requester_name: string
          sapling_name: string
          status: Database["public"]["Enums"]["planting_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          quantity: number
          request_date: string
          requester_address: string
          requester_name: string
          sapling_name: string
          status?: Database["public"]["Enums"]["planting_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          quantity?: number
          request_date?: string
          requester_address?: string
          requester_name?: string
          sapling_name?: string
          status?: Database["public"]["Enums"]["planting_status"]
          updated_at?: string
        }
        Relationships: []
      }
      tree_planting_activities: {
        Row: {
          created_at: string
          establishment_name: string
          id: string
          notes: string | null
          planted_by: string
          planting_date: string
          quantity: number
          status: Database["public"]["Enums"]["planting_status"]
          tree_name: string
          tree_type: Database["public"]["Enums"]["tree_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          establishment_name: string
          id?: string
          notes?: string | null
          planted_by: string
          planting_date: string
          quantity: number
          status?: Database["public"]["Enums"]["planting_status"]
          tree_name: string
          tree_type: Database["public"]["Enums"]["tree_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          establishment_name?: string
          id?: string
          notes?: string | null
          planted_by?: string
          planting_date?: string
          quantity?: number
          status?: Database["public"]["Enums"]["planting_status"]
          tree_name?: string
          tree_type?: Database["public"]["Enums"]["tree_type"]
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          contact_number: string | null
          created_at: string
          driver_name: string
          engine_type: string
          id: string
          office_name: string
          plate_number: string
          updated_at: string
          vehicle_type: string
          wheels: number
        }
        Insert: {
          contact_number?: string | null
          created_at?: string
          driver_name: string
          engine_type: string
          id?: string
          office_name: string
          plate_number: string
          updated_at?: string
          vehicle_type: string
          wheels: number
        }
        Update: {
          contact_number?: string | null
          created_at?: string
          driver_name?: string
          engine_type?: string
          id?: string
          office_name?: string
          plate_number?: string
          updated_at?: string
          vehicle_type?: string
          wheels?: number
        }
        Relationships: []
      }
    }
    Views: {
      vehicle_summary_view: {
        Row: {
          contact_number: string | null
          driver_name: string | null
          engine_type: string | null
          id: string | null
          latest_test_date: string | null
          latest_test_quarter: number | null
          latest_test_result: boolean | null
          latest_test_year: number | null
          office_name: string | null
          plate_number: string | null
          vehicle_type: string | null
          wheels: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      has_role: {
        Args: { requested_role: Database["public"]["Enums"]["user_role"] }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      planting_status:
        | "planted"
        | "pending"
        | "rejected"
        | "approved"
        | "in_progress"
      tree_type:
        | "tree"
        | "ornamental"
        | "fruit"
        | "shade"
        | "decorative"
        | "other"
      user_role:
        | "admin"
        | "air-quality"
        | "tree-management"
        | "government-emission"
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
    Enums: {
      planting_status: [
        "planted",
        "pending",
        "rejected",
        "approved",
        "in_progress",
      ],
      tree_type: [
        "tree",
        "ornamental",
        "fruit",
        "shade",
        "decorative",
        "other",
      ],
      user_role: [
        "admin",
        "air-quality",
        "tree-management",
        "government-emission",
      ],
    },
  },
} as const
