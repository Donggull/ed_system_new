import { supabase } from './client'
import { ComponentTemplate, GeneratedComponent } from '@/types/database'

export async function getComponentTemplates() {
  if (!supabase) {
    console.warn('Supabase client not available')
    return []
  }
  
  const { data, error } = await supabase
    .from('component_templates')
    .select('*')
    .eq('is_active', true)
    .order('category', { ascending: true })
  
  if (error) throw error
  return data as ComponentTemplate[]
}

export async function getComponentTemplatesByCategory(category: string) {
  if (!supabase) {
    console.warn('Supabase client not available')
    return []
  }
  
  const { data, error } = await supabase
    .from('component_templates')
    .select('*')
    .eq('category', category)
    .eq('is_active', true)
    .order('name', { ascending: true })
  
  if (error) throw error
  return data as ComponentTemplate[]
}

export async function getGeneratedComponents(themeId: string) {
  if (!supabase) {
    console.warn('Supabase client not available')
    return []
  }
  
  const { data, error } = await supabase
    .from('generated_components')
    .select('*')
    .eq('theme_id', themeId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data as GeneratedComponent[]
}

export async function createGeneratedComponent(component: Partial<GeneratedComponent>) {
  if (!supabase) {
    console.warn('Supabase client not available')
    return null
  }
  
  const { data, error } = await supabase
    .from('generated_components')
    .insert(component)
    .select()
    .single()
  
  if (error) throw error
  return data as GeneratedComponent
}

export async function updateGeneratedComponent(id: string, updates: Partial<GeneratedComponent>) {
  if (!supabase) {
    console.warn('Supabase client not available')
    return null
  }
  
  const { data, error } = await supabase
    .from('generated_components')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as GeneratedComponent
}

export async function deleteGeneratedComponent(id: string) {
  if (!supabase) {
    console.warn('Supabase client not available')
    return
  }
  
  const { error } = await supabase
    .from('generated_components')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

export async function bulkCreateGeneratedComponents(components: Partial<GeneratedComponent>[]) {
  if (!supabase) {
    console.warn('Supabase client not available')
    return []
  }
  
  const { data, error } = await supabase
    .from('generated_components')
    .insert(components)
    .select()
  
  if (error) throw error
  return data as GeneratedComponent[]
}