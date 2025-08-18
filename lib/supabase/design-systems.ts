import { supabase } from '@/lib/supabase/client'
import { 
  DesignSystem, 
  DesignSystemVersion, 
  SharedDesignSystem, 
  UserFavorite, 
  DesignSystemLike,
  DesignSystemComment,
  ThemeData,
  ComponentSettings 
} from '@/types/database'

// supabase is already imported from the client

// Design System CRUD Operations
export async function saveDesignSystem({
  name,
  description,
  theme_data,
  selected_components,
  component_settings,
  tags = [],
  is_public = false
}: {
  name: string
  description?: string
  theme_data: ThemeData
  selected_components: string[]
  component_settings?: ComponentSettings
  tags?: string[]
  is_public?: boolean
}): Promise<{ data: DesignSystem | null; error: any }> {
  if (!supabase) {
    return { data: null, error: 'Supabase client not available' }
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'User not authenticated' }
  }

  // Generate share token for potential sharing
  const share_token = Math.random().toString(36).substr(2, 10)

  const { data, error } = await supabase
    .from('design_systems')
    .insert({
      name,
      description,
      theme_data,
      selected_components,
      component_settings,
      tags,
      is_public,
      share_token,
      version: 1,
      user_id: user.id
    })
    .select()
    .single()

  return { data, error }
}

export async function updateDesignSystem(
  id: string,
  updates: Partial<DesignSystem>
): Promise<{ data: DesignSystem | null; error: any }> {
  if (!supabase) {
    return { data: null, error: 'Supabase client not available' }
  }

  const { data, error } = await supabase
    .from('design_systems')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  return { data, error }
}

export async function getDesignSystem(id: string): Promise<{ data: DesignSystem | null; error: any }> {
  if (!supabase) {
    return { data: null, error: 'Supabase client not available' }
  }

  const { data, error } = await supabase
    .from('design_systems')
    .select()
    .eq('id', id)
    .single()

  return { data, error }
}

export async function deleteDesignSystem(id: string): Promise<{ error: any }> {
  if (!supabase) {
    return { error: 'Supabase client not available' }
  }

  const { error } = await supabase
    .from('design_systems')
    .delete()
    .eq('id', id)

  return { error }
}

// Get user's design systems
export async function getUserDesignSystems(
  userId?: string,
  limit: number = 50,
  offset: number = 0
): Promise<{ data: DesignSystem[] | null; error: any }> {
  if (!supabase) {
    return { data: null, error: 'Supabase client not available' }
  }

  let query = supabase
    .from('design_systems')
    .select()
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query

  return { data, error }
}

// Get public design systems (discovery page)
export async function getPublicDesignSystems(
  {
    limit = 20,
    offset = 0,
    tags = [],
    category,
    sortBy = 'created_at',
    sortOrder = 'desc',
    searchQuery
  }: {
    limit?: number
    offset?: number
    tags?: string[]
    category?: string
    sortBy?: 'created_at' | 'like_count' | 'download_count' | 'view_count'
    sortOrder?: 'asc' | 'desc'
    searchQuery?: string
  } = {}
): Promise<{ data: DesignSystem[] | null; error: any }> {
  if (!supabase) {
    return { data: null, error: 'Supabase client not available' }
  }

  let query = supabase
    .from('design_systems')
    .select(`
      *,
      profiles:user_id (
        full_name,
        avatar_url
      )
    `)
    .eq('is_public', true)
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(offset, offset + limit - 1)

  // Apply filters
  if (tags.length > 0) {
    query = query.overlaps('tags', tags)
  }

  if (searchQuery) {
    query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
  }

  const { data, error } = await query

  return { data, error }
}

// Design System Versions
export async function createDesignSystemVersion({
  design_system_id,
  theme_data,
  selected_components,
  component_settings,
  change_notes
}: {
  design_system_id: string
  theme_data: ThemeData
  selected_components: string[]
  component_settings?: ComponentSettings
  change_notes?: string
}): Promise<{ data: DesignSystemVersion | null; error: any }> {
  if (!supabase) {
    return { data: null, error: 'Supabase client not available' }
  }

  // Get current version number
  const { data: currentSystem } = await supabase
    .from('design_systems')
    .select('version, name')
    .eq('id', design_system_id)
    .single()

  if (!currentSystem) {
    return { data: null, error: 'Design system not found' }
  }

  const newVersion = currentSystem.version + 1

  // Create version record
  const { data: versionData, error: versionError } = await supabase
    .from('design_system_versions')
    .insert({
      design_system_id,
      version_number: newVersion,
      name: currentSystem.name,
      theme_data,
      selected_components,
      component_settings,
      change_notes
    })
    .select()
    .single()

  if (versionError) {
    return { data: null, error: versionError }
  }

  // Update main design system version
  const { error: updateError } = await supabase
    .from('design_systems')
    .update({
      version: newVersion,
      theme_data,
      selected_components,
      component_settings,
      updated_at: new Date().toISOString()
    })
    .eq('id', design_system_id)

  if (updateError) {
    return { data: null, error: updateError }
  }

  return { data: versionData, error: null }
}

