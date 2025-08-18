'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useDesignSystem } from '@/lib/hooks/useDesignSystem'
import { DesignSystem, SharedDesignSystem } from '@/types/database'
import { incrementViewCount } from '@/lib/supabase/design-systems'
import Navigation from '@/components/Navigation'
import EnhancedPreview from '@/components/preview/EnhancedPreview'
import { themeManager } from '@/lib/theme-manager'
import { allComponentTemplates } from '@/lib/component-templates'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

export default function SharedDesignSystemPage() {
  const params = useParams()
  const token = params.token as string
  const { loadSharedDesignSystem, isLoading, error } = useDesignSystem()
  
  const [sharedData, setSharedData] = useState<any>(null)
  const [designSystem, setDesignSystem] = useState<DesignSystem | null>(null)
  const [selectedComponents, setSelectedComponents] = useState<string[]>([])

  useEffect(() => {
    if (token) {
      loadSharedSystem()
    }
  }, [token])

  const loadSharedSystem = async () => {
    try {
      const result = await loadSharedDesignSystem(token)
      if (result) {
        setSharedData(result)
        setDesignSystem(result.design_system)
        setSelectedComponents(result.design_system.selected_components)
        
        // Apply theme
        themeManager.updateTheme(result.design_system.theme_data, { animate: false })
        
        // Track view count
        try {
          await incrementViewCount(result.design_system.id)
        } catch (error) {
          console.error('Failed to track view:', error)
        }
      }
    } catch (err) {
      console.error('Failed to load shared design system:', err)
    }
  }

  const selectedTemplates = allComponentTemplates.filter(template => 
    selectedComponents.includes(template.id)
  )

  const canEdit = sharedData?.permission_level === 'edit'
  const canClone = sharedData?.permission_level === 'clone'
  const isExpired = sharedData?.expires_at && new Date(sharedData.expires_at) < new Date()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Design System</h2>
            <p className="text-gray-600">Please wait while we fetch the shared design system...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !sharedData || !designSystem) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-center max-w-md">
            <div className="text-red-600 text-6xl mb-4">🔒</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {isExpired ? 'Share Link Expired' : 'Design System Not Found'}
            </h2>
            <p className="text-gray-600 mb-6">
              {isExpired 
                ? 'This shared design system link has expired and is no longer accessible.'
                : 'The design system you&apos;re looking for doesn&apos;t exist or is no longer available.'
              }
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Go to Home Page
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Shared System Header */}
      <header className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="max-w-7xl mx-auto">
            {/* Share Info Badge */}
            <div className="flex items-center gap-2 mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                <span>🔗</span>
                <span className="font-medium">Shared Design System</span>
              </div>
              {sharedData.expires_at && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                  <span>⏰</span>
                  <span>
                    Expires {formatDistanceToNow(new Date(sharedData.expires_at), { addSuffix: true })}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {designSystem.name}
                </h1>
                {designSystem.description && (
                  <p className="text-gray-600 text-lg mb-4">
                    {designSystem.description}
                  </p>
                )}
                
                {/* System Stats */}
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <span>🎨</span>
                    <span>{designSystem.theme_data.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>🧩</span>
                    <span>{selectedComponents.length} components</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>📝</span>
                    <span>v{designSystem.version}</span>
                  </div>
                  {designSystem.tags.length > 0 && (
                    <div className="flex items-center gap-2">
                      {designSystem.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                      {designSystem.tags.length > 3 && (
                        <span className="text-gray-400 text-xs">+{designSystem.tags.length - 3} more</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                {/* Permission Badge */}
                <div className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium",
                  {
                    'bg-green-100 text-green-700': sharedData.permission_level === 'view',
                    'bg-blue-100 text-blue-700': sharedData.permission_level === 'clone',
                    'bg-purple-100 text-purple-700': sharedData.permission_level === 'edit'
                  }
                )}>
                  {sharedData.permission_level === 'view' && '👀 View Only'}
                  {sharedData.permission_level === 'clone' && '📋 Can Clone'}
                  {sharedData.permission_level === 'edit' && '✏️ Can Edit'}
                </div>

                {canClone && (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Clone System
                  </button>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>👤 Shared by</span>
                  <span className="font-medium">
                    {sharedData.shared_by?.full_name || 'Anonymous'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Component Preview */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {selectedComponents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Components Selected</h3>
            <p className="text-gray-600">
              This design system doesn&apos;t have any components configured for preview.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                Component Preview
              </h2>
              <div className="text-sm text-gray-500">
                {selectedComponents.length} component{selectedComponents.length !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <EnhancedPreview showControls={false}>
                  <div className="space-y-8">
                    {selectedTemplates.map((template, index) => (
                      <div key={template.id} className="border-b border-gray-100 pb-8 last:border-b-0">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">{template.name}</h3>
                        <div 
                          className="prose max-w-none"
                          dangerouslySetInnerHTML={{ 
                            __html: template.template_code.replace(/import.*?;/g, '').replace(/export.*?{/, '{') 
                          }} 
                        />
                      </div>
                    ))}
                  </div>
                </EnhancedPreview>
              </div>
            </div>

            {/* Component List */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Included Components
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {selectedTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 text-center"
                  >
                    <h4 className="font-medium text-gray-900 mb-1">{template.name}</h4>
                    <p className="text-xs text-gray-500 capitalize">{template.category}</p>
                    {template.description && (
                      <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                        {template.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer with Access Info */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <span>Access Count: {sharedData.access_count}</span>
              <span>•</span>
              <span>
                Shared {formatDistanceToNow(new Date(sharedData.created_at), { addSuffix: true })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span>Powered by</span>
              <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
                Design System Generator
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}