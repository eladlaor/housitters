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
      available_dates: {
        Row: {
          created_at: string | null
          end_date: string
          id: number
          period_index: number
          start_date: string
          user_id: string
          user_type: string | null
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: number
          period_index?: number
          start_date: string
          user_id: string
          user_type?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: number
          period_index?: number
          start_date?: string
          user_id?: string
          user_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "available_dates_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      closed_sits: {
        Row: {
          created_at: string | null
          end_date: string | null
          housitter_id: string
          id: number
          landlord_id: string
          start_date: string
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          housitter_id: string
          id?: number
          landlord_id: string
          start_date: string
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          housitter_id?: string
          id?: number
          landlord_id?: string
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "closed_sits_housitter_id_fkey"
            columns: ["housitter_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      favourites: {
        Row: {
          created_at: string | null
          favourite_user_id: string
          favourite_user_type: string | null
          id: number
          marked_by_user_id: string
        }
        Insert: {
          created_at?: string | null
          favourite_user_id: string
          favourite_user_type?: string | null
          id?: number
          marked_by_user_id: string
        }
        Update: {
          created_at?: string | null
          favourite_user_id?: string
          favourite_user_type?: string | null
          id?: number
          marked_by_user_id?: string
        }
        Relationships: []
      }
      housitters: {
        Row: {
          about_me: string | null
          created_at: string | null
          experience: number | null
          id: number
          locations: string[] | null
          only_paid: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          about_me?: string | null
          created_at?: string | null
          experience?: number | null
          id?: number
          locations?: string[] | null
          only_paid?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          about_me?: string | null
          created_at?: string | null
          experience?: number | null
          id?: number
          locations?: string[] | null
          only_paid?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "housitters_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      landlords: {
        Row: {
          favorite_sitters: string[] | null
          location: string | null
          user_id: string
        }
        Insert: {
          favorite_sitters?: string[] | null
          location?: string | null
          user_id: string
        }
        Update: {
          favorite_sitters?: string[] | null
          location?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "landlords_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          created_at: string
          housitter_id: string | null
          id: number
          is_read_by_recipient: boolean | null
          landlord_id: string | null
          message_content: string | null
          sent_by: string | null
        }
        Insert: {
          created_at?: string
          housitter_id?: string | null
          id?: number
          is_read_by_recipient?: boolean | null
          landlord_id?: string | null
          message_content?: string | null
          sent_by?: string | null
        }
        Update: {
          created_at?: string
          housitter_id?: string | null
          id?: number
          is_read_by_recipient?: boolean | null
          landlord_id?: string | null
          message_content?: string | null
          sent_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_housitter_id_fkey"
            columns: ["housitter_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_landlord_id_fkey"
            columns: ["landlord_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      pets: {
        Row: {
          cats: number | null
          created_at: string | null
          dogs: number | null
          other: string | null
          user_id: string
        }
        Insert: {
          cats?: number | null
          created_at?: string | null
          dogs?: number | null
          other?: string | null
          user_id: string
        }
        Update: {
          cats?: number | null
          created_at?: string | null
          dogs?: number | null
          other?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pets_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      posts: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          images_urls: string[] | null
          is_active: boolean
          landlord_id: string
          title: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          images_urls?: string[] | null
          is_active: boolean
          landlord_id: string
          title?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          images_urls?: string[] | null
          is_active?: boolean
          landlord_id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_landlord_id_fkey"
            columns: ["landlord_id"]
            referencedRelation: "landlords"
            referencedColumns: ["user_id"]
          }
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birthday: string | null
          email: string | null
          first_name: string | null
          gender: Database["public"]["Enums"]["gender"] | null
          id: string
          last_name: string | null
          primary_use: string | null
          social_media_url: string | null
          updated_at: string | null
          username: string | null
          visible: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          birthday?: string | null
          email?: string | null
          first_name?: string | null
          gender?: Database["public"]["Enums"]["gender"] | null
          id: string
          last_name?: string | null
          primary_use?: string | null
          social_media_url?: string | null
          updated_at?: string | null
          username?: string | null
          visible?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          birthday?: string | null
          email?: string | null
          first_name?: string | null
          gender?: Database["public"]["Enums"]["gender"] | null
          id?: string
          last_name?: string | null
          primary_use?: string | null
          social_media_url?: string | null
          updated_at?: string | null
          username?: string | null
          visible?: boolean | null
        }
        Relationships: []
      }
      reviews_on_housitters: {
        Row: {
          created_at: string | null
          description: string
          duration: number | null
          id: number
          recommended_by_user_id: string
          recommended_user_id: string
          sit_included: string
          start_month: string
        }
        Insert: {
          created_at?: string | null
          description: string
          duration?: number | null
          id?: number
          recommended_by_user_id: string
          recommended_user_id: string
          sit_included: string
          start_month: string
        }
        Update: {
          created_at?: string | null
          description?: string
          duration?: number | null
          id?: number
          recommended_by_user_id?: string
          recommended_user_id?: string
          sit_included?: string
          start_month?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_on_housitters_recommended_by_user_id_fkey"
            columns: ["recommended_by_user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      reviews_on_landlords: {
        Row: {
          created_at: string | null
          description: string
          duration: number | null
          id: number
          recommended_by_user_id: string
          recommended_user_id: string
          sit_included: string
          start_month: string
        }
        Insert: {
          created_at?: string | null
          description: string
          duration?: number | null
          id?: number
          recommended_by_user_id: string
          recommended_user_id: string
          sit_included: string
          start_month: string
        }
        Update: {
          created_at?: string | null
          description?: string
          duration?: number | null
          id?: number
          recommended_by_user_id?: string
          recommended_user_id?: string
          sit_included?: string
          start_month?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_on_landlords_recommended_by_user_id_fkey"
            columns: ["recommended_by_user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_users_view: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      gender: "male" | "female" | "non-binary" | "prefer-not-to-say" | "unknown"
    }
    CompositeTypes: {
      availability: {
        start_date: string
        end_date: string
      }
      date_range: {
        start_date: string
        end_date: string
      }
      locations: {
        north: boolean
        haifa: boolean
        pardes_hana: boolean
        hasharon: boolean
        tel_aviv: boolean
        near_ta: boolean
        rishon_ashkelon: boolean
        ashkelon_bash: boolean
        bash: boolean
        eilat: boolean
      }
    }
  }
}