export async function getDesignSystemVersions(
  design_system_id: string
): Promise<{ data: DesignSystemVersion[] | null; error: any }> {
  if (!supabase) {
    return { data: null, error: 'Supabase client not available' }
  }

  const { data, error } = await supabase
    .from('design_system_versions')
    .select()
    .eq('design_system_id', design_system_id)
    .order('version_number', { ascending: false })

  return { data, error }
}

// Sharing functionality
export async function shareDesignSystem({
  design_system_id,
  permission_level = 'view',
  is_public = false,
  expires_at
}: {
  design_system_id: string
  permission_level?: 'view' | 'edit' | 'clone'
  is_public?: boolean
  expires_at?: string
}): Promise<{ data: SharedDesignSystem | null; error: any }> {
  if (!supabase) {
    return { data: null, error: 'Supabase client not available' }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'User not authenticated' }
  }

  // Generate unique share token
  const share_token = Math.random().toString(36).substr(2, 16)

  const { data, error } = await supabase
    .from('shared_design_systems')
    .insert({
      design_system_id,
      shared_by_user_id: user.id,
      share_token,
      permission_level,
      is_public,
      expires_at
    })
    .select()
    .single()

  // Update the main design system's share token
  if (!error) {
    await supabase
      .from('design_systems')
      .update({ share_token, is_public })
      .eq('id', design_system_id)
  }

  return { data, error }
}

export async function getSharedDesignSystem(
  share_token: string
): Promise<{ data: any; error: any }> {
  if (!supabase) {
    return { data: null, error: 'Supabase client not available' }
  }

  const { data, error } = await supabase
    .from('shared_design_systems')
    .select(`
      *,
      design_system:design_systems(*),
      shared_by:shared_by_user_id(full_name, avatar_url)
    `)
    .eq('share_token', share_token)
    .single()

  if (!error && data) {
    // Increment access count
    await supabase
      .from('shared_design_systems')
      .update({ access_count: data.access_count + 1 })
      .eq('id', data.id)
  }

  return { data, error }
}

// Favorites
export async function toggleFavorite(
  design_system_id: string
): Promise<{ data: any; error: any }> {
  if (!supabase) {
    return { data: null, error: 'Supabase client not available' }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'User not authenticated' }
  }

  // Check if already favorited
  const { data: existing } = await supabase
    .from('user_favorites')
    .select()
    .eq('user_id', user.id)
    .eq('design_system_id', design_system_id)
    .single()

  if (existing) {
    // Remove favorite
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('id', existing.id)
    
    return { data: { favorited: false }, error }
  } else {
    // Add favorite
    const { data, error } = await supabase
      .from('user_favorites')
      .insert({
        user_id: user.id,
        design_system_id
      })
      .select()
      .single()
    
    return { data: { favorited: true, ...data }, error }
  }
}

export async function getUserFavorites(
  limit: number = 50,
  offset: number = 0
): Promise<{ data: any[] | null; error: any }> {
  if (!supabase) {
    return { data: null, error: 'Supabase client not available' }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'User not authenticated' }
  }

  const { data, error } = await supabase
    .from('user_favorites')
    .select(`
      *,
      design_system:design_systems(*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  return { data, error }
}

// Likes
export async function toggleLike(
  design_system_id: string
): Promise<{ data: any; error: any }> {
  if (!supabase) {
    return { data: null, error: 'Supabase client not available' }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'User not authenticated' }
  }

  // Check if already liked
  const { data: existing } = await supabase
    .from('design_system_likes')
    .select()
    .eq('user_id', user.id)
    .eq('design_system_id', design_system_id)
    .single()

  if (existing) {
    // Remove like
    const { error } = await supabase
      .from('design_system_likes')
      .delete()
      .eq('id', existing.id)

    if (!error) {
      // Decrease like count
      await supabase.rpc('decrement_like_count', { design_system_id })
    }
    
    return { data: { liked: false }, error }
  } else {
    // Add like
    const { data, error } = await supabase
      .from('design_system_likes')
      .insert({
        user_id: user.id,
        design_system_id
      })
      .select()
      .single()

    if (!error) {
      // Increase like count
      await supabase.rpc('increment_like_count', { design_system_id })
    }
    
    return { data: { liked: true, ...data }, error }
  }
}

// Utility functions for counters
export async function incrementViewCount(design_system_id: string): Promise<void> {
  if (!supabase) return

  await supabase.rpc('increment_view_count', { design_system_id })
}

export async function incrementDownloadCount(design_system_id: string): Promise<void> {
  if (!supabase) return

  await supabase.rpc('increment_download_count', { design_system_id })
}

// Get design system stats
export async function getDesignSystemStats(
  design_system_id: string
): Promise<{ data: any; error: any }> {
  if (!supabase) {
    return { data: null, error: 'Supabase client not available' }
  }

  const { data, error } = await supabase
    .from('design_systems')
    .select('like_count, download_count, view_count')
    .eq('id', design_system_id)
    .single()

  return { data, error }
}