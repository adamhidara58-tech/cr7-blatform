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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string
          details: Json | null
          id: string
          target_id: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      crypto_deposits: {
        Row: {
          amount_crypto: number | null
          amount_usd: number
          confirmed_at: string | null
          created_at: string
          currency: string
          expires_at: string | null
          id: string
          invoice_id: string
          network: string | null
          order_id: string
          payment_id: string | null
          payment_status: string
          tx_hash: string | null
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          amount_crypto?: number | null
          amount_usd: number
          confirmed_at?: string | null
          created_at?: string
          currency: string
          expires_at?: string | null
          id?: string
          invoice_id: string
          network?: string | null
          order_id: string
          payment_id?: string | null
          payment_status?: string
          tx_hash?: string | null
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          amount_crypto?: number | null
          amount_usd?: number
          confirmed_at?: string | null
          created_at?: string
          currency?: string
          expires_at?: string | null
          id?: string
          invoice_id?: string
          network?: string | null
          order_id?: string
          payment_id?: string | null
          payment_status?: string
          tx_hash?: string | null
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crypto_deposits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crypto_withdrawals: {
        Row: {
          amount_crypto: number | null
          amount_usd: number
          created_at: string
          currency: string
          fee_amount: number | null
          id: string
          network: string | null
          payout_type: string | null
          processed_at: string | null
          status: string
          tx_hash: string | null
          user_id: string
          wallet_address: string
          withdrawal_id: string | null
        }
        Insert: {
          amount_crypto?: number | null
          amount_usd: number
          created_at?: string
          currency: string
          fee_amount?: number | null
          id?: string
          network?: string | null
          payout_type?: string | null
          processed_at?: string | null
          status?: string
          tx_hash?: string | null
          user_id: string
          wallet_address: string
          withdrawal_id?: string | null
        }
        Update: {
          amount_crypto?: number | null
          amount_usd?: number
          created_at?: string
          currency?: string
          fee_amount?: number | null
          id?: string
          network?: string | null
          payout_type?: string | null
          processed_at?: string | null
          status?: string
          tx_hash?: string | null
          user_id?: string
          wallet_address?: string
          withdrawal_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crypto_withdrawals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_claims: {
        Row: {
          amount: number
          claimed_at: string
          created_at: string
          id: string
          user_id: string
          vip_level: number
        }
        Insert: {
          amount: number
          claimed_at?: string
          created_at?: string
          id?: string
          user_id: string
          vip_level: number
        }
        Update: {
          amount?: number
          claimed_at?: string
          created_at?: string
          id?: string
          user_id?: string
          vip_level?: number
        }
        Relationships: [
          {
            foreignKeyName: "daily_claims_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_stats: {
        Row: {
          active_challenges: number
          id: string
          total_paid: number
          total_users: number
          updated_at: string
        }
        Insert: {
          active_challenges?: number
          id?: string
          total_paid?: number
          total_users?: number
          updated_at?: string
        }
        Update: {
          active_challenges?: number
          id?: string
          total_paid?: number
          total_users?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          balance: number
          created_at: string
          daily_challenges_completed: number
          daily_challenges_limit: number
          email: string
          id: string
          last_withdrawal_at: string | null
          referral_code: string
          referral_discount: number | null
          referred_by: string | null
          total_earned: number
          updated_at: string
          username: string
          vip_level: number
        }
        Insert: {
          avatar_url?: string | null
          balance?: number
          created_at?: string
          daily_challenges_completed?: number
          daily_challenges_limit?: number
          email: string
          id: string
          last_withdrawal_at?: string | null
          referral_code: string
          referral_discount?: number | null
          referred_by?: string | null
          total_earned?: number
          updated_at?: string
          username: string
          vip_level?: number
        }
        Update: {
          avatar_url?: string | null
          balance?: number
          created_at?: string
          daily_challenges_completed?: number
          daily_challenges_limit?: number
          email?: string
          id?: string
          last_withdrawal_at?: string | null
          referral_code?: string
          referral_discount?: number | null
          referred_by?: string | null
          total_earned?: number
          updated_at?: string
          username?: string
          vip_level?: number
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          commission_rate: number
          created_at: string
          id: string
          referred_id: string
          referrer_id: string
          total_commission: number
        }
        Insert: {
          commission_rate?: number
          created_at?: string
          id?: string
          referred_id: string
          referrer_id: string
          total_commission?: number
        }
        Update: {
          commission_rate?: number
          created_at?: string
          id?: string
          referred_id?: string
          referrer_id?: string
          total_commission?: number
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          description: string
          id: string
          related_user_id: string | null
          status: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          id?: string
          related_user_id?: string | null
          status?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          id?: string
          related_user_id?: string | null
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_related_user_id_fkey"
            columns: ["related_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      generate_referral_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
