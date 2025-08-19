'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useTheme } from '@/contexts/ThemeContext'
import Navigation from '@/components/Navigation'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

const themePages = [
  { href: '/theme/eluo', label: 'Eluo', icon: '✨' },
  { href: '/theme/cards', label: 'Cards', icon: '🎴' },
  { href: '/theme/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/theme/pricing', label: 'Pricing', icon: '💰' },
]

export default function DashboardThemePage() {
  const pathname = usePathname()
  const { theme, jsonInput, updateTheme, jsonError, loadSampleTheme } = useTheme()

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <Navigation />
        
        {/* Dashboard Theme 페이지 전용 기능 헤더 */}
        <header className="sticky top-[80px] z-40 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-lg font-bold">📊</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Dashboard Theme</h2>
                    <p className="text-sm text-gray-600">데이터 시각화 및 애널리틱스 대시보드</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                {/* 테마 상태 */}
                <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className={cn(
                    'w-3 h-3 rounded-full animate-pulse',
                    !jsonError ? 'bg-green-500' : 'bg-red-500'
                  )}></div>
                  <span className={cn(
                    'text-sm font-medium',
                    !jsonError ? 'text-green-700' : 'text-red-700'
                  )}>
                    {!jsonError ? '테마 정상' : '테마 오류'}
                  </span>
                </div>
                
                {/* 샘플 테마 로드 버튼들 */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => loadSampleTheme('flat')}
                    className="px-3 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors shadow-sm"
                  >
                    Flat
                  </button>
                  <button
                    onClick={() => loadSampleTheme('modern')}
                    className="px-3 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors shadow-sm"
                  >
                    Modern
                  </button>
                  <button
                    onClick={() => loadSampleTheme('vibrant')}
                    className="px-3 py-2 bg-teal-500 text-white text-sm font-medium rounded-lg hover:bg-teal-600 transition-colors shadow-sm"
                  >
                    Vibrant
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-6">

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
                  onClick={() => loadSampleTheme('dark')}
                  className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Dark
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

          {/* Dashboard Components */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Revenue', value: '$45,231.89', change: '+20.1%', trend: 'up' },
                { label: 'Subscriptions', value: '+2,350', change: '+180.1%', trend: 'up' },
                { label: 'Sales', value: '+12,234', change: '+19%', trend: 'up' },
                { label: 'Active Users', value: '+573', change: '+201', trend: 'up' }
              ].map((stat, i) => (
                <div 
                  key={i}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                  style={{ borderRadius: theme.borderRadius || '8px' }}
                >
                  <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"/>
                      <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold" style={{ color: theme.colors?.text || '#1e293b' }}>
                      {stat.value}
                    </div>
                    <p className="text-xs text-gray-500 flex items-center">
                      <span className="text-green-600 mr-1">↗</span>
                      {stat.change} from last month
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Chart Card */}
            <div 
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              style={{ borderRadius: theme.borderRadius || '8px' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: theme.colors?.text || '#1e293b' }}>
                  Overview
                </h3>
                <select className="text-sm border border-gray-300 rounded-md px-2 py-1">
                  <option>January - June 2024</option>
                </select>
              </div>
              <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
                <svg width="100%" height="300" viewBox="0 0 800 300">
                  {/* Grid lines */}
                  <defs>
                    <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  
                  {/* Bar Chart */}
                  {[120, 180, 140, 200, 160, 220, 190, 250, 180, 280, 240, 300].map((height, i) => (
                    <rect
                      key={i}
                      x={50 + i * 60}
                      y={300 - height}
                      width="40"
                      height={height}
                      fill={theme.colors?.primary?.[500] || '#0ea5e9'}
                      opacity="0.8"
                      rx="4"
                    />
                  ))}
                  
                  {/* Line Chart */}
                  <polyline
                    fill="none"
                    stroke={theme.colors?.success?.[500] || '#22c55e'}
                    strokeWidth="3"
                    points="70,200 130,150 190,170 250,120 310,140 370,100 430,110 490,80 550,90 610,60 670,70 730,40"
                  />
                  
                  {/* Data points */}
                  {[200, 150, 170, 120, 140, 100, 110, 80, 90, 60, 70, 40].map((y, i) => (
                    <circle 
                      key={i} 
                      cx={70 + i * 60} 
                      cy={y} 
                      r="4" 
                      fill={theme.colors?.success?.[500] || '#22c55e'} 
                    />
                  ))}
                </svg>
              </div>
            </div>

            {/* Recent Activity */}
            <div 
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              style={{ borderRadius: theme.borderRadius || '8px' }}
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors?.text || '#1e293b' }}>
                Recent Activity
              </h3>
              <div className="space-y-4">
                {[
                  { action: 'New user registered', user: 'Olivia Martin', time: '2 hours ago', avatar: 'OM' },
                  { action: 'Made a purchase', user: 'Jackson Lee', time: '4 hours ago', avatar: 'JL' },
                  { action: 'Updated profile', user: 'Isabella Nguyen', time: '6 hours ago', avatar: 'IN' },
                  { action: 'Cancelled subscription', user: 'William Kim', time: '8 hours ago', avatar: 'WK' },
                  { action: 'Left a review', user: 'Sofia Davis', time: '12 hours ago', avatar: 'SD' }
                ].map((activity, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium"
                      style={{ backgroundColor: theme.colors?.primary?.[500] || '#0ea5e9' }}
                    >
                      {activity.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: theme.colors?.text || '#1e293b' }}>
                        {activity.user}
                      </p>
                      <p className="text-sm text-gray-500">{activity.action}</p>
                    </div>
                    <div className="text-sm text-gray-400">
                      {activity.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Traffic Sources */}
              <div 
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                style={{ borderRadius: theme.borderRadius || '8px' }}
              >
                <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors?.text || '#1e293b' }}>
                  Traffic Sources
                </h3>
                <div className="space-y-3">
                  {[
                    { source: 'Organic Search', percentage: 54, value: '5,420' },
                    { source: 'Direct', percentage: 32, value: '3,200' },
                    { source: 'Social Media', percentage: 14, value: '1,400' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium" style={{ color: theme.colors?.text || '#1e293b' }}>
                            {item.source}
                          </span>
                          <span className="text-sm text-gray-500">{item.value}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full"
                            style={{ 
                              backgroundColor: theme.colors?.primary?.[500] || '#0ea5e9',
                              width: `${item.percentage}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Pages */}
              <div 
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                style={{ borderRadius: theme.borderRadius || '8px' }}
              >
                <h3 className="text-lg font-semibold mb-4" style={{ color: theme.colors?.text || '#1e293b' }}>
                  Top Pages
                </h3>
                <div className="space-y-3">
                  {[
                    { page: '/dashboard', views: '4,321', change: '+12%' },
                    { page: '/products', views: '3,654', change: '+8%' },
                    { page: '/pricing', views: '2,987', change: '+24%' },
                    { page: '/about', views: '1,876', change: '-3%' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium" style={{ color: theme.colors?.text || '#1e293b' }}>
                          {item.page}
                        </p>
                        <p className="text-xs text-gray-500">{item.views} views</p>
                      </div>
                      <div className={`text-sm font-medium ${item.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {item.change}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}