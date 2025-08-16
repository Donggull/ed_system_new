import { supabase } from './client'
import { Theme, ThemeData } from '@/types/database'

export async function getThemes() {
  const { data, error } = await supabase
    .from('themes')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as Theme[]
}

export async function getThemeTemplates() {
  const { data, error } = await supabase
    .from('themes')
    .select('*')
    .eq('is_template', true)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as Theme[]
}

export async function getThemeById(id: string) {
  const { data, error } = await supabase
    .from('themes')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data as Theme
}

export async function createTheme(theme: Partial<Theme>) {
  const { data, error } = await supabase
    .from('themes')
    .insert(theme)
    .select()
    .single()
  
  if (error) throw error
  return data as Theme
}

export async function updateTheme(id: string, updates: Partial<Theme>) {
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
  const { error } = await supabase
    .from('themes')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function getUserThemes(userId: string) {
  const { data, error } = await supabase
    .from('themes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as Theme[]
}

export async function getProjectThemes(projectId: string) {
  const { data, error } = await supabase
    .from('themes')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as Theme[]
}