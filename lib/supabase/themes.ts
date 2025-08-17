import { supabase } from './client'
import { Theme, ThemeData, ComponentSettings } from '@/types/database'

export async function getThemes() {
  if (!supabase) {
    console.warn('Supabase client not available')
    return []
  }
  
  const { data, error } = await supabase
    .from('themes')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as Theme[]
}

export async function getThemeTemplates() {
  if (!supabase) {
    console.warn('Supabase client not available')
    return []
  }
  
  const { data, error } = await supabase
    .from('themes')
    .select('*')
    .eq('is_template', true)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as Theme[]
}

export async function getThemeById(id: string) {
  if (!supabase) {
    console.warn('Supabase client not available')
    return null
  }
  
  const { data, error } = await supabase
    .from('themes')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data as Theme
}

export async function createTheme(theme: Partial<Theme>) {
  if (!supabase) {
    console.warn('Supabase client not available')
    return null
  }
  
  const { data, error } = await supabase
    .from('themes')
    .insert(theme)
    .select()
    .single()
  
  if (error) throw error
  return data as Theme
}

export async function saveTheme(theme: {
  name: string
  theme_data: ThemeData
  selected_components?: string[]
  component_settings?: ComponentSettings
  user_id?: string
  project_id?: string
  is_template?: boolean
}): Promise<{ data: Theme | null; error: string | null }> {
  try {
    if (!supabase) {
      return { data: null, error: 'Supabase client not available' }
    }

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { data: null, error: '사용자 인증이 필요합니다.' }
    }

    const themeToSave = {
      name: theme.name,
      theme_data: theme.theme_data,
      selected_components: theme.selected_components || [],
      component_settings: theme.component_settings || {},
      user_id: user.id,
      project_id: theme.project_id || null,
      is_template: theme.is_template || false,
      is_active: true,
      version: 1
    }

    const { data, error } = await supabase
      .from('themes')
      .insert([themeToSave])
      .select()
      .single()

    if (error) {
      console.error('Error saving theme:', error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Error in saveTheme:', err)
    return { data: null, error: '테마 저장 중 오류가 발생했습니다.' }
  }
}

export async function updateTheme(id: string, updates: Partial<Theme>) {
  if (!supabase) {
    console.warn('Supabase client not available')
    return null
  }
  
  const { data, error } = await supabase
    .from('themes')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as Theme
}

export async function deleteTheme(id: string) {
  if (!supabase) {
    console.warn('Supabase client not available')
    return
  }
  
  const { error } = await supabase
    .from('themes')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function getUserThemes(userId: string) {
  if (!supabase) {
    console.warn('Supabase client not available')
    return []
  }
  
  const { data, error } = await supabase
    .from('themes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as Theme[]
}

export async function getProjectThemes(projectId: string) {
  if (!supabase) {
    console.warn('Supabase client not available')
    return []
  }
  
  const { data, error } = await supabase
    .from('themes')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as Theme[]
}