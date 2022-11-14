export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export enum UserType {
  HouseOwner,
  Housitter,
  None
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
          primary_use: UserType // TODO: type this to userType
          secondary_use: UserType
        }
        Insert: {
          id: string
          updated_at?: string | null
          username?: string | null
          first_name?: string | null
          last_name?: string | null
          avatar_url?: string | null
          primary_use?: UserType
          secondary_use?: UserType
        }
        Update: {
          id?: string
          updated_at?: string | null
          username?: string | null
          first_name?: string | null
          last_name?: string | null          
          avatar_url?: string | null
          primary_use?: UserType
          secondary_use?: UserType
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

