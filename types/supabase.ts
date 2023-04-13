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
          end_date: string
          id: number
          start_date: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          end_date: string
          id?: number
          start_date: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string
          id?: number
          start_date?: string
          user_id?: string | null
        }
      }
      housitters: {
        Row: {
          created_at: string | null
          experience: number | null
          id: number
          locations: string[] | null
          only_paid: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          experience?: number | null
          id?: number
          locations?: string[] | null
          only_paid?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
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
      }
      posts: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          end_date: string | null
          start_date: string | null
          title: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          start_date?: string | null
          title?: string | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          start_date?: string | null
          title?: string | null
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
