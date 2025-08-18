import { useState, useCallback } from 'react'
import { 
  DesignSystem, 
  DesignSystemVersion, 
  ThemeData, 
  ComponentSettings 
} from '@/types/database'
import {
  saveDesignSystem,
  updateDesignSystem,
  getDesignSystem,
  deleteDesignSystem,
  getUserDesignSystems,
  createDesignSystemVersion,
  getDesignSystemVersions,
  shareDesignSystem,
  getSharedDesignSystem,
  toggleFavorite,
  toggleLike,
  incrementViewCount,
  incrementDownloadCount,
  getUserFavorites,
  getPublicDesignSystems
} from '@/lib/supabase/design-systems'

export interface SaveDesignSystemData {
  name: string
  description?: string
  theme_data: ThemeData
  selected_components: string[]
  component_settings?: ComponentSettings
  tags?: string[]
  is_public?: boolean
}

export interface ShareDesignSystemData {
  design_system_id: string
  permission_level?: 'view' | 'edit' | 'clone'
  is_public?: boolean
  expires_at?: string
}

export interface DesignSystemFilters {
  limit?: number
  offset?: number
  tags?: string[]
  category?: string
  sortBy?: 'created_at' | 'like_count' | 'download_count' | 'view_count'
  sortOrder?: 'asc' | 'desc'
  searchQuery?: string
}

