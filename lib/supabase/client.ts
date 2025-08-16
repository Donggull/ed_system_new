import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create a mock client if environment variables are not available
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables not found. Using mock client.')
    return null
  }
  return createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = createSupabaseClient()

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          plan_type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          plan_type?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          plan_type?: string
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      themes: {
        Row: {
          id: string
          project_id: string | null
          user_id: string | null
          name: string
          theme_data: any
          version: number
          is_template: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id?: string | null
          user_id?: string | null
          name: string
          theme_data: any
          version?: number
          is_template?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string | null
          user_id?: string | null
          name?: string
          theme_data?: any
          version?: number
          is_template?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      component_templates: {
        Row: {
          id: string
          name: string
          category: string
          template_code: string
          props_schema: any
          description: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          template_code: string
          props_schema: any
          description?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          template_code?: string
          props_schema?: any
          description?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      generated_components: {
        Row: {
          id: string
          theme_id: string
          component_type: string
          component_name: string
          component_code: string
          props_schema: any | null
          is_selected: boolean
          created_at: string
        }
        Insert: {
          id?: string
          theme_id: string
          component_type: string
          component_name: string
          component_code: string
          props_schema?: any | null
          is_selected?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          theme_id?: string
          component_type?: string
          component_name?: string
          component_code?: string
          props_schema?: any | null
          is_selected?: boolean
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
  }
}