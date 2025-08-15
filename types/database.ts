// types/database.ts - Generated Supabase types
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
      profiles: {
        Row: {
          id: string
          username: string
          avatar_emoji: string
          region: string
          points: number
          streak_days: number
          badges: Json
          alert_preferences: Json
          feature_flags: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username: string
          avatar_emoji?: string
          region?: string
          points?: number
          streak_days?: number
          badges?: Json
          alert_preferences?: Json
          feature_flags?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          avatar_emoji?: string
          region?: string
          points?: number
          streak_days?: number
          badges?: Json
          alert_preferences?: Json
          feature_flags?: Json
          created_at?: string
          updated_at?: string
        }
      }
      sensor_readings: {
        Row: {
          id: string
          timestamp: string
          temperature: number
          ph_level: number
          dissolved_oxygen: number
          turbidity: number
          e_coli: number
          total_coliform: number
          bacteria_atp: number
          latitude: number | null
          longitude: number | null
          location_name: string | null
          is_anomaly: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          timestamp?: string
          temperature: number
          ph_level: number
          dissolved_oxygen: number
          turbidity: number
          e_coli?: number
          total_coliform?: number
          bacteria_atp?: number
          latitude?: number | null
          longitude?: number | null
          location_name?: string | null
          is_anomaly?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          timestamp?: string
          temperature?: number
          ph_level?: number
          dissolved_oxygen?: number
          turbidity?: number
          e_coli?: number
          total_coliform?: number
          bacteria_atp?: number
          latitude?: number | null
          longitude?: number | null
          location_name?: string | null
          is_anomaly?: boolean | null
          created_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          user_id: string | null
          timestamp: string
          title: string
          description: string
          location: string | null
          latitude: number | null
          longitude: number | null
          images: Json | null
          status: string
          verifications: Json | null
          reactions: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          timestamp?: string
          title: string
          description: string
          location?: string | null
          latitude?: number | null
          longitude?: number | null
          images?: Json | null
          status?: string
          verifications?: Json | null
          reactions?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          timestamp?: string
          title?: string
          description?: string
          location?: string | null
          latitude?: number | null
          longitude?: number | null
          images?: Json | null
          status?: string
          verifications?: Json | null
          reactions?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      quiz_attempts: {
        Row: {
          id: string
          user_id: string
          date: string
          correct: number
          total: number
          questions_answered: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date?: string
          correct: number
          total: number
          questions_answered?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          correct?: number
          total?: number
          questions_answered?: Json
          created_at?: string
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
      [_ in never]: never
    }
  }
}