export function useDesignSystem() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [designSystems, setDesignSystems] = useState<DesignSystem[]>([])
  const [currentDesignSystem, setCurrentDesignSystem] = useState<DesignSystem | null>(null)

  const handleError = useCallback((error: any) => {
    const message = error?.message || 'An unexpected error occurred'
    setError(message)
    console.error('Design System Error:', error)
  }, [])

  // Save new design system
  const save = useCallback(async (data: SaveDesignSystemData) => {
    setIsLoading(true)
    setError(null)

    try {
      const { data: result, error } = await saveDesignSystem(data)
      
      if (error) {
        handleError(error)
        return null
      }

      if (result) {
        setDesignSystems(prev => [result, ...prev])
        setCurrentDesignSystem(result)
      }

      return result
    } catch (err) {
      handleError(err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [handleError])

  // Update existing design system
  const update = useCallback(async (id: string, updates: Partial<DesignSystem>) => {
    setIsLoading(true)
    setError(null)

    try {
      const { data: result, error } = await updateDesignSystem(id, updates)
      
      if (error) {
        handleError(error)
        return null
      }

      if (result) {
        setDesignSystems(prev => 
          prev.map(ds => ds.id === id ? result : ds)
        )
        if (currentDesignSystem?.id === id) {
          setCurrentDesignSystem(result)
        }
      }

      return result
    } catch (err) {
      handleError(err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [handleError, currentDesignSystem])

  // Load design system
  const load = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const { data: result, error } = await getDesignSystem(id)
      
      if (error) {
        handleError(error)
        return null
      }

      if (result) {
        setCurrentDesignSystem(result)
        // Increment view count
        incrementViewCount(id)
      }

      return result
    } catch (err) {
      handleError(err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [handleError])

  // Delete design system
  const remove = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await deleteDesignSystem(id)
      
      if (error) {
        handleError(error)
        return false
      }

      setDesignSystems(prev => prev.filter(ds => ds.id !== id))
      if (currentDesignSystem?.id === id) {
        setCurrentDesignSystem(null)
      }

      return true
    } catch (err) {
      handleError(err)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [handleError, currentDesignSystem])

  // Load user's design systems
  const loadUserDesignSystems = useCallback(async (userId?: string, limit = 50, offset = 0, retryCount = 0) => {
    console.log(`🔄 loadUserDesignSystems called: userId=${userId}, limit=${limit}, offset=${offset}, retry=${retryCount}`)
    
    setIsLoading(true)
    setError(null)

    try {
      console.log('Calling getUserDesignSystems from database layer...')
      const { data: result, error } = await getUserDesignSystems(userId, limit, offset)
      
      console.log('Database response:', { 
        hasData: !!result, 
        dataLength: result?.length || 0, 
        hasError: !!error,
        errorMessage: error?.message 
      })
      
      if (error) {
        console.error('❌ Database error loading design systems:', error)
        handleError(error)
        
        // Retry logic for transient errors
        if (retryCount < 2 && error.message?.includes('network')) {
          console.log(`🔄 Retrying due to network error (attempt ${retryCount + 1}/3)`)
          await new Promise(resolve => setTimeout(resolve, 1000))
          return loadUserDesignSystems(userId, limit, offset, retryCount + 1)
        }
        
        return []
      }

      const systems = result || []
      console.log(`✅ Successfully loaded ${systems.length} design systems:`, 
        systems.map(s => ({ id: s.id, name: s.name, user_id: s.user_id })))
      
      if (offset === 0) {
        console.log('🔄 Setting design systems (fresh load)', systems)
        
        // Force state update with callback to ensure it's applied
        setDesignSystems(() => {
          console.log('🔄 State setter callback executed with systems:', systems.length)
          return [...systems] // Create new array reference to ensure re-render
        })
        
        // Double-check after state update
        setTimeout(() => {
          console.log('🔄 Post-setState verification: systems count should be', systems.length)
        }, 10)
      } else {
        console.log('🔄 Appending design systems (pagination)')
        setDesignSystems(prev => {
          const updated = [...prev, ...systems]
          console.log('🔄 Pagination state update:', prev.length, '->', updated.length)
          return updated
        })
      }

      // Additional state verification
      setTimeout(() => {
        console.log('🔄 Final verification - systems loaded:', systems.length)
      }, 100)

      return systems
    } catch (err) {
      console.error('💥 Exception loading design systems:', err)
      handleError(err)
      
      // Retry logic for exceptions too
      if (retryCount < 2) {
        console.log(`🔄 Retrying due to exception (attempt ${retryCount + 1}/3)`)
        await new Promise(resolve => setTimeout(resolve, 1000))
        return loadUserDesignSystems(userId, limit, offset, retryCount + 1)
      }
      
      return []
    } finally {
      setIsLoading(false)
      console.log('🏁 loadUserDesignSystems completed, isLoading set to false')
    }
  }, [handleError])

  // Load public design systems (for discovery)
  const loadPublicDesignSystems = useCallback(async (filters: DesignSystemFilters = {}) => {
    setIsLoading(true)
    setError(null)

    try {
      const { data: result, error } = await getPublicDesignSystems(filters)
      
      if (error) {
        handleError(error)
        return []
      }

      const systems = result || []
      if (filters.offset === 0) {
        setDesignSystems(systems)
      } else {
        setDesignSystems(prev => [...prev, ...systems])
      }

      return systems
    } catch (err) {
      handleError(err)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [handleError])

  // Create version
  const createVersion = useCallback(async (
    design_system_id: string,
    theme_data: ThemeData,
    selected_components: string[],
    component_settings?: ComponentSettings,
    change_notes?: string
  ) => {
    setIsLoading(true)
    setError(null)

    try {
      const { data: result, error } = await createDesignSystemVersion({
        design_system_id,
        theme_data,
        selected_components,
        component_settings,
        change_notes
      })
      
      if (error) {
        handleError(error)
        return null
      }

      return result
    } catch (err) {
      handleError(err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [handleError])

  // Get versions
  const loadVersions = useCallback(async (design_system_id: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const { data: result, error } = await getDesignSystemVersions(design_system_id)
      
      if (error) {
        handleError(error)
        return []
      }

      return result || []
    } catch (err) {
      handleError(err)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [handleError])

  // Share design system
  const share = useCallback(async (data: ShareDesignSystemData) => {
    setIsLoading(true)
    setError(null)

    try {
      const { data: result, error } = await shareDesignSystem(data)
      
      if (error) {
        handleError(error)
        return null
      }

      return result
    } catch (err) {
      handleError(err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [handleError])

  // Load shared design system
  const loadSharedDesignSystem = useCallback(async (shareToken: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const { data: result, error } = await getSharedDesignSystem(shareToken)
      
      if (error) {
        handleError(error)
        return null
      }

      if (result?.design_system) {
        setCurrentDesignSystem(result.design_system)
      }

      return result
    } catch (err) {
      handleError(err)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [handleError])

  // Toggle favorite
  const favorite = useCallback(async (design_system_id: string) => {
    try {
      const { data: result, error } = await toggleFavorite(design_system_id)
      
      if (error) {
        handleError(error)
        return null
      }

      return result
    } catch (err) {
      handleError(err)
      return null
    }
  }, [handleError])

  // Toggle like
  const like = useCallback(async (design_system_id: string) => {
    try {
      const { data: result, error } = await toggleLike(design_system_id)
      
      if (error) {
        handleError(error)
        return null
      }

      // Update local state
      setDesignSystems(prev =>
        prev.map(ds =>
          ds.id === design_system_id
            ? { 
                ...ds, 
                like_count: result?.liked 
                  ? ds.like_count + 1 
                  : Math.max(ds.like_count - 1, 0)
              }
            : ds
        )
      )

      if (currentDesignSystem?.id === design_system_id) {
        setCurrentDesignSystem(prev => prev ? {
          ...prev,
          like_count: result?.liked 
            ? prev.like_count + 1 
            : Math.max(prev.like_count - 1, 0)
        } : prev)
      }

      return result
    } catch (err) {
      handleError(err)
      return null
    }
  }, [handleError, currentDesignSystem])

  // Load user favorites
  const loadFavorites = useCallback(async (limit = 50, offset = 0) => {
    setIsLoading(true)
    setError(null)

    try {
      const { data: result, error } = await getUserFavorites(limit, offset)
      
      if (error) {
        handleError(error)
        return []
      }

      const favorites = result || []
      const systems = favorites.map(fav => fav.design_system).filter(Boolean)
      
      if (offset === 0) {
        setDesignSystems(systems)
      } else {
        setDesignSystems(prev => [...prev, ...systems])
      }

      return favorites
    } catch (err) {
      handleError(err)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [handleError])

  // Track download
  const trackDownload = useCallback(async (design_system_id: string) => {
    try {
      await incrementDownloadCount(design_system_id)
      
      // Update local state
      setDesignSystems(prev =>
        prev.map(ds =>
          ds.id === design_system_id
            ? { ...ds, download_count: ds.download_count + 1 }
            : ds
        )
      )

      if (currentDesignSystem?.id === design_system_id) {
        setCurrentDesignSystem(prev => prev ? {
          ...prev,
          download_count: prev.download_count + 1
        } : prev)
      }
    } catch (err) {
      handleError(err)
    }
  }, [handleError, currentDesignSystem])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    // State
    isLoading,
    error,
    designSystems,
    currentDesignSystem,

    // Actions
    save,
    update,
    load,
    remove,
    loadUserDesignSystems,
    loadPublicDesignSystems,
    createVersion,
    loadVersions,
    share,
    loadSharedDesignSystem,
    favorite,
    like,
    loadFavorites,
    trackDownload,
    clearError,

    // Setters (for external updates)
    setCurrentDesignSystem,
    setDesignSystems
  }
}