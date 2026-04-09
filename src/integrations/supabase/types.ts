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
      assistant_conversations: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      assistant_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "assistant_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "assistant_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      catches: {
        Row: {
          bait: string | null
          catch_date: string
          created_at: string
          fish: string
          id: string
          is_public: boolean
          is_seeded: boolean
          length: number | null
          location_lat: number | null
          location_lng: number | null
          notes: string | null
          photo_url: string | null
          technique: string | null
          user_id: string
          verification_result: Json | null
          verified: boolean
          water: string | null
          weight: number | null
        }
        Insert: {
          bait?: string | null
          catch_date?: string
          created_at?: string
          fish: string
          id?: string
          is_public?: boolean
          is_seeded?: boolean
          length?: number | null
          location_lat?: number | null
          location_lng?: number | null
          notes?: string | null
          photo_url?: string | null
          technique?: string | null
          user_id: string
          verification_result?: Json | null
          verified?: boolean
          water?: string | null
          weight?: number | null
        }
        Update: {
          bait?: string | null
          catch_date?: string
          created_at?: string
          fish?: string
          id?: string
          is_public?: boolean
          is_seeded?: boolean
          length?: number | null
          location_lat?: number | null
          location_lng?: number | null
          notes?: string | null
          photo_url?: string | null
          technique?: string | null
          user_id?: string
          verification_result?: Json | null
          verified?: boolean
          water?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      chat_group_members: {
        Row: {
          created_at: string
          group_id: string
          id: string
          role: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          role?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          role?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "chat_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_groups: {
        Row: {
          avatar_url: string | null
          created_at: string
          creator_id: string
          id: string
          invite_code: string | null
          is_public: boolean
          name: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          creator_id: string
          id?: string
          invite_code?: string | null
          is_public?: boolean
          name: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          creator_id?: string
          id?: string
          invite_code?: string | null
          is_public?: boolean
          name?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string | null
          created_at: string
          id: string
          image_url: string | null
          read: boolean
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          read?: boolean
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          read?: boolean
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      community_posts: {
        Row: {
          catch_bait: string | null
          catch_length: number | null
          catch_water_temp: number | null
          catch_weight: number | null
          content: string
          created_at: string
          fish_species: string | null
          id: string
          location: string | null
          photo_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          catch_bait?: string | null
          catch_length?: number | null
          catch_water_temp?: number | null
          catch_weight?: number | null
          content: string
          created_at?: string
          fish_species?: string | null
          id?: string
          location?: string | null
          photo_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          catch_bait?: string | null
          catch_length?: number | null
          catch_water_temp?: number | null
          catch_weight?: number | null
          content?: string
          created_at?: string
          fish_species?: string | null
          id?: string
          location?: string | null
          photo_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      favorite_groups: {
        Row: {
          created_at: string
          group_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorite_groups_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "chat_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      fish_name_translations: {
        Row: {
          created_at: string
          fish_id: string
          id: string
          language_code: string
          translated_name: string
        }
        Insert: {
          created_at?: string
          fish_id: string
          id?: string
          language_code: string
          translated_name: string
        }
        Update: {
          created_at?: string
          fish_id?: string
          id?: string
          language_code?: string
          translated_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "fish_name_translations_fish_id_fkey"
            columns: ["fish_id"]
            isOneToOne: false
            referencedRelation: "fish_species"
            referencedColumns: ["id"]
          },
        ]
      }
      fish_species: {
        Row: {
          baits: string[] | null
          category: string | null
          created_at: string
          description: string | null
          habitat: string | null
          id: string
          image_url: string | null
          latin_name: string | null
          min_size: string | null
          name_en: string
          protection: string | null
          techniques: string[] | null
        }
        Insert: {
          baits?: string[] | null
          category?: string | null
          created_at?: string
          description?: string | null
          habitat?: string | null
          id?: string
          image_url?: string | null
          latin_name?: string | null
          min_size?: string | null
          name_en: string
          protection?: string | null
          techniques?: string[] | null
        }
        Update: {
          baits?: string[] | null
          category?: string | null
          created_at?: string
          description?: string | null
          habitat?: string | null
          id?: string
          image_url?: string | null
          latin_name?: string | null
          min_size?: string | null
          name_en?: string
          protection?: string | null
          techniques?: string[] | null
        }
        Relationships: []
      }
      fishing_locations: {
        Row: {
          category: string | null
          country: string | null
          created_at: string
          id: string
          lat: number
          lng: number
          name: string
          species: string[] | null
          state: string | null
        }
        Insert: {
          category?: string | null
          country?: string | null
          created_at?: string
          id?: string
          lat: number
          lng: number
          name: string
          species?: string[] | null
          state?: string | null
        }
        Update: {
          category?: string | null
          country?: string | null
          created_at?: string
          id?: string
          lat?: number
          lng?: number
          name?: string
          species?: string[] | null
          state?: string | null
        }
        Relationships: []
      }
      friendships: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          requester_id: string
          status: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          id?: string
          requester_id: string
          status?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          requester_id?: string
          status?: string
        }
        Relationships: []
      }
      group_messages: {
        Row: {
          content: string | null
          created_at: string
          group_id: string
          id: string
          image_url: string | null
          sender_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          group_id: string
          id?: string
          image_url?: string | null
          sender_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          group_id?: string
          id?: string
          image_url?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "chat_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          actor_id: string
          created_at: string
          group_id: string | null
          id: string
          post_id: string | null
          read: boolean
          type: string
          user_id: string
        }
        Insert: {
          actor_id: string
          created_at?: string
          group_id?: string | null
          id?: string
          post_id?: string | null
          read?: boolean
          type: string
          user_id: string
        }
        Update: {
          actor_id?: string
          created_at?: string
          group_id?: string | null
          id?: string
          post_id?: string | null
          read?: boolean
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "chat_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          image_url: string | null
          parent_id: string | null
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          parent_id?: string | null
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          parent_id?: string | null
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          is_premium: boolean
          is_seed_user: boolean
          preferred_language: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          is_premium?: boolean
          is_seed_user?: boolean
          preferred_language?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          is_premium?: boolean
          is_seed_user?: boolean
          preferred_language?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      ui_translations: {
        Row: {
          created_at: string
          id: string
          language_code: string
          translations: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          language_code: string
          translations: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          language_code?: string
          translations?: Json
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_country_summary: {
        Args: never
        Returns: {
          avg_lat: number
          avg_lng: number
          country: string
          loc_count: number
        }[]
      }
      get_email_by_username: { Args: { _username: string }; Returns: string }
      get_leaderboard: {
        Args: { since_date: string }
        Returns: {
          catch_count: number
          max_length: number
          max_weight: number
          user_id: string
        }[]
      }
      get_nearest_spots: {
        Args: { _lat: number; _limit?: number; _lng: number }
        Returns: {
          category: string
          country: string
          distance_km: number
          lat: number
          lng: number
          name: string
          species: string[]
          state: string
        }[]
      }
      get_states_for_fish: { Args: { fish_name: string }; Returns: string[] }
      is_accepted_group_member: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
      }
      is_group_member: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
      }
      mark_seed_catches_batch: {
        Args: { batch_size?: number }
        Returns: number
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
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
