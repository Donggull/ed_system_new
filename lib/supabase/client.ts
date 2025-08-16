import { createClient } from '@supabase/supabase-js'

// Get environment variables with debugging
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Debug environment variables in development
if (process.env.NODE_ENV === 'development') {
  console.log('🔍 Supabase Client Debug:')
  console.log('  URL:', supabaseUrl ? `${supabaseUrl.slice(0, 30)}...` : 'NOT SET')
  console.log('  Key:', supabaseAnonKey ? `${supabaseAnonKey.slice(0, 20)}...` : 'NOT SET')
}

// Validate environment variables
const isValidUrl = (url: string) => {
  if (!url) return false
  try {
    new URL(url)
    return url.includes('supabase.co') || url.includes('localhost')
  } catch {
    return false
  }
}

const isValidKey = (key: string) => {
  return key && key.length > 20 && !key.includes('your_') && !key.includes('your-') && !key.includes('here')
}

// Create Supabase client or return null if environment variables are invalid
const createSupabaseClient = () => {
  // Check if running in browser environment
  if (typeof window === 'undefined') {
    // Server-side: only proceed if we have valid environment variables
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('🔸 Supabase: Environment variables not available on server side')
      return null
    }
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('🔸 Supabase: Environment variables not found. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
    return null
  }

  if (!isValidUrl(supabaseUrl) || !isValidKey(supabaseAnonKey)) {
    console.warn('🔸 Supabase: Environment variables appear to be placeholder values. Please configure with actual Supabase credentials.')
    console.warn('  Expected URL format: https://your-project.supabase.co')
    console.warn('  Expected key length: > 20 characters')
    return null
  }

  try {
    const client = createClient(supabaseUrl, supabaseAnonKey)
    console.log('✅ Supabase client created successfully')
    return client
  } catch (error) {
    console.error('❌ Failed to create Supabase client:', error)
    return null
  }
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