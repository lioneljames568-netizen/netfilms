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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      actors: {
        Row: {
          biography: string
          created_at: string
          full_name: string
          id: string
          photo_url: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          biography?: string
          created_at?: string
          full_name: string
          id?: string
          photo_url?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          biography?: string
          created_at?: string
          full_name?: string
          id?: string
          photo_url?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          display_name: string
          is_active: boolean
          role: Database["public"]["Enums"]["admin_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name: string
          is_active?: boolean
          role: Database["public"]["Enums"]["admin_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string
          is_active?: boolean
          role?: Database["public"]["Enums"]["admin_role"]
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json
          entity_id: string | null
          entity_type: string
          id: number
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type: string
          id?: never
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type?: string
          id?: never
        }
        Relationships: []
      }
      comments: {
        Row: {
          author_name: string
          body: string
          created_at: string
          episode_id: string | null
          id: string
          movie_id: string | null
          status: string
        }
        Insert: {
          author_name: string
          body: string
          created_at?: string
          episode_id?: string | null
          id?: string
          movie_id?: string | null
          status?: string
        }
        Update: {
          author_name?: string
          body?: string
          created_at?: string
          episode_id?: string | null
          id?: string
          movie_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
        ]
      }
      episode_media: {
        Row: {
          episode_id: string
          kind: Database["public"]["Enums"]["media_kind"]
          media_asset_id: string
        }
        Insert: {
          episode_id: string
          kind: Database["public"]["Enums"]["media_kind"]
          media_asset_id: string
        }
        Update: {
          episode_id?: string
          kind?: Database["public"]["Enums"]["media_kind"]
          media_asset_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "episode_media_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "episode_media_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      episode_translators: {
        Row: {
          credit_order: number
          episode_id: string
          translator_id: string
        }
        Insert: {
          credit_order?: number
          episode_id: string
          translator_id: string
        }
        Update: {
          credit_order?: number
          episode_id?: string
          translator_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "episode_translators_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "episode_translators_translator_id_fkey"
            columns: ["translator_id"]
            isOneToOne: false
            referencedRelation: "translators"
            referencedColumns: ["id"]
          },
        ]
      }
      episodes: {
        Row: {
          created_at: string
          description: string
          duration_seconds: number | null
          episode_number: number
          id: string
          published_at: string | null
          season_id: string
          status: Database["public"]["Enums"]["publish_status"]
          title: string
          updated_at: string
          video_quality: string | null
        }
        Insert: {
          created_at?: string
          description?: string
          duration_seconds?: number | null
          episode_number: number
          id?: string
          published_at?: string | null
          season_id: string
          status?: Database["public"]["Enums"]["publish_status"]
          title: string
          updated_at?: string
          video_quality?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          duration_seconds?: number | null
          episode_number?: number
          id?: string
          published_at?: string | null
          season_id?: string
          status?: Database["public"]["Enums"]["publish_status"]
          title?: string
          updated_at?: string
          video_quality?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "episodes_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      genres: {
        Row: {
          id: string
          name: string
          slug: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          byte_size: number | null
          content_type: string | null
          created_at: string
          created_by: string | null
          duration_seconds: number | null
          external_url: string | null
          height: number | null
          id: string
          kind: Database["public"]["Enums"]["media_kind"]
          r2_object_key: string | null
          width: number | null
        }
        Insert: {
          byte_size?: number | null
          content_type?: string | null
          created_at?: string
          created_by?: string | null
          duration_seconds?: number | null
          external_url?: string | null
          height?: number | null
          id?: string
          kind: Database["public"]["Enums"]["media_kind"]
          r2_object_key?: string | null
          width?: number | null
        }
        Update: {
          byte_size?: number | null
          content_type?: string | null
          created_at?: string
          created_by?: string | null
          duration_seconds?: number | null
          external_url?: string | null
          height?: number | null
          id?: string
          kind?: Database["public"]["Enums"]["media_kind"]
          r2_object_key?: string | null
          width?: number | null
        }
        Relationships: []
      }
      movie_actors: {
        Row: {
          actor_id: string
          character_name: string | null
          credit_order: number
          movie_id: string
        }
        Insert: {
          actor_id: string
          character_name?: string | null
          credit_order?: number
          movie_id: string
        }
        Update: {
          actor_id?: string
          character_name?: string | null
          credit_order?: number
          movie_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "movie_actors_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "actors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movie_actors_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
        ]
      }
      movie_collections: {
        Row: {
          created_at: string
          description: string
          id: string
          slug: string
          title: string
          total_parts: number | null
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          slug: string
          title: string
          total_parts?: number | null
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          slug?: string
          title?: string
          total_parts?: number | null
        }
        Relationships: []
      }
      movie_genres: {
        Row: {
          genre_id: string
          movie_id: string
        }
        Insert: {
          genre_id: string
          movie_id: string
        }
        Update: {
          genre_id?: string
          movie_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "movie_genres_genre_id_fkey"
            columns: ["genre_id"]
            isOneToOne: false
            referencedRelation: "genres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movie_genres_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
        ]
      }
      movie_media: {
        Row: {
          kind: Database["public"]["Enums"]["media_kind"]
          media_asset_id: string
          movie_id: string
        }
        Insert: {
          kind: Database["public"]["Enums"]["media_kind"]
          media_asset_id: string
          movie_id: string
        }
        Update: {
          kind?: Database["public"]["Enums"]["media_kind"]
          media_asset_id?: string
          movie_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "movie_media_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movie_media_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
        ]
      }
      movie_parts: {
        Row: {
          collection_id: string
          movie_id: string
          part_number: number
        }
        Insert: {
          collection_id: string
          movie_id: string
          part_number: number
        }
        Update: {
          collection_id?: string
          movie_id?: string
          part_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "movie_parts_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "movie_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movie_parts_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: true
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
        ]
      }
      movie_translators: {
        Row: {
          credit_order: number
          movie_id: string
          translator_id: string
        }
        Insert: {
          credit_order?: number
          movie_id: string
          translator_id: string
        }
        Update: {
          credit_order?: number
          movie_id?: string
          translator_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "movie_translators_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movie_translators_translator_id_fkey"
            columns: ["translator_id"]
            isOneToOne: false
            referencedRelation: "translators"
            referencedColumns: ["id"]
          },
        ]
      }
      movies: {
        Row: {
          created_at: string
          description: string
          duration_seconds: number | null
          id: string
          is_featured: boolean
          is_trending: boolean
          kind: Database["public"]["Enums"]["movie_kind"]
          published_at: string | null
          release_year: number | null
          rights_holder: string | null
          rights_reference: string | null
          rights_verified_at: string | null
          slug: string
          status: Database["public"]["Enums"]["publish_status"]
          title: string
          updated_at: string
          video_quality: string | null
        }
        Insert: {
          created_at?: string
          description?: string
          duration_seconds?: number | null
          id?: string
          is_featured?: boolean
          is_trending?: boolean
          kind?: Database["public"]["Enums"]["movie_kind"]
          published_at?: string | null
          release_year?: number | null
          rights_holder?: string | null
          rights_reference?: string | null
          rights_verified_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["publish_status"]
          title: string
          updated_at?: string
          video_quality?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          duration_seconds?: number | null
          id?: string
          is_featured?: boolean
          is_trending?: boolean
          kind?: Database["public"]["Enums"]["movie_kind"]
          published_at?: string | null
          release_year?: number | null
          rights_holder?: string | null
          rights_reference?: string | null
          rights_verified_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["publish_status"]
          title?: string
          updated_at?: string
          video_quality?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          published_at: string | null
          status: Database["public"]["Enums"]["publish_status"]
          title: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          published_at?: string | null
          status?: Database["public"]["Enums"]["publish_status"]
          title: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          published_at?: string | null
          status?: Database["public"]["Enums"]["publish_status"]
          title?: string
        }
        Relationships: []
      }
      seasons: {
        Row: {
          id: string
          season_number: number
          series_id: string
          status: Database["public"]["Enums"]["publish_status"]
          title: string | null
        }
        Insert: {
          id?: string
          season_number: number
          series_id: string
          status?: Database["public"]["Enums"]["publish_status"]
          title?: string | null
        }
        Update: {
          id?: string
          season_number?: number
          series_id?: string
          status?: Database["public"]["Enums"]["publish_status"]
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seasons_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
      }
      series: {
        Row: {
          created_at: string
          description: string
          id: string
          release_year: number | null
          rights_holder: string | null
          rights_reference: string | null
          rights_verified_at: string | null
          slug: string
          status: Database["public"]["Enums"]["publish_status"]
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          release_year?: number | null
          rights_holder?: string | null
          rights_reference?: string | null
          rights_verified_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["publish_status"]
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          release_year?: number | null
          rights_holder?: string | null
          rights_reference?: string | null
          rights_verified_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["publish_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      social_links: {
        Row: {
          id: string
          is_active: boolean
          label: string
          sort_order: number
          url: string
        }
        Insert: {
          id?: string
          is_active?: boolean
          label: string
          sort_order?: number
          url: string
        }
        Update: {
          id?: string
          is_active?: boolean
          label?: string
          sort_order?: number
          url?: string
        }
        Relationships: []
      }
      translators: {
        Row: {
          biography: string
          created_at: string
          full_name: string
          id: string
          is_active: boolean
          profile_photo_url: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          biography?: string
          created_at?: string
          full_name: string
          id?: string
          is_active?: boolean
          profile_photo_url?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          biography?: string
          created_at?: string
          full_name?: string
          id?: string
          is_active?: boolean
          profile_photo_url?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      admin_role: "owner" | "content_manager" | "editor" | "moderator"
      media_kind:
        | "video"
        | "poster"
        | "backdrop"
        | "profile_photo"
        | "actor_photo"
        | "episode_thumbnail"
        | "subtitle"
      movie_kind: "standalone" | "part"
      publish_status: "draft" | "published" | "archived"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      admin_role: ["owner", "content_manager", "editor", "moderator"],
      media_kind: [
        "video",
        "poster",
        "backdrop",
        "profile_photo",
        "actor_photo",
        "episode_thumbnail",
        "subtitle",
      ],
      movie_kind: ["standalone", "part"],
      publish_status: ["draft", "published", "archived"],
    },
  },
} as const
