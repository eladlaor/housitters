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
          birthday: Date | string | null
          visible: boolean
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
          birthday?: Date | string | null
          visible?: boolean
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
          birthday?: Date | string | null
          visible?: boolean
        }
      }
      housitters: {
        Row: {
          availability: string | null
        }
        Insert: {
          availability: string | null
        }
        Update: {
          availability: string | null
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
