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
      available_dates: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: string
          start_date: string | null
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id: string
          start_date?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          start_date?: string | null
        }
      }
      housitters: {
        Row: {
          availability:
            | Database["public"]["CompositeTypes"]["date_range"][]
            | null
          created_at: string | null
          experience: number | null
          id: number
          locations: string[] | null
          only_paid: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          availability?:
            | Database["public"]["CompositeTypes"]["date_range"][]
            | null
          created_at?: string | null
          experience?: number | null
          id?: number
          locations?: string[] | null
          only_paid?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          availability?:
            | Database["public"]["CompositeTypes"]["date_range"][]
            | null
          created_at?: string | null
          experience?: number | null
          id?: number
          locations?: string[] | null
          only_paid?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
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
      }
      pets: {
        Row: {
          created_at: string | null
          id: number
        }
        Insert: {
          created_at?: string | null
          id?: number
        }
        Update: {
          created_at?: string | null
          id?: number
        }
      }
      posts: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          id: string
          title: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id: string
          title?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: string
          title?: string | null
        }
      }
      profiles: {
        Row: {
          about_me: string | null
          avatar_url: string | null
          birthday: string | null
          first_name: string | null
          id: string
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
