'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useDesignSystem } from '@/lib/hooks/useDesignSystem'
import { ThemeData, ComponentSettings } from '@/types/database'

interface SaveDesignSystemModalProps {
  isOpen: boolean
  onClose: () => void
  themeData: ThemeData
  selectedComponents: string[]
  componentSettings?: ComponentSettings
  existingDesignSystem?: {
    id: string
    name: string
    description?: string
    tags: string[]
    is_public: boolean
  }
}

const SUGGESTED_TAGS = [
  'UI Components',
  'Dark Mode', 
  'Mobile First',
  'Accessibility',
  'Enterprise',
  'Minimal',
  'Colorful',
  'Modern',
  'Business',
  'Creative',
  'Dashboard',
  'E-commerce'
]

export default function SaveDesignSystemModal({
  isOpen,
  onClose,
  themeData,
  selectedComponents,
  componentSettings,
  existingDesignSystem
}: SaveDesignSystemModalProps) {
  const { save, update, isLoading, error, clearError } = useDesignSystem()

  const [formData, setFormData] = useState({
    name: existingDesignSystem?.name || '',
    description: existingDesignSystem?.description || '',
    tags: existingDesignSystem?.tags || [],
    is_public: existingDesignSystem?.is_public || false
  })

  const [customTag, setCustomTag] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (existingDesignSystem) {
      setFormData({
        name: existingDesignSystem.name,
        description: existingDesignSystem.description || '',
        tags: existingDesignSystem.tags,
        is_public: existingDesignSystem.is_public
      })
    }
  }, [existingDesignSystem])

  useEffect(() => {
    if (isOpen) {
      clearError()
      setShowSuccess(false)
    }
  }, [isOpen, clearError])

  const handleSave = async () => {
    if (!formData.name.trim()) {
      return
    }

    try {
      let result

      if (existingDesignSystem) {
        // Update existing design system
        result = await update(existingDesignSystem.id, {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          tags: formData.tags,
          is_public: formData.is_public,
          theme_data: themeData,
          selected_components: selectedComponents,
          component_settings: componentSettings
        })
      } else {
        // Save new design system
        result = await save({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          theme_data: themeData,
          selected_components: selectedComponents,
          component_settings: componentSettings,
          tags: formData.tags,
          is_public: formData.is_public
        })
      }

      if (result) {
        setShowSuccess(true)
        setTimeout(() => {
          onClose()
          setShowSuccess(false)
        }, 1500)
      }
    } catch (err) {
      console.error('Error saving design system:', err)
    }
  }

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const handleAddCustomTag = () => {
    if (customTag.trim()) {
      addTag(customTag.trim())
      setCustomTag('')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {existingDesignSystem ? 'Update Design System' : 'Save Design System'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {showSuccess ? (
            <div className="text-center py-8">
              <div className="text-green-600 text-6xl mb-4">✓</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {existingDesignSystem ? 'Design System Updated!' : 'Design System Saved!'}
              </h3>
              <p className="text-gray-600">
                Your design system has been {existingDesignSystem ? 'updated' : 'saved'} successfully.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="My Awesome Design System"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                  placeholder="A brief description of your design system..."
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="space-y-3">
                  {/* Selected Tags */}
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="text-blue-500 hover:text-blue-700 ml-1"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Add Custom Tag */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customTag}
                      onChange={(e) => setCustomTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddCustomTag()}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add custom tag..."
                    />
                    <button
                      onClick={handleAddCustomTag}
                      className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      Add
                    </button>
                  </div>

                  {/* Suggested Tags */}
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Suggested tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTED_TAGS.filter(tag => !formData.tags.includes(tag)).map((tag) => (
                        <button
                          key={tag}
                          onClick={() => addTag(tag)}
                          className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Visibility */}
              <div>
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_public}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_public: e.target.checked }))}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-700">Make this design system public</div>
                    <div className="text-sm text-gray-500">
                      Other users will be able to discover, view, and use this design system
                    </div>
                  </div>
                </label>
              </div>

              {/* Stats */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Design System Stats</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Components:</span>
                    <span className="ml-2 font-medium">{selectedComponents.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Theme:</span>
                    <span className="ml-2 font-medium">{themeData.name}</span>
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="text-red-500 mr-2">⚠️</div>
                    <div>
                      <h4 className="font-medium text-red-800">Error</h4>
                      <p className="text-red-700 text-sm mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!showSuccess && (
          <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading || !formData.name.trim()}
              className={cn(
                "px-4 py-2 rounded-md font-medium",
                isLoading || !formData.name.trim()
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              )}
            >
              {isLoading ? 'Saving...' : existingDesignSystem ? 'Update' : 'Save'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}