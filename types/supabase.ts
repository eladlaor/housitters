export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      housitters: {
        Row: {
          availability: unknown | null
          created_at: string | null
          experience: number | null
          id: number
          locations: Database["public"]["CompositeTypes"]["locations"] | null
          only_paid: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          availability?: unknown | null
          created_at?: string | null
          experience?: number | null
          id?: number
          locations?: Database["public"]["CompositeTypes"]["locations"] | null
          only_paid?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          availability?: unknown | null
          created_at?: string | null
          experience?: number | null
          id?: number
          locations?: Database["public"]["CompositeTypes"]["locations"] | null
          only_paid?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
      }
      landlords: {
        Row: {
          availability: unknown | null
          location: string | null
          pets: Database["public"]["CompositeTypes"]["pets"] | null
          user_id: string
        }
        Insert: {
          availability?: unknown | null
          location?: string | null
          pets?: Database["public"]["CompositeTypes"]["pets"] | null
          user_id: string
        }
        Update: {
          availability?: unknown | null
          location?: string | null
          pets?: Database["public"]["CompositeTypes"]["pets"] | null
          user_id?: string
        }
      }
      profiles: {
        Row: {
          about_me: string | null
          avatar_url: string | null
          birthday: string | null
          first_name: string | null
          id: string
          is_public: boolean | null
          last_name: string | null
          primary_use: string | null
          social_media_url: string | null
          updated_at: string | null
          username: string | null
          visible: boolean | null
        }
        Insert: {
          about_me?: string | null
          avatar_url?: string | null
          birthday?: string | null
          first_name?: string | null
          id: string
          is_public?: boolean | null
          last_name?: string | null
          primary_use?: string | null
          social_media_url?: string | null
          updated_at?: string | null
          username?: string | null
          visible?: boolean | null
        }
        Update: {
          about_me?: string | null
          avatar_url?: string | null
          birthday?: string | null
          first_name?: string | null
          id?: string
          is_public?: boolean | null
          last_name?: string | null
          primary_use?: string | null
          social_media_url?: string | null
          updated_at?: string | null
          username?: string | null
          visible?: boolean | null
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
    CompositeTypes: {
      availability: {
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
      pets: {
        dogs: number
        cats: number
        other: string
      }
    }
  }
}
