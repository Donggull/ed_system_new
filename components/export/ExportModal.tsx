'use client'

import React, { useState, useEffect } from 'react'
import { ComponentTemplate } from '@/types/database'
import { useCodeExport } from '@/lib/hooks/useCodeExport'
import { CodeGenerationOptions } from '@/lib/code-generator'
import { cn } from '@/lib/utils'
import { incrementDownloadCount } from '@/lib/supabase/design-systems'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  selectedComponents: ComponentTemplate[]
  theme: any
  projectName?: string
  designSystemId?: string
}

export default function ExportModal({
  isOpen,
  onClose,
  selectedComponents,
  theme,
  projectName = 'My Design System',
  designSystemId
}: ExportModalProps) {
  const [options, setOptions] = useState<CodeGenerationOptions>({
    framework: 'react',
    language: 'typescript',
    includeStorybook: true,
    includeTests: false,
    cssFramework: 'tailwind'
  })

  const [currentProjectName, setCurrentProjectName] = useState(projectName)
  const [exportType, setExportType] = useState<'zip' | 'individual' | 'github' | 'npm'>('zip')

  const {
    isExporting,
    progress,
    lastExportResult,
    exportCode,
    downloadAsZip,
    copyToClipboard,
    exportAsNPMPackage,
    generateDocumentation
  } = useCodeExport()

  const [selectedComponent, setSelectedComponent] = useState<ComponentTemplate | null>(null)
  const [copiedFile, setCopiedFile] = useState<string | null>(null)

  useEffect(() => {
    if (copiedFile) {
      const timer = setTimeout(() => setCopiedFile(null), 2000)
      return () => clearTimeout(timer)
    }
  }, [copiedFile])

  const handleExport = async () => {
    const result = await exportCode(selectedComponents, theme, options, currentProjectName)
    
    if (result.success && exportType === 'zip') {
      await downloadAsZip(result.files, currentProjectName)
      
      // Track download if design system ID is provided
      if (designSystemId) {
        try {
          await incrementDownloadCount(designSystemId)
        } catch (error) {
          console.error('Failed to track download:', error)
        }
      }
    }
  }

  const handleCopyComponent = async (component: ComponentTemplate) => {
    const result = await exportCode([component], theme, options, currentProjectName)
    if (result.success && result.files.length > 0) {
      const componentFile = result.files.find(f => f.type === 'component' && f.path.includes(component.name))
      if (componentFile) {
        const success = await copyToClipboard(componentFile.content)
        if (success) {
          setCopiedFile(component.id)
        }
      }
    }
  }

  const handleExportAsNPM = async () => {
    const result = await exportCode(selectedComponents, theme, options, currentProjectName)
    if (result.success) {
      const npmResult = await exportAsNPMPackage(result.files, currentProjectName.toLowerCase().replace(/\s+/g, '-'))
      if (npmResult.success) {
        await downloadAsZip(npmResult.files, `${currentProjectName}-npm`)
        
        // Track download if design system ID is provided
        if (designSystemId) {
          try {
            await incrementDownloadCount(designSystemId)
          } catch (error) {
            console.error('Failed to track download:', error)
          }
        }
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Export Design System</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* Sidebar - Export Options */}
          <div className="w-1/3 border-r bg-gray-50 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Project Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={currentProjectName}
                  onChange={(e) => setCurrentProjectName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="My Design System"
                />
              </div>

              {/* Export Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Export Type
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'zip', label: 'ZIP Download', desc: 'Complete project as ZIP file' },
                    { value: 'individual', label: 'Individual Copy', desc: 'Copy single component code' },
                    { value: 'npm', label: 'NPM Package', desc: 'Ready-to-publish package' },
                    { value: 'github', label: 'GitHub Repository', desc: 'Push to new repository' }
                  ].map((type) => (
                    <label key={type.value} className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="exportType"
                        value={type.value}
                        checked={exportType === type.value}
                        onChange={(e) => setExportType(e.target.value as any)}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium text-sm">{type.label}</div>
                        <div className="text-xs text-gray-500">{type.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Framework */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Framework
                </label>
                <select
                  value={options.framework}
                  onChange={(e) => setOptions(prev => ({ ...prev, framework: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="react">React</option>
                  <option value="vue">Vue</option>
                  <option value="html">HTML + CSS</option>
                </select>
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  value={options.language}
                  onChange={(e) => setOptions(prev => ({ ...prev, language: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="typescript">TypeScript</option>
                  <option value="javascript">JavaScript</option>
                </select>
              </div>

              {/* CSS Framework */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CSS Framework
                </label>
                <select
                  value={options.cssFramework}
                  onChange={(e) => setOptions(prev => ({ ...prev, cssFramework: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="tailwind">Tailwind CSS</option>
                  <option value="css-modules">CSS Modules</option>
                  <option value="styled-components">Styled Components</option>
                </select>
              </div>

              {/* Additional Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Files
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={options.includeStorybook}
                      onChange={(e) => setOptions(prev => ({ ...prev, includeStorybook: e.target.checked }))}
                    />
                    <span className="text-sm">Storybook Stories</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={options.includeTests}
                      onChange={(e) => setOptions(prev => ({ ...prev, includeTests: e.target.checked }))}
                    />
                    <span className="text-sm">Unit Tests</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {exportType === 'individual' ? (
              /* Individual Component Copy */
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Select Component to Copy
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedComponents.map((component) => (
                    <div
                      key={component.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{component.name}</h4>
                          <p className="text-sm text-gray-500">{component.description}</p>
                        </div>
                        <button
                          onClick={() => handleCopyComponent(component)}
                          disabled={isExporting}
                          className={cn(
                            "px-3 py-1 text-sm rounded-md transition-colors",
                            copiedFile === component.id
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                          )}
                        >
                          {copiedFile === component.id ? '✓ Copied' : 'Copy Code'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Export Summary */
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Export Summary
                </h3>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Project:</span> {currentProjectName}
                    </div>
                    <div>
                      <span className="font-medium">Framework:</span> {options.framework}
                    </div>
                    <div>
                      <span className="font-medium">Language:</span> {options.language}
                    </div>
                    <div>
                      <span className="font-medium">Components:</span> {selectedComponents.length}
                    </div>
                  </div>
                </div>

                <h4 className="font-medium text-gray-900 mb-3">Selected Components</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
                  {selectedComponents.map((component) => (
                    <div
                      key={component.id}
                      className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm text-center"
                    >
                      {component.name}
                    </div>
                  ))}
                </div>

                <h4 className="font-medium text-gray-900 mb-3">Generated Files</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>• Component files ({options.framework})</div>
                  <div>• Theme CSS with CSS variables</div>
                  <div>• TypeScript type definitions</div>
                  {options.includeStorybook && <div>• Storybook stories</div>}
                  {options.includeTests && <div>• Unit test files</div>}
                  <div>• Package.json and configuration</div>
                  <div>• Complete documentation</div>
                </div>

                {/* Progress */}
                {progress && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>{progress.step}</span>
                      <span>{progress.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${progress.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Export Result */}
                {lastExportResult && !isExporting && (
                  <div className="mt-6">
                    {lastExportResult.success ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <span className="text-green-600 text-lg mr-2">✓</span>
                          <span className="text-green-700 font-medium">Export completed successfully!</span>
                        </div>
                        <div className="text-green-600 text-sm mt-1">
                          Generated {lastExportResult.files.length} files
                        </div>
                      </div>
                    ) : (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <span className="text-red-600 text-lg mr-2">✗</span>
                          <span className="text-red-700 font-medium">Export failed</span>
                        </div>
                        <div className="text-red-600 text-sm mt-1">
                          {lastExportResult.error}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <div className="flex space-x-3">
            {exportType === 'npm' && (
              <button
                onClick={handleExportAsNPM}
                disabled={isExporting || selectedComponents.length === 0}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                {isExporting ? 'Exporting...' : 'Export as NPM Package'}
              </button>
            )}
            {exportType === 'zip' && (
              <button
                onClick={handleExport}
                disabled={isExporting || selectedComponents.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isExporting ? 'Exporting...' : 'Download ZIP'}
              </button>
            )}
            {exportType === 'github' && (
              <button
                disabled={true}
                className="px-4 py-2 bg-gray-400 text-white rounded-md cursor-not-allowed"
                title="GitHub export coming soon"
              >
                Export to GitHub (Coming Soon)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}