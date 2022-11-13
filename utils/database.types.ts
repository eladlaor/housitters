export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export enum UserType {
  HouseOwner,
  Housitter
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          username: string | null
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
          primary_use: UserType | null // TODO: type this to userType
          secondary_use: UserType | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          username?: string | null
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          primary_use?: string | null
          secondary_use?: string | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          username?: string | null
          first_name?: string | null
          last_name?: string | null          
          avatar_url?: string | null
          primary_use?: string | null
          secondary_use?: string | null
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

