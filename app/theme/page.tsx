'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useTheme } from '@/contexts/ThemeContext'

const themePages = [
  { href: '/theme/eluo', label: 'Eluo', icon: '✨' },
  { href: '/theme/cards', label: 'Cards', icon: '🎴' },
  { href: '/theme/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/theme/pricing', label: 'Pricing', icon: '💰' },
]

export default function ThemePage() {
  const pathname = usePathname()
  const { jsonInput, updateTheme, jsonError, loadSampleTheme } = useTheme()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Theme System</h1>
          <p className="text-gray-600">Customize your design system with real-time JSON theme editing</p>
        </div>

        {/* Theme Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 mb-6">
          <div className="flex space-x-1">
            {themePages.map((page) => (
              <Link
                key={page.href}
                href={page.href}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  pathname === page.href
                    ? "bg-blue-100 text-blue-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                <span className="text-base">{page.icon}</span>
                <span>{page.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* JSON Editor */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Theme Configuration</h2>
                <button
                  onClick={() => loadSampleTheme('flat')}
                  className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Load Sample
                </button>
              </div>
              
              {jsonError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{jsonError}</p>
                </div>
              )}
              
              <textarea
                value={jsonInput}
                onChange={(e) => updateTheme(e.target.value)}
                className={cn(
                  "w-full h-96 p-4 border rounded-lg font-mono text-sm resize-none",
                  jsonError 
                    ? "border-red-300 focus:border-red-500 focus:ring-red-200" 
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                )}
                placeholder="Enter your theme JSON..."
              />
              
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => loadSampleTheme('modern')}
                  className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                >
                  Modern
                </button>
                <button
                  onClick={() => loadSampleTheme('dark')}
                  className="flex-1 px-3 py-2 text-sm bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                >
                  Dark
                </button>
                <button
                  onClick={() => loadSampleTheme('vibrant')}
                  className="flex-1 px-3 py-2 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100"
                >
                  Vibrant
                </button>
              </div>
            </div>
          </div>

          {/* Welcome Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="text-center max-w-2xl mx-auto">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-2xl font-bold">🎨</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">Welcome to Theme System</h2>
                  <p className="text-gray-600 leading-relaxed">
                    Create and customize beautiful design systems with real-time JSON editing. 
                    Choose from our theme categories to get started.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {themePages.map((page) => (
                    <Link
                      key={page.href}
                      href={page.href}
                      className="group p-6 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <div className="text-3xl mb-3">{page.icon}</div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {page.label}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {page.label === 'Eluo' && 'Elegant UI components'}
                        {page.label === 'Cards' && 'Interactive card layouts'}
                        {page.label === 'Dashboard' && 'Data visualization'}
                        {page.label === 'Pricing' && 'Subscription plans'}
                      </p>
                    </Link>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    💡 <strong>Pro tip:</strong> All theme changes are synchronized across all pages in real-time. 
                    Edit the JSON on any page to see instant updates everywhere.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}