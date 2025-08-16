import { createClient } from '@supabase/supabase-js'

// Get environment variables with debugging
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Enhanced debugging for all environments
console.log('🔍 Supabase Client Environment Debug:')
console.log('  NODE_ENV:', process.env.NODE_ENV)
console.log('  VERCEL_ENV:', process.env.VERCEL_ENV)
console.log('  URL exists:', !!supabaseUrl)
console.log('  URL value:', supabaseUrl ? `${supabaseUrl.slice(0, 30)}...` : 'NOT SET')
console.log('  Key exists:', !!supabaseAnonKey)
console.log('  Key value:', supabaseAnonKey ? `${supabaseAnonKey.slice(0, 20)}...` : 'NOT SET')
console.log('  All env vars:', Object.keys(process.env).filter(key => key.includes('SUPABASE')))

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
  // Enhanced environment variable detection
  let finalUrl = supabaseUrl
  let finalKey = supabaseAnonKey
  
  // Fallback for Vercel environment - try to get from window or runtime
  if (typeof window !== 'undefined' && (!finalUrl || !finalKey)) {
    // Try to get from runtime environment in browser
    const runtimeConfig = (window as any).__RUNTIME_CONFIG__ || {}
    finalUrl = finalUrl || runtimeConfig.NEXT_PUBLIC_SUPABASE_URL
    finalKey = finalKey || runtimeConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY
  }
  
  // Additional logging for debugging
  console.log('🔧 Final environment check:')
  console.log('  Final URL:', finalUrl ? 'SET' : 'NOT SET')
  console.log('  Final Key:', finalKey ? 'SET' : 'NOT SET')
  
  if (!finalUrl || !finalKey) {
    console.error('❌ Supabase: Environment variables not found!')
    console.error('  Expected: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
    console.error('  Current URL:', finalUrl || 'undefined')
    console.error('  Current Key:', finalKey ? 'exists' : 'undefined')
    
    // In production, try hardcoded values as last resort
    if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV) {
      console.warn('🔄 Production fallback: Using hardcoded credentials')
      finalUrl = 'https://nktjoldoylvwtkzboyaf.supabase.co'
      finalKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rdGpvbGRveWx2d3RremJveWFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNDUyODUsImV4cCI6MjA3MDcyMTI4NX0.ZGX25pgubs4PD8H8zY5wUi5cEKL500fiLjp1TY5PPyo'
    } else {
      return null
    }
  }

  if (!isValidUrl(finalUrl) || !isValidKey(finalKey)) {
    console.warn('🔸 Supabase: Environment variables appear to be invalid')
    console.warn('  URL format check:', isValidUrl(finalUrl))
    console.warn('  Key format check:', isValidKey(finalKey))
    console.warn('  Expected URL format: https://your-project.supabase.co')
    console.warn('  Expected key length: > 20 characters')
    return null
  }

  try {
    const client = createClient(finalUrl, finalKey)
    console.log('✅ Supabase client created successfully')
    console.log('  URL:', `${finalUrl.slice(0, 30)}...`)
    console.log('  Environment:', process.env.NODE_ENV || 'unknown')
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