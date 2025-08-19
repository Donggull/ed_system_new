'use client'

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

export default function EluoThemePage() {
  const pathname = usePathname()
  const { theme, jsonInput, updateTheme, jsonError, loadSampleTheme } = useTheme()

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Eluo Theme</h1>
          <p className="text-gray-600">Elegant and modern UI components with sophisticated design</p>
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
          {/* Theme Editor */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Theme Configuration</h2>
                <button
                  onClick={() => loadSampleTheme('modern')}
                  className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Modern
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
            </div>
          </div>

          {/* Eluo Components */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Hero Section */}
            <div 
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8"
              style={{ borderRadius: theme.borderRadius || '16px' }}
            >
              <div className="text-center max-w-2xl mx-auto">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4"
                     style={{ backgroundColor: theme.colors?.primary?.[100] || '#e0f2fe', 
                              color: theme.colors?.primary?.[700] || '#0369a1' }}>
                  ✨ New Features Available
                </div>
                <h1 className="text-4xl font-bold mb-4" style={{ color: theme.colors?.text || '#1e293b' }}>
                  Beautiful Design System
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  Create stunning user interfaces with our comprehensive design system and component library.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    className="px-8 py-3 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                    style={{ backgroundColor: theme.colors?.primary?.[500] || '#0ea5e9' }}
                  >
                    Get Started
                  </button>
                  <button className="px-8 py-3 rounded-xl font-semibold border-2 hover:bg-gray-50 transition-colors"
                          style={{ borderColor: theme.colors?.primary?.[300] || '#7dd3fc',
                                   color: theme.colors?.primary?.[600] || '#0284c7' }}>
                    Learn More
                  </button>
                </div>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: '🎨', title: 'Design System', desc: 'Comprehensive design tokens and components' },
                { icon: '⚡', title: 'Performance', desc: 'Optimized for speed and user experience' },
                { icon: '🔧', title: 'Customizable', desc: 'Highly flexible and themeable components' }
              ].map((feature, i) => (
                <div 
                  key={i}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all"
                  style={{ borderRadius: theme.borderRadius || '12px' }}
                >
                  <div className="text-3xl mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: theme.colors?.text || '#1e293b' }}>
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </div>
              ))}
            </div>

            {/* Profile Card */}
            <div 
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
              style={{ borderRadius: theme.borderRadius || '16px' }}
            >
              <div className="h-32 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              <div className="p-6 relative">
                <div className="absolute -top-12 left-6">
                  <div 
                    className="w-24 h-24 rounded-full border-4 border-white flex items-center justify-center text-white text-2xl font-bold"
                    style={{ backgroundColor: theme.colors?.primary?.[500] || '#0ea5e9' }}
                  >
                    JD
                  </div>
                </div>
                <div className="ml-32">
                  <h3 className="text-xl font-bold" style={{ color: theme.colors?.text || '#1e293b' }}>
                    John Doe
                  </h3>
                  <p className="text-gray-600 mb-4">Senior Product Designer</p>
                  <div className="flex space-x-4">
                    <div className="text-center">
                      <div className="font-bold text-lg" style={{ color: theme.colors?.primary?.[500] || '#0ea5e9' }}>
                        1.2k
                      </div>
                      <div className="text-sm text-gray-500">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-lg" style={{ color: theme.colors?.primary?.[500] || '#0ea5e9' }}>
                        856
                      </div>
                      <div className="text-sm text-gray-500">Following</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-lg" style={{ color: theme.colors?.primary?.[500] || '#0ea5e9' }}>
                        42
                      </div>
                      <div className="text-sm text-gray-500">Projects</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Cards */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold" style={{ color: theme.colors?.text || '#1e293b' }}>
                Recent Notifications
              </h3>
              {[
                { type: 'success', icon: '✅', title: 'Project Updated', desc: 'Your design system has been successfully updated.', time: '2 mins ago' },
                { type: 'info', icon: '💡', title: 'New Feature', desc: 'Check out our new color palette generator.', time: '1 hour ago' },
                { type: 'warning', icon: '⚠️', title: 'Review Required', desc: 'Your latest design needs approval from the team.', time: '3 hours ago' }
              ].map((notif, i) => (
                <div 
                  key={i}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-start space-x-4"
                  style={{ borderRadius: theme.borderRadius || '8px' }}
                >
                  <div className="text-2xl">{notif.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-medium" style={{ color: theme.colors?.text || '#1e293b' }}>
                      {notif.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">{notif.desc}</p>
                    <p className="text-xs text-gray-400 mt-2">{notif.time}</p>
                  </div>
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}