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
        Args: {
          requested_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
