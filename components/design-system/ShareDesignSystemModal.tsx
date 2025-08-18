'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useDesignSystem } from '@/lib/hooks/useDesignSystem'
import { DesignSystem, SharedDesignSystem } from '@/types/database'

interface ShareDesignSystemModalProps {
  isOpen: boolean
  onClose: () => void
  designSystem: DesignSystem
}

export default function ShareDesignSystemModal({
  isOpen,
  onClose,
  designSystem
}: ShareDesignSystemModalProps) {
  const { share, isLoading } = useDesignSystem()
  const [shareSettings, setShareSettings] = useState({
    permission_level: 'view' as 'view' | 'edit' | 'clone',
    is_public: true,
    expires_at: ''
  })
  const [sharedLink, setSharedLink] = useState<string | null>(null)
  const [isSharing, setIsSharing] = useState(false)
  const [copiedToClipboard, setCopiedToClipboard] = useState(false)

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSharedLink(null)
      setCopiedToClipboard(false)
      // Check if already has a share token
      if (designSystem.share_token) {
        const baseUrl = window.location.origin
        setSharedLink(`${baseUrl}/shared/${designSystem.share_token}`)
      }
    }
  }, [isOpen, designSystem])

  const handleShare = async () => {
    if (!designSystem) return

    setIsSharing(true)
    try {
      const shareData = await share({
        design_system_id: designSystem.id,
        permission_level: shareSettings.permission_level,
        is_public: shareSettings.is_public,
        expires_at: shareSettings.expires_at || undefined
      })

      if (shareData?.share_token) {
        const baseUrl = window.location.origin
        const shareUrl = `${baseUrl}/shared/${shareData.share_token}`
        setSharedLink(shareUrl)
      }
    } catch (error) {
      console.error('Failed to create share link:', error)
    } finally {
      setIsSharing(false)
    }
  }

  const handleCopyToClipboard = async () => {
    if (!sharedLink) return

    try {
      await navigator.clipboard.writeText(sharedLink)
      setCopiedToClipboard(true)
      setTimeout(() => setCopiedToClipboard(false), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  const getShareUrl = () => {
    if (designSystem.share_token) {
      const baseUrl = window.location.origin
      return `${baseUrl}/shared/${designSystem.share_token}`
    }
    return null
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Share Design System</h2>
            <p className="text-gray-600 text-sm mt-1">
              Share "{designSystem.name}" with others
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
        <div className="p-6">
          {!sharedLink ? (
            /* Share Settings */
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Share Settings</h3>
                
                {/* Permission Level */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Permission Level
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'view', label: 'View Only', desc: 'Can view the design system but cannot make changes' },
                      { value: 'clone', label: 'Clone', desc: 'Can create their own copy of the design system' },
                      { value: 'edit', label: 'Edit', desc: 'Can make changes to the original design system' }
                    ].map((permission) => (
                      <label key={permission.value} className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="permissionLevel"
                          value={permission.value}
                          checked={shareSettings.permission_level === permission.value}
                          onChange={(e) => setShareSettings(prev => ({ 
                            ...prev, 
                            permission_level: e.target.value as any 
                          }))}
                          className="mt-1"
                        />
                        <div>
                          <div className="font-medium text-sm">{permission.label}</div>
                          <div className="text-xs text-gray-500">{permission.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Visibility */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Visibility
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="visibility"
                        checked={shareSettings.is_public === true}
                        onChange={() => setShareSettings(prev => ({ ...prev, is_public: true }))}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium text-sm">Public</div>
                        <div className="text-xs text-gray-500">Anyone with the link can access</div>
                      </div>
                    </label>
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="visibility"
                        checked={shareSettings.is_public === false}
                        onChange={() => setShareSettings(prev => ({ ...prev, is_public: false }))}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium text-sm">Private</div>
                        <div className="text-xs text-gray-500">Only specific users you share with</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Expiration */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Expiration (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={shareSettings.expires_at}
                    onChange={(e) => setShareSettings(prev => ({ ...prev, expires_at: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  <p className="text-xs text-gray-500">
                    If set, the share link will automatically expire at this date and time
                  </p>
                </div>
              </div>

              {/* Design System Preview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Design System Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <span className="ml-2 font-medium">{designSystem.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Components:</span>
                    <span className="ml-2 font-medium">{designSystem.selected_components.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Version:</span>
                    <span className="ml-2 font-medium">v{designSystem.version}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Theme:</span>
                    <span className="ml-2 font-medium">{designSystem.theme_data.name}</span>
                  </div>
                </div>
                {designSystem.description && (
                  <div className="mt-3">
                    <span className="text-gray-600">Description:</span>
                    <p className="mt-1 text-sm text-gray-800">{designSystem.description}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Share Link Generated */
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-green-600 text-6xl mb-4">🔗</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Share Link Created!</h3>
                <p className="text-gray-600">
                  Your design system is now ready to be shared
                </p>
              </div>

              {/* Share Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Share URL
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={sharedLink}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-sm font-mono"
                  />
                  <button
                    onClick={handleCopyToClipboard}
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-r-md transition-colors",
                      copiedToClipboard
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    )}
                  >
                    {copiedToClipboard ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Share Stats */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Share Information</h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
                  <div>Permission: <span className="font-medium capitalize">{shareSettings.permission_level}</span></div>
                  <div>Visibility: <span className="font-medium">{shareSettings.is_public ? 'Public' : 'Private'}</span></div>
                  {shareSettings.expires_at && (
                    <div className="col-span-2">
                      Expires: <span className="font-medium">
                        {new Date(shareSettings.expires_at).toLocaleDateString()} at{' '}
                        {new Date(shareSettings.expires_at).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Social Sharing Options */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Share Via</h4>
                <div className="flex space-x-3">
                  <a
                    href={`mailto:?subject=Check out this design system&body=I wanted to share this design system with you: ${sharedLink}`}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
                  >
                    📧 Email
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=Check out this design system!&url=${encodeURIComponent(sharedLink)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
                  >
                    🐦 Twitter
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {sharedLink ? 'Done' : 'Cancel'}
          </button>
          {!sharedLink && (
            <button
              onClick={handleShare}
              disabled={isSharing}
              className={cn(
                "px-4 py-2 rounded-md font-medium",
                isSharing
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              )}
            >
              {isSharing ? 'Creating Share Link...' : 'Create Share Link'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}