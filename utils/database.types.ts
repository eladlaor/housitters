export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          first_name: string | null
          last_name: string | null
          username: string | null
          primary_use: string
          secondary_use: string
          avatar_url: string | null
          birthday: Date | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          username?: string | null
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          primary_use?: string
          secondary_use?: string
          birthday?: Date | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          first_name?: string | null
          last_name?: string | null
          username?: string | null
          primary_use?: string
          secondary_use?: string
          avatar_url?: string | null
          birthday?: Date | null
        }
      }
      housitters: {
        Row: {
          user_id: any
          free_dates: any
        }
        Insert: {
          user_id: any
          free_dates: any
        }
        Update: {
          user_id: any
          free_dates: any
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
  }
}
