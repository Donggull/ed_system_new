import { supabase } from './client'

export async function testSupabaseConnection() {
  if (!supabase) {
    return {
      success: false,
      error: 'Supabase client not initialized. Please check your environment variables.',
      details: 'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.'
    }
  }

  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('themes')
      .select('id')
      .limit(1)

    if (error) {
      return {
        success: false,
        error: 'Database connection failed',
        details: error.message
      }
    }

    // Test auth configuration
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    return {
      success: true,
      message: 'Supabase connection successful!',
      details: {
        database: 'Connected',
        auth: authError ? 'Not authenticated (normal)' : 'Authenticated',
        tablesFound: data && data.length >= 0 ? 'Yes' : 'No'
      }
    }
  } catch (error: any) {
    return {
      success: false,
      error: 'Connection test failed',
      details: error.message || 'Unknown error'
    }
  }
}

export async function getProjectInfo() {
  if (!supabase) {
    return null
  }

  try {
    const [themes, components, projects] = await Promise.all([
      supabase.from('themes').select('*', { count: 'exact', head: true }),
      supabase.from('component_templates').select('*', { count: 'exact', head: true }),
      supabase.from('projects').select('*', { count: 'exact', head: true })
    ])

    return {
      themes: themes.count || 0,
      componentTemplates: components.count || 0,
      projects: projects.count || 0
    }
  } catch {
    return null
  }
}