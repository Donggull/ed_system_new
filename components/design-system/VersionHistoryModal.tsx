'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useDesignSystem } from '@/lib/hooks/useDesignSystem'
import { DesignSystem, DesignSystemVersion } from '@/types/database'
import { formatDistanceToNow } from 'date-fns'

interface VersionHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  designSystem: DesignSystem
  onLoadVersion: (version: DesignSystemVersion) => void
  onCreateVersion: (changeNotes?: string) => Promise<void>
}

export default function VersionHistoryModal({
  isOpen,
  onClose,
  designSystem,
  onLoadVersion,
  onCreateVersion
}: VersionHistoryModalProps) {
  const { loadVersions, isLoading } = useDesignSystem()
  const [versions, setVersions] = useState<DesignSystemVersion[]>([])
  const [showCreateVersion, setShowCreateVersion] = useState(false)
  const [changeNotes, setChangeNotes] = useState('')
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (isOpen && designSystem) {
      loadVersionHistory()
    }
  }, [isOpen, designSystem])

  const loadVersionHistory = async () => {
    if (!designSystem) return
    
    try {
      const versionHistory = await loadVersions(designSystem.id)
      setVersions(versionHistory)
    } catch (error) {
      console.error('Failed to load version history:', error)
    }
  }

  const handleCreateVersion = async () => {
    if (!designSystem) return

    setIsCreating(true)
    try {
      await onCreateVersion(changeNotes.trim() || undefined)
      setChangeNotes('')
      setShowCreateVersion(false)
      
      // Reload versions after creating new one
      await loadVersionHistory()
    } catch (error) {
      console.error('Failed to create version:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleLoadVersion = (version: DesignSystemVersion) => {
    onLoadVersion(version)
    onClose()
  }

  const getVersionStatus = (version: DesignSystemVersion) => {
    if (version.version_number === designSystem.version) {
      return { label: 'Current', color: 'text-green-600 bg-green-50' }
    }
    return { label: 'Previous', color: 'text-gray-600 bg-gray-50' }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Version History</h2>
            <p className="text-gray-600 text-sm mt-1">
              {designSystem.name} - {versions.length} version{versions.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-140px)]">
          {/* Version List */}
          <div className="w-1/2 border-r overflow-y-auto">
            <div className="p-4">
              {/* Create New Version Button */}
              <button
                onClick={() => setShowCreateVersion(true)}
                className="w-full mb-4 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                + Create New Version
              </button>

              {/* Version List */}
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading versions...</span>
                </div>
              ) : versions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-3">📝</div>
                  <p className="text-gray-600">No version history available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {versions.map((version) => {
                    const status = getVersionStatus(version)
                    return (
                      <div
                        key={version.id}
                        onClick={() => setSelectedVersionId(version.id)}
                        className={cn(
                          'p-4 border rounded-lg cursor-pointer transition-colors',
                          selectedVersionId === version.id
                            ? 'border-blue-300 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">
                              v{version.version_number}
                            </span>
                            <span className={cn(
                              'px-2 py-1 text-xs font-medium rounded-full',
                              status.color
                            )}>
                              {status.label}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                          </span>
                        </div>

                        {version.change_notes && (
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {version.change_notes}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>
                            {version.selected_components.length} components
                          </span>
                          <span>
                            {new Date(version.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Version Details */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {showCreateVersion ? (
                /* Create Version Form */
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Version</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Change Notes (Optional)
                      </label>
                      <textarea
                        value={changeNotes}
                        onChange={(e) => setChangeNotes(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                        placeholder="Describe what changed in this version..."
                      />
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Current State</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Theme:</span>
                          <span className="ml-2 font-medium">{designSystem.theme_data.name}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Components:</span>
                          <span className="ml-2 font-medium">{designSystem.selected_components.length}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Current Version:</span>
                          <span className="ml-2 font-medium">v{designSystem.version}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Next Version:</span>
                          <span className="ml-2 font-medium">v{designSystem.version + 1}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => setShowCreateVersion(false)}
                        className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCreateVersion}
                        disabled={isCreating}
                        className={cn(
                          "flex-1 px-4 py-2 rounded-md font-medium transition-colors",
                          isCreating
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        )}
                      >
                        {isCreating ? 'Creating...' : 'Create Version'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : selectedVersionId ? (
                /* Version Details */
                (() => {
                  const selectedVersion = versions.find(v => v.id === selectedVersionId)
                  if (!selectedVersion) return null

                  const status = getVersionStatus(selectedVersion)
                  
                  return (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-medium text-gray-900">
                            Version {selectedVersion.version_number}
                          </h3>
                          <span className={cn(
                            'px-3 py-1 text-sm font-medium rounded-full',
                            status.color
                          )}>
                            {status.label}
                          </span>
                        </div>
                        <button
                          onClick={() => handleLoadVersion(selectedVersion)}
                          disabled={selectedVersion.version_number === designSystem.version}
                          className={cn(
                            "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                            selectedVersion.version_number === designSystem.version
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          )}
                        >
                          {selectedVersion.version_number === designSystem.version ? 'Current Version' : 'Load This Version'}
                        </button>
                      </div>

                      <div className="space-y-6">
                        {/* Change Notes */}
                        {selectedVersion.change_notes && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Change Notes</h4>
                            <div className="bg-gray-50 rounded-lg p-4">
                              <p className="text-gray-700 text-sm whitespace-pre-wrap">
                                {selectedVersion.change_notes}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Version Info */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Version Details</h4>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Version:</span>
                                <span className="ml-2 font-medium">v{selectedVersion.version_number}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Created:</span>
                                <span className="ml-2 font-medium">
                                  {formatDistanceToNow(new Date(selectedVersion.created_at), { addSuffix: true })}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Components:</span>
                                <span className="ml-2 font-medium">{selectedVersion.selected_components.length}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Theme:</span>
                                <span className="ml-2 font-medium">{selectedVersion.theme_data.name}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Component Changes */}
                        {selectedVersion.selected_components && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3">Components in This Version</h4>
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="flex flex-wrap gap-2">
                                {selectedVersion.selected_components.map((componentId, index) => (
                                  <span
                                    key={index}
                                    className="bg-blue-100 text-blue-700 px-2 py-1 text-xs rounded-full"
                                  >
                                    {componentId}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })()
              ) : (
                /* No Version Selected */
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <div className="text-4xl mb-3">📋</div>
                    <p>Select a version to view details</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}