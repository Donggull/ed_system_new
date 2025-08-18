'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useDesignSystem } from '@/lib/hooks/useDesignSystem'
import { useAuth } from '@/contexts/AuthContext'
import { DesignSystem } from '@/types/database'
import { formatDistanceToNow } from 'date-fns'

interface SavedDesignSystemsProps {
  isOpen: boolean
  onClose: () => void
  onLoadDesignSystem: (designSystem: DesignSystem) => void
  onEditDesignSystem?: (designSystem: DesignSystem) => void
  onViewVersionHistory?: (designSystem: DesignSystem) => void
  onShareDesignSystem?: (designSystem: DesignSystem) => void
}

export default function SavedDesignSystems({
  isOpen,
  onClose,
  onLoadDesignSystem,
  onEditDesignSystem,
  onViewVersionHistory,
  onShareDesignSystem
}: SavedDesignSystemsProps) {
  const { user } = useAuth()
  const { 
    designSystems, 
    isLoading, 
    error, 
    loadUserDesignSystems,
    remove,
    like,
    favorite,
    loadFavorites: loadUserFavoritesFunc 
  } = useDesignSystem()

  const [selectedDesignSystem, setSelectedDesignSystem] = useState<DesignSystem | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<string>('')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [sortBy, setSortBy] = useState<'updated' | 'name' | 'created'>('updated')
  const [userFavoriteIds, setUserFavoriteIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (isOpen && user) {
      console.log('Loading design systems for user:', user.id)
      loadUserDesignSystems(user.id)
      loadFavorites()
    }
  }, [isOpen, user, loadUserDesignSystems]) // eslint-disable-line react-hooks/exhaustive-deps

  // Debug: log design systems when they change
  useEffect(() => {
    console.log('Design systems updated:', designSystems.length, designSystems)
  }, [designSystems])

  const loadFavorites = async () => {
    if (!user) return
    
    try {
      const favorites = await loadUserFavoritesFunc()
      if (favorites) {
        const favoriteIds = new Set(
          favorites.map((fav: any) => fav.design_system_id as string)
        )
        setUserFavoriteIds(favoriteIds)
      }
    } catch (error) {
      console.error('Failed to load user favorites:', error)
    }
  }

  const handleLoad = (designSystem: DesignSystem) => {
    onLoadDesignSystem(designSystem)
    onClose()
  }

  const handleDelete = async (id: string) => {
    const success = await remove(id)
    if (success) {
      setShowDeleteConfirm(null)
    }
  }

  const handleLike = async (e: React.MouseEvent, designSystemId: string) => {
    e.stopPropagation()
    await like(designSystemId)
    
    // Refresh the design systems to show updated like counts
    if (user) {
      loadUserDesignSystems(user.id)
    }
  }

  const handleFavorite = async (e: React.MouseEvent, designSystemId: string) => {
    e.stopPropagation()
    const result = await favorite(designSystemId)
    
    // Update local state based on the result
    if (result) {
      setUserFavoriteIds(prev => {
        const newSet = new Set(prev)
        if (result.favorited) {
          newSet.add(designSystemId)
        } else {
          newSet.delete(designSystemId)
        }
        return newSet
      })
    }
  }

  // Get all unique tags
  const allTags = Array.from(new Set(
    designSystems.flatMap(ds => ds.tags)
  )).sort()

  // Filter and sort design systems
  const filteredAndSortedDesignSystems = designSystems
    .filter(ds => {
      // Tag filter
      if (selectedTag && !ds.tags.includes(selectedTag)) return false
      
      // Favorites filter
      if (showFavoritesOnly) {
        return userFavoriteIds.has(ds.id)
      }
      
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'updated':
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      }
    })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Saved Design Systems</h2>
              <p className="text-gray-600 text-sm mt-1">
                {filteredAndSortedDesignSystems.length} of {designSystems.length} design systems
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Filters and Controls */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Tag Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Tag:</label>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Tags</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>

            {/* Favorites Filter */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showFavoritesOnly}
                onChange={(e) => setShowFavoritesOnly(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700">⭐ Favorites only</span>
            </label>

            {/* Sort By */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Sort:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="updated">Recently Updated</option>
                <option value="created">Recently Created</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading your design systems...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <div className="text-red-600 text-4xl mb-3">⚠️</div>
              <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Design Systems</h3>
              <p className="text-red-700">{error}</p>
            </div>
          ) : filteredAndSortedDesignSystems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">
                {designSystems.length === 0 ? '📝' : '🔍'}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {designSystems.length === 0 
                  ? 'No Saved Design Systems' 
                  : 'No Matching Design Systems'
                }
              </h3>
              <p className="text-gray-600">
                {designSystems.length === 0 
                  ? "You haven't saved any design systems yet. Create and save your first design system!"
                  : 'Try adjusting your filters to see more results.'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedDesignSystems.map((designSystem) => (
                <div
                  key={designSystem.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => handleLoad(designSystem)}
                >
                  {/* Preview */}
                  <div className="h-32 bg-gradient-to-br from-blue-50 to-purple-50 p-4 flex items-center justify-center relative">
                    {/* Color palette preview */}
                    <div className="flex space-x-1">
                      {designSystem.theme_data.colors.primary && Object.values(designSystem.theme_data.colors.primary).slice(0, 5).map((color, index) => (
                        <div
                          key={index}
                          className="w-6 h-6 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    
                    {/* Public badge */}
                    {designSystem.is_public && (
                      <div className="absolute top-2 right-2 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                        Public
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {designSystem.name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => handleLike(e, designSystem.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            title="Like"
                          >
                            ♥️
                          </button>
                          <button
                            onClick={(e) => handleFavorite(e, designSystem.id)}
                            className={`transition-colors p-1 ${
                              userFavoriteIds.has(designSystem.id)
                                ? 'text-yellow-500 hover:text-yellow-600'
                                : 'text-gray-400 hover:text-yellow-500'
                            }`}
                            title={userFavoriteIds.has(designSystem.id) ? "Remove from favorites" : "Add to favorites"}
                          >
                            {userFavoriteIds.has(designSystem.id) ? '⭐' : '☆'}
                          </button>
                        </div>
                        {/* Featured badge */}
                        {designSystem.is_featured && (
                          <div className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">
                            ⭐ Featured
                          </div>
                        )}
                      </div>
                    </div>

                    {designSystem.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {designSystem.description}
                      </p>
                    )}

                    {/* Tags */}
                    {designSystem.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {designSystem.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {designSystem.tags.length > 3 && (
                          <span className="text-gray-500 text-xs">
                            +{designSystem.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-3">
                        <span>{designSystem.selected_components.length} components</span>
                        <span>v{designSystem.version}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {designSystem.like_count > 0 && (
                          <span>♥️ {designSystem.like_count}</span>
                        )}
                        {designSystem.download_count > 0 && (
                          <span>⬇️ {designSystem.download_count}</span>
                        )}
                      </div>
                    </div>

                    {/* Updated time */}
                    <div className="text-xs text-gray-400 mt-2">
                      Updated {formatDistanceToNow(new Date(designSystem.updated_at), { addSuffix: true })}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleLoad(designSystem)
                          }}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Load
                        </button>
                        {onEditDesignSystem && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onEditDesignSystem(designSystem)
                            }}
                            className="text-sm text-gray-600 hover:text-gray-700"
                          >
                            Edit
                          </button>
                        )}
                        {onViewVersionHistory && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onViewVersionHistory(designSystem)
                            }}
                            className="text-sm text-purple-600 hover:text-purple-700"
                          >
                            Versions
                          </button>
                        )}
                        {onShareDesignSystem && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onShareDesignSystem(designSystem)
                            }}
                            className="text-sm text-green-600 hover:text-green-700"
                          >
                            Share
                          </button>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowDeleteConfirm(designSystem.id)
                        }}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Design System</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this design system? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}