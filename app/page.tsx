'use client'

import { useEffect, useState } from 'react'
import { getThemeTemplates } from '@/lib/supabase/themes'
import { getComponentTemplates } from '@/lib/supabase/components'
import { Theme, ComponentTemplate } from '@/types/database'

export default function Home() {
  const [themeTemplates, setThemeTemplates] = useState<Theme[]>([])
  const [componentTemplates, setComponentTemplates] = useState<ComponentTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [themes, components] = await Promise.all([
          getThemeTemplates(),
          getComponentTemplates()
        ])
        setThemeTemplates(themes)
        setComponentTemplates(components)
      } catch (err) {
        console.error('Failed to load data:', err)
        setError('Failed to load data from database')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])
  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      {/* Left Sidebar */}
      <div className="w-80 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 overflow-y-auto shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-gray-200/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-sm font-bold">DS</span>
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900">DesignSystem</h1>
              <p className="text-xs text-gray-500 font-medium">Projects → Ecommerce Theme</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200/50 px-2">
          <button className="px-4 py-3 text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 border-b-2 border-blue-500 relative">
            Theme
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
          </button>
          <button className="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
            Structure
          </button>
          <button className="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
            Presets
          </button>
        </div>

        {/* Colors Section */}
        <div className="p-6">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Colors</h3>
          
          {/* Primary Colors */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">Primary</p>
            <div className="flex gap-2">
              <div className="w-9 h-9 bg-blue-50 rounded-lg border-2 border-white shadow-sm hover:scale-105 transition-transform cursor-pointer"></div>
              <div className="w-9 h-9 bg-blue-100 rounded-lg border-2 border-white shadow-sm hover:scale-105 transition-transform cursor-pointer"></div>
              <div className="w-9 h-9 bg-blue-200 rounded-lg border-2 border-white shadow-sm hover:scale-105 transition-transform cursor-pointer"></div>
              <div className="w-9 h-9 bg-blue-400 rounded-lg border-2 border-white shadow-sm hover:scale-105 transition-transform cursor-pointer"></div>
              <div className="w-9 h-9 bg-blue-500 rounded-lg border-2 border-white shadow-md hover:scale-105 transition-transform cursor-pointer ring-2 ring-blue-200"></div>
              <div className="w-9 h-9 bg-blue-600 rounded-lg border-2 border-white shadow-sm hover:scale-105 transition-transform cursor-pointer"></div>
            </div>
            <p className="text-xs font-mono text-gray-500 mt-2 bg-gray-50 px-2 py-1 rounded">#4318FF</p>
          </div>

          {/* Secondary Colors */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">Secondary</p>
            <div className="flex gap-2">
              <div className="w-9 h-9 bg-slate-100 rounded-lg border-2 border-white shadow-sm hover:scale-105 transition-transform cursor-pointer"></div>
              <div className="w-9 h-9 bg-slate-200 rounded-lg border-2 border-white shadow-sm hover:scale-105 transition-transform cursor-pointer"></div>
              <div className="w-9 h-9 bg-slate-300 rounded-lg border-2 border-white shadow-sm hover:scale-105 transition-transform cursor-pointer"></div>
              <div className="w-9 h-9 bg-slate-400 rounded-lg border-2 border-white shadow-sm hover:scale-105 transition-transform cursor-pointer"></div>
              <div className="w-9 h-9 bg-slate-500 rounded-lg border-2 border-white shadow-md hover:scale-105 transition-transform cursor-pointer ring-2 ring-slate-200"></div>
              <div className="w-9 h-9 bg-slate-600 rounded-lg border-2 border-white shadow-sm hover:scale-105 transition-transform cursor-pointer"></div>
            </div>
          </div>

          {/* Success Colors */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">Success</p>
            <div className="flex gap-2">
              <div className="w-9 h-9 bg-emerald-100 rounded-lg border-2 border-white shadow-sm hover:scale-105 transition-transform cursor-pointer"></div>
              <div className="w-9 h-9 bg-emerald-200 rounded-lg border-2 border-white shadow-sm hover:scale-105 transition-transform cursor-pointer"></div>
              <div className="w-9 h-9 bg-emerald-300 rounded-lg border-2 border-white shadow-sm hover:scale-105 transition-transform cursor-pointer"></div>
              <div className="w-9 h-9 bg-emerald-400 rounded-lg border-2 border-white shadow-sm hover:scale-105 transition-transform cursor-pointer"></div>
              <div className="w-9 h-9 bg-emerald-500 rounded-lg border-2 border-white shadow-md hover:scale-105 transition-transform cursor-pointer ring-2 ring-emerald-200"></div>
              <div className="w-9 h-9 bg-emerald-600 rounded-lg border-2 border-white shadow-sm hover:scale-105 transition-transform cursor-pointer"></div>
            </div>
          </div>

          <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors">+ Add color</button>
        </div>

        {/* Typography Section */}
        <div className="p-4 border-t border-gray-100">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Typography</h3>
          
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500">Font Size</p>
              <p className="text-sm text-gray-900">The quick brown fox</p>
            </div>
            
            <div>
              <p className="text-xs text-gray-500">Font Size</p>
              <p className="text-xs text-gray-700">The quick brown fox jumps over the lazy dog</p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-2">Main Font</p>
            <select className="w-full text-xs border border-gray-200 rounded px-2 py-1">
              <option>Inter - Regular - ( - )</option>
            </select>
          </div>
        </div>

        {/* JSON Configuration */}
        <div className="p-4 border-t border-gray-100">
          <h3 className="text-sm font-medium text-gray-900 mb-3">JSON Configuration</h3>
          <div className="bg-gray-900 rounded p-3 text-xs text-gray-300 font-mono overflow-x-auto">
            <pre>{`{
  "colors": {
    "primary": "#4318FF",
    "secondary": "#A3AED0",
    "success": "#01B574"
  },
  "typography": {
    "fontFamily": "Inter",
    "fontSize": {
      "sm": "14px",
      "md": "16px"
    }
  }
}`}</pre>
          </div>
        </div>

        {/* Component Categories */}
        <div className="p-4 border-t border-gray-100">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Component Categories</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Essential Components</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked className="sr-only peer" />
                <div className="w-9 h-5 bg-blue-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Data Display</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked className="sr-only peer" />
                <div className="w-9 h-5 bg-blue-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Feedback Elements</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked className="sr-only peer" />
                <div className="w-9 h-5 bg-blue-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Layout Components</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
              </label>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              {loading ? (
                <span>⏳ Loading templates...</span>
              ) : error ? (
                <span className="text-red-500">❌ {error}</span>
              ) : (
                <span>✓ Theme validated</span>
              )}
              <span>{componentTemplates.length} templates loaded</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Top Header */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-8 py-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h2 className="text-xl font-bold text-gray-900">Essential Components</h2>
              <div className="flex items-center gap-3">
                <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-semibold">100%</div>
                <div className="flex gap-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 000 2h14a1 1 0 100-2H3zm0 4a1 1 0 000 2h14a1 1 0 100-2H3zm0 4a1 1 0 000 2h14a1 1 0 100-2H3z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm">
                Cancel
              </button>
              <button className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl">
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Component Sections */}
        <div className="p-8 space-y-12">
          {/* Buttons Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Buttons</h3>
            <div className="flex flex-wrap gap-4 mb-6">
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 text-sm font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5">
                Primary Button
              </button>
              <button className="px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl hover:from-slate-700 hover:to-slate-800 text-sm font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5">
                Secondary Button
              </button>
              <button className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 text-sm font-semibold transition-all transform hover:-translate-y-0.5">
                Outline Button
              </button>
              <button className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl text-sm font-semibold transition-all">
                Ghost Button
              </button>
              <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 text-sm font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5">
                Success Button
              </button>
              <button className="px-6 py-3 bg-gray-200 text-gray-400 rounded-xl cursor-not-allowed text-sm font-semibold" disabled>
                Disabled Button
              </button>
            </div>
            <div className="flex gap-4">
              <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-xs font-semibold shadow-md hover:shadow-lg transition-all">Small</button>
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all">Medium</button>
              <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-base font-semibold shadow-xl hover:shadow-2xl transition-all">Large</button>
            </div>
          </div>

          {/* Form Inputs Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Form Inputs</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Text Input</h4>
                <input 
                  type="text" 
                  placeholder="Enter your name" 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all hover:border-gray-300"
                />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Email Input</h4>
                <input 
                  type="email" 
                  placeholder="name@example.com" 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all hover:border-gray-300"
                />
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Search Input</h4>
              <div className="relative max-w-md">
                <input 
                  type="search" 
                  placeholder="Search..." 
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all hover:border-gray-300"
                />
                <svg className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Cards Section */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 shadow-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Cards</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                <h4 className="font-bold text-gray-900 mb-3">Basic Card</h4>
                <p className="text-sm text-gray-600 leading-relaxed">This is a basic card with minimal styling for content display.</p>
                <button className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-all">Learn more</button>
              </div>
              
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 overflow-hidden shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                <div className="h-32 bg-gradient-to-r from-blue-100 to-purple-100"></div>
                <div className="p-6">
                  <h4 className="font-bold text-gray-900 mb-3">Card with Header</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">This card includes a header section for title or actions.</p>
                  <button className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-all">Learn more</button>
                </div>
              </div>
              
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                <h4 className="font-bold text-gray-900 mb-3">Card with Footer</h4>
                <p className="text-sm text-gray-600 leading-relaxed">This card includes a footer section for buttons or actions.</p>
                <div className="mt-6 pt-4 border-t border-gray-200/50 flex gap-3">
                  <button className="text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-all">Cancel</button>
                  <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-all">Save</button>
                </div>
              </div>
            </div>
          </div>

          {/* Typography Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Typography</h3>
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Heading 1 (24px)</h1>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Heading 2 (20px)</h2>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Heading 3 (18px)</h3>
              </div>
              <div>
                <h4 className="text-base font-medium text-gray-900">Heading 4 (16px)</h4>
              </div>
              <div>
                <h5 className="text-sm font-medium text-gray-900">Heading 5 (14px)</h5>
              </div>
              <div>
                <h6 className="text-xs font-medium text-gray-900">Heading 6 (12px)</h6>
              </div>
              <div className="pt-2">
                <p className="text-base text-gray-700">Paragraph text (16px) - The quick brown fox jumps over the lazy dog.</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Caption text (14px) - The quick brown fox jumps over the lazy dog.</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Small text (12px) - The quick brown fox jumps over the lazy dog.</p>
              </div>
            </div>
          </div>

          {/* Form Elements Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Form Elements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Checkboxes</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-sm text-gray-700">Default Checkbox</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" checked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-sm text-gray-700">Checked Checkbox</span>
                  </label>
                  <label className="flex items-center text-gray-400">
                    <input type="checkbox" disabled className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-sm">Disabled Checkbox</span>
                  </label>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Radio Buttons</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="radio" name="radio-group" className="border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-sm text-gray-700">Default Radio</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="radio-group" checked className="border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-sm text-gray-700">Selected Radio</span>
                  </label>
                  <label className="flex items-center text-gray-400">
                    <input type="radio" name="radio-group" disabled className="border-gray-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-sm">Disabled Radio</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Select Input</h4>
              <select className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm">
                <option>Option 1</option>
                <option>Option 2</option>
                <option>Option 3</option>
              </select>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Textarea</h4>
              <textarea 
                placeholder="Enter your message here..." 
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
              ></textarea>
            </div>
          </div>

          {/* Data Display Components */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Display Components</h3>
            
            {/* Table */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Table</h4>
              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-medium">JC</span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">Jane Cooper</div>
                            <div className="text-sm text-gray-500">jane@example.com</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Regional Paradigm Technician</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Admin</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-900">Edit</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-medium">CS</span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">Cody Smith</div>
                            <div className="text-sm text-gray-500">cody@example.com</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Senior Developer</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Developer</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-900">Edit</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Badges & Avatars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Badges</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Blue</span>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Green</span>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Red</span>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Yellow</span>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">Purple</span>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Gray</span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Avatars</h4>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">JD</span>
                  </div>
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">AM</span>
                  </div>
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">CS</span>
                  </div>
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Elements */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Feedback Elements</h3>
            
            {/* Alerts */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-900">Alerts</h4>
              <div className="flex items-center p-4 text-blue-800 bg-blue-50 rounded-lg border border-blue-200">
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">Information alert - A new software update is available.</span>
              </div>

              <div className="flex items-center p-4 text-green-800 bg-green-50 rounded-lg border border-green-200">
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">Success alert - Your changes have been saved successfully.</span>
              </div>

              <div className="flex items-center p-4 text-yellow-800 bg-yellow-50 rounded-lg border border-yellow-200">
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">Warning alert - Your subscription will expire in 3 days.</span>
              </div>

              <div className="flex items-center p-4 text-red-800 bg-red-50 rounded-lg border border-red-200">
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">Error alert - There was a problem processing your request.</span>
              </div>
            </div>

            {/* Toast Notifications */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Toast Notifications</h4>
              <div className="space-y-3">
                <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Successfully saved!</p>
                      <p className="text-xs text-gray-500">Your changes have been saved successfully.</p>
                    </div>
                    <button className="ml-auto text-gray-400 hover:text-gray-600">×</button>
                  </div>
                </div>

                <div className="max-w-sm bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Error occurred</p>
                      <p className="text-xs text-gray-500">There was a problem with your request.</p>
                    </div>
                    <button className="ml-auto text-gray-400 hover:text-gray-600">×</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading States */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Loading States</h4>
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-xs text-gray-500 mb-2">Spinner</p>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2">Skeleton</p>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-4/5"></div>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2">Progress Bar</p>
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '60%'}}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">60%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Library */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Chart Library</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Bar Chart</h4>
                <div className="h-32 bg-gradient-to-t from-blue-100 to-blue-50 rounded flex items-end justify-center p-4">
                  <div className="flex items-end gap-2">
                    <div className="w-8 h-16 bg-blue-500 rounded-t"></div>
                    <div className="w-8 h-12 bg-blue-400 rounded-t"></div>
                    <div className="w-8 h-20 bg-blue-600 rounded-t"></div>
                    <div className="w-8 h-8 bg-blue-300 rounded-t"></div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Line Chart</h4>
                <div className="h-32 bg-gradient-to-br from-green-50 to-green-100 rounded flex items-center justify-center">
                  <svg className="w-24 h-16" viewBox="0 0 100 60" fill="none">
                    <polyline 
                      points="10,50 30,20 50,35 70,10 90,25" 
                      stroke="#10b981" 
                      strokeWidth="2" 
                      fill="none"
                    />
                    <circle cx="10" cy="50" r="2" fill="#10b981"/>
                    <circle cx="30" cy="20" r="2" fill="#10b981"/>
                    <circle cx="50" cy="35" r="2" fill="#10b981"/>
                    <circle cx="70" cy="10" r="2" fill="#10b981"/>
                    <circle cx="90" cy="25" r="2" fill="#10b981"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Component Inspector */}
        <div className="w-80 bg-white/80 backdrop-blur-xl border-l border-gray-200/50 p-6 overflow-y-auto shadow-sm">
          <h3 className="text-base font-bold text-gray-900 mb-6">Component Inspector</h3>
          
          {/* Selected Component */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200/50 p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">Selected Component</span>
              <button className="text-xs text-gray-500 hover:text-gray-700 p-1 hover:bg-white/50 rounded">×</button>
            </div>
            <p className="text-base font-bold text-gray-900">Button - Primary</p>
            <p className="text-xs font-medium text-gray-600 bg-white/50 px-2 py-1 rounded-lg inline-block mt-1">Button</p>
          </div>

          {/* Properties */}
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Properties</h4>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Background</label>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="w-6 h-6 bg-blue-600 rounded-lg border-2 border-white shadow-md"></div>
                    <span className="text-sm font-mono text-gray-700 bg-gray-50 px-2 py-1 rounded">#4318FF</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Text Color</label>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="w-6 h-6 bg-white rounded-lg border-2 border-gray-200 shadow-md"></div>
                    <span className="text-sm font-mono text-gray-700 bg-gray-50 px-2 py-1 rounded">#FFFFFF</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Border Radius</label>
                  <input 
                    type="text" 
                    value="12px" 
                    className="w-full mt-2 px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Padding</label>
                  <input 
                    type="text" 
                    value="12px 24px" 
                    className="w-full mt-2 px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Font Weight</label>
                  <select className="w-full mt-2 px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all">
                    <option>600</option>
                    <option>400</option>
                    <option>500</option>
                    <option>700</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Generated Code */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Generated Code</h4>
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl text-xs text-gray-300 p-4 font-mono shadow-lg">
                <pre>{`const Button = ({ children, ...props }) => {
  return (
    <button
      className="px-6 py-3 bg-gradient-to-r 
      from-blue-600 to-blue-700 text-white 
      rounded-xl hover:from-blue-700 
      hover:to-blue-800 font-semibold 
      shadow-lg transition-all"
      {...props}
    >
      {children}
    </button>
  )
}`}</pre>
              </div>
            </div>

            {/* States */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">States</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-3 px-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl text-sm font-medium">
                  <span>Default</span>
                  <span className="text-blue-600 font-bold">Active</span>
                </div>
                <div className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 rounded-xl text-sm font-medium cursor-pointer transition-all">
                  <span>Hover</span>
                </div>
                <div className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 rounded-xl text-sm font-medium cursor-pointer transition-all">
                  <span>Focus</span>
                </div>
                <div className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 rounded-xl text-sm font-medium cursor-pointer transition-all">
                  <span>Disabled</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
