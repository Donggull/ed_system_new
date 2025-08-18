'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useDesignSystem } from '@/lib/hooks/useDesignSystem'
import { useAuth } from '@/contexts/AuthContext'
import { DesignSystem } from '@/types/database'
import { formatDistanceToNow } from 'date-fns'

interface DiscoverDesignSystemsProps {
  isOpen: boolean
  onClose: () => void
  onCloneDesignSystem: (designSystem: DesignSystem) => void
  onViewDesignSystem: (designSystem: DesignSystem) => void
}

export default function DiscoverDesignSystems({
  isOpen,
  onClose,
  onCloneDesignSystem,
  onViewDesignSystem
}: DiscoverDesignSystemsProps) {
  const { user } = useAuth()
  const { 
    isLoading, 
    error, 
    like,
    loadPublicDesignSystems
  } = useDesignSystem()

  const [publicDesignSystems, setPublicDesignSystems] = useState<DesignSystem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedTag, setSelectedTag] = useState<string>('')
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'name'>('popular')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (isOpen) {
      loadPublicSystems()
    }
  }, [isOpen])

  const loadPublicSystems = async () => {
    try {
      const systems = await loadPublicDesignSystems()
      if (systems) {
        setPublicDesignSystems(systems)
      }
    } catch (error) {
      console.error('Failed to load public design systems:', error)
    }
  }

  const handleLike = async (e: React.MouseEvent, designSystemId: string) => {
    e.stopPropagation()
    
    try {
      await like(designSystemId)
      // Refresh the list to update like counts
      loadPublicSystems()
    } catch (error) {
      console.error('Failed to like design system:', error)
    }
  }

  const handleClone = async (e: React.MouseEvent, designSystem: DesignSystem) => {
    e.stopPropagation()
    onCloneDesignSystem(designSystem)
  }

  // Get all unique tags from public systems
  const allTags = Array.from(new Set(
    publicDesignSystems.flatMap(ds => ds.tags)
  )).sort()

  // Get categories (we can define common categories)
  const categories = [
    'Web Apps', 'Mobile Apps', 'Landing Pages', 'Admin Panels', 
    'E-commerce', 'Portfolios', 'Blogs', 'Dashboards'
  ]

  // Filter and sort design systems
  const filteredAndSortedSystems = publicDesignSystems
    .filter(ds => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch = 
          ds.name.toLowerCase().includes(query) ||
          ds.description?.toLowerCase().includes(query) ||
          ds.tags.some(tag => tag.toLowerCase().includes(query))
        if (!matchesSearch) return false
      }

      // Tag filter
      if (selectedTag && !ds.tags.includes(selectedTag)) return false
      
      // Category filter (check if any tag matches the category)
      if (selectedCategory) {
        const categoryMatch = ds.tags.some(tag => 
          tag.toLowerCase().includes(selectedCategory.toLowerCase())
        )
        if (!categoryMatch) return false
      }
      
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'recent':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'popular':
        default:
          // Sort by like count + download count
          const aScore = (a.like_count || 0) + (a.download_count || 0)
          const bScore = (b.like_count || 0) + (b.download_count || 0)
          return bScore - aScore
      }
    })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-7xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Discover Design Systems</h2>
              <p className="text-gray-600 mt-1">
                Explore {filteredAndSortedSystems.length} of {publicDesignSystems.length} public design systems from the community
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search design systems..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Filter Controls */}
            <div className="flex items-center gap-4 flex-wrap">
              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Category:</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Tag Filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Tag:</label>
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Tags</option>
                  {allTags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Sort:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="popular">Most Popular</option>
                  <option value="recent">Recently Added</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-240px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading public design systems...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <div className="text-red-600 text-4xl mb-3">⚠️</div>
              <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Design Systems</h3>
              <p className="text-red-700">{error}</p>
            </div>
          ) : filteredAndSortedSystems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">
                {publicDesignSystems.length === 0 ? '🌐' : '🔍'}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {publicDesignSystems.length === 0 
                  ? 'No Public Design Systems' 
                  : 'No Matching Design Systems'
                }
              </h3>
              <p className="text-gray-600">
                {publicDesignSystems.length === 0 
                  ? 'No public design systems are available at the moment.'
                  : 'Try adjusting your search or filters to see more results.'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedSystems.map((designSystem) => (
                <div
                  key={designSystem.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => onViewDesignSystem(designSystem)}
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
                    
                    {/* Featured badge */}
                    {designSystem.is_featured && (
                      <div className="absolute top-2 left-2 bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">
                        ⭐ Featured
                      </div>
                    )}

                    {/* Public badge */}
                    <div className="absolute top-2 right-2 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                      🌐 Public
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {designSystem.name}
                      </h3>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleLike(e, designSystem.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          title="Like this design system"
                        >
                          ♥️
                        </button>
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
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <div className="flex items-center space-x-3">
                        <span>{designSystem.selected_components.length} components</span>
                        <span>v{designSystem.version}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {(designSystem.like_count || 0) > 0 && (
                          <span>♥️ {designSystem.like_count}</span>
                        )}
                        {(designSystem.download_count || 0) > 0 && (
                          <span>⬇️ {designSystem.download_count}</span>
                        )}
                      </div>
                    </div>

                    {/* Creator */}
                    <div className="text-xs text-gray-400 mb-3">
                      by {designSystem.user_id ? 'Community Creator' : 'Anonymous'} • {formatDistanceToNow(new Date(designSystem.created_at), { addSuffix: true })}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onViewDesignSystem(designSystem)
                          }}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          View
                        </button>
                        <button
                          onClick={(e) => handleClone(e, designSystem)}
                          className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                        >
                          Clone
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}