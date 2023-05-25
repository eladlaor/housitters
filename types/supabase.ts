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
      }
      housitters: {
        Row: {
          created_at: string | null
          experience: number | null
          id: number
          locations: string[] | null
          only_paid: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          experience?: number | null
          id?: number
          locations?: string[] | null
          only_paid?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          experience?: number | null
          id?: number
          locations?: string[] | null
          only_paid?: boolean | null
          updated_at?: string | null
          user_id?: string
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
      recommendations: {
        Row: {
          created_at: string | null
          description: string
          duration: number | null
          id: number
          recommended_by: string
          recommended_user_id: string
          recommended_user_type: string
          sit_included: string
          start_month: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          duration?: number | null
          id?: number
          recommended_by: string
          recommended_user_id: string
          recommended_user_type: string
          sit_included: string
          start_month?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          duration?: number | null
          id?: number
          recommended_by?: string
          recommended_user_id?: string
          recommended_user_type?: string
          sit_included?: string
          start_month?: string | null
        }
      }
    }
    Views: {
      users: {
        Row: {
          aud: string | null
          banned_until: string | null
          confirmation_sent_at: string | null
          confirmation_token: string | null
          confirmed_at: string | null
          created_at: string | null
          deleted_at: string | null
          email: string | null
          email_change: string | null
          email_change_confirm_status: number | null
          email_change_sent_at: string | null
          email_change_token_current: string | null
          email_change_token_new: string | null
          email_confirmed_at: string | null
          encrypted_password: string | null
          id: string | null
          instance_id: string | null
          invited_at: string | null
          is_sso_user: boolean | null
          is_super_admin: boolean | null
          last_sign_in_at: string | null
          phone: string | null
          phone_change: string | null
          phone_change_sent_at: string | null
          phone_change_token: string | null
          phone_confirmed_at: string | null
          raw_app_meta_data: Json | null
          raw_user_meta_data: Json | null
          reauthentication_sent_at: string | null
          reauthentication_token: string | null
          recovery_sent_at: string | null
          recovery_token: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          aud?: string | null
          banned_until?: string | null
          confirmation_sent_at?: string | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          email_change?: string | null
          email_change_confirm_status?: number | null
          email_change_sent_at?: string | null
          email_change_token_current?: string | null
          email_change_token_new?: string | null
          email_confirmed_at?: string | null
          encrypted_password?: string | null
          id?: string | null
          instance_id?: string | null
          invited_at?: string | null
          is_sso_user?: boolean | null
          is_super_admin?: boolean | null
          last_sign_in_at?: string | null
          phone?: string | null
          phone_change?: string | null
          phone_change_sent_at?: string | null
          phone_change_token?: string | null
          phone_confirmed_at?: string | null
          raw_app_meta_data?: Json | null
          raw_user_meta_data?: Json | null
          reauthentication_sent_at?: string | null
          reauthentication_token?: string | null
          recovery_sent_at?: string | null
          recovery_token?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          aud?: string | null
          banned_until?: string | null
          confirmation_sent_at?: string | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          email_change?: string | null
          email_change_confirm_status?: number | null
          email_change_sent_at?: string | null
          email_change_token_current?: string | null
          email_change_token_new?: string | null
          email_confirmed_at?: string | null
          encrypted_password?: string | null
          id?: string | null
          instance_id?: string | null
          invited_at?: string | null
          is_sso_user?: boolean | null
          is_super_admin?: boolean | null
          last_sign_in_at?: string | null
          phone?: string | null
          phone_change?: string | null
          phone_change_sent_at?: string | null
          phone_change_token?: string | null
          phone_confirmed_at?: string | null
          raw_app_meta_data?: Json | null
          raw_user_meta_data?: Json | null
          reauthentication_sent_at?: string | null
          reauthentication_token?: string | null
          recovery_sent_at?: string | null
          recovery_token?: string | null
          role?: string | null
          updated_at?: string | null
        }
      }
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
