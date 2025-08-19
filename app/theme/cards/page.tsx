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

export default function CardsThemePage() {
  const pathname = usePathname()
  const { theme, jsonInput, updateTheme, jsonError, loadSampleTheme } = useTheme()

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <Navigation />
        
        {/* Cards Theme 페이지 전용 기능 헤더 */}
        <header className="sticky top-[80px] z-40 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-lg font-bold">🎴</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Cards Theme</h2>
                    <p className="text-sm text-gray-600">인터랙티브 카드 컴포넌트 및 실시간 테마 커스터마이징</p>
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
                    className="px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                  >
                    Flat
                  </button>
                  <button
                    onClick={() => loadSampleTheme('modern')}
                    className="px-3 py-2 bg-cyan-500 text-white text-sm font-medium rounded-lg hover:bg-cyan-600 transition-colors shadow-sm"
                  >
                    Modern
                  </button>
                  <button
                    onClick={() => loadSampleTheme('vibrant')}
                    className="px-3 py-2 bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-600 transition-colors shadow-sm"
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
                  onClick={() => loadSampleTheme('flat')}
                  className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Sample
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

          {/* Card Previews */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Statistics Card */}
            <div 
              className="bg-white rounded-lg shadow-md p-6"
              style={{ 
                backgroundColor: theme.colors?.background || '#ffffff',
                borderRadius: theme.borderRadius || '12px',
                boxShadow: theme.shadows?.md || '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: theme.colors?.text || '#1e293b' }}>
                  Total Revenue
                </h3>
              </div>
              <div className="mb-2">
                <span className="text-3xl font-bold" style={{ color: theme.colors?.text || '#1e293b' }}>
                  $15,231.89
                </span>
                <span className="text-sm ml-2" style={{ color: theme.colors?.success?.[500] || '#22c55e' }}>
                  +20.1% from last month
                </span>
              </div>
              <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center">
                <svg width="300" height="100" viewBox="0 0 300 100">
                  <polyline
                    fill="none"
                    stroke={theme.colors?.primary?.[500] || '#0ea5e9'}
                    strokeWidth="2"
                    points="0,80 50,70 100,60 150,50 200,40 250,30 300,20"
                  />
                  {[0, 50, 100, 150, 200, 250, 300].map((x, i) => (
                    <circle key={i} cx={x} cy={80 - i * 10} r="3" fill={theme.colors?.primary?.[500] || '#0ea5e9'} />
                  ))}
                </svg>
              </div>
            </div>

            {/* Calendar Card */}
            <div 
              className="bg-white rounded-lg shadow-md p-6"
              style={{ 
                backgroundColor: theme.colors?.background || '#ffffff',
                borderRadius: theme.borderRadius || '12px',
                boxShadow: theme.shadows?.md || '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: theme.colors?.text || '#1e293b' }}>
                  June 2025
                </h3>
                <div className="flex space-x-2">
                  <svg className="h-5 w-5 text-gray-400 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <svg className="h-5 w-5 text-gray-400 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-sm">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} className="p-2 text-center text-gray-500 font-medium">{day}</div>
                ))}
                {Array.from({ length: 35 }, (_, i) => {
                  const date = i - 6
                  const isCurrentMonth = date > 0 && date <= 30
                  const isToday = date === 5
                  return (
                    <div 
                      key={i} 
                      className={`p-2 text-center cursor-pointer rounded ${
                        isToday 
                          ? 'text-white' 
                          : isCurrentMonth 
                            ? 'text-gray-900 hover:bg-gray-100' 
                            : 'text-gray-400'
                      }`}
                      style={isToday ? { backgroundColor: theme.colors?.primary?.[500] || '#0ea5e9' } : {}}
                    >
                      {isCurrentMonth ? date : ''}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Goal Tracker Card */}
            <div 
              className="bg-white rounded-lg shadow-md p-6"
              style={{ 
                backgroundColor: theme.colors?.background || '#ffffff',
                borderRadius: theme.borderRadius || '12px',
                boxShadow: theme.shadows?.md || '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            >
              <h3 className="text-lg font-semibold mb-2" style={{ color: theme.colors?.text || '#1e293b' }}>
                Move Goal
              </h3>
              <p className="text-sm text-gray-600 mb-4">Set your daily activity goal</p>
              <div className="flex items-center justify-between mb-4">
                <div className="h-8 w-8 rounded-full bg-gray-100 cursor-pointer flex items-center justify-center">
                  <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold" style={{ color: theme.colors?.primary?.[500] || '#0ea5e9' }}>
                    350
                  </div>
                  <div className="text-sm text-gray-500">CALORIES/DAY</div>
                </div>
                <div className="h-8 w-8 rounded-full bg-gray-100 cursor-pointer flex items-center justify-center">
                  <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>
              <div className="flex justify-center space-x-1">
                {Array.from({ length: 14 }, (_, i) => (
                  <div 
                    key={i}
                    className="w-4 h-12 rounded"
                    style={{ 
                      backgroundColor: i % 3 === 0 ? theme.colors?.primary?.[500] || '#0ea5e9' : '#e5e7eb',
                      height: `${20 + (i * 3)}px`
                    }}
                  />
                ))}
              </div>
              <button 
                className="w-full mt-4 py-2 rounded-lg font-medium"
                style={{ backgroundColor: theme.colors?.primary?.[500] || '#0ea5e9', color: 'white' }}
              >
                Set Goal
              </button>
            </div>

            {/* Subscription Upgrade Card */}
            <div 
              className="bg-white rounded-lg shadow-md p-6"
              style={{ 
                backgroundColor: theme.colors?.background || '#ffffff',
                borderRadius: theme.borderRadius || '12px',
                boxShadow: theme.shadows?.md || '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            >
              <h3 className="text-lg font-semibold mb-2" style={{ color: theme.colors?.text || '#1e293b' }}>
                Upgrade your subscription
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                You are currently on the free plan. Upgrade to the pro plan to get access to all features.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input 
                    type="text" 
                    placeholder="Full Rabbit"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="email" 
                    placeholder="example@acme.com"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                  <input 
                    type="text" 
                    placeholder="1234 1234 1234 1234"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">MM/YY</label>
                    <input type="text" className="w-full p-3 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                    <input type="text" className="w-full p-3 border border-gray-300 rounded-lg" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="starter" name="plan" />
                    <label htmlFor="starter" className="text-sm">Starter Plan - Perfect for small businesses</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="radio" id="pro" name="plan" />
                    <label htmlFor="pro" className="text-sm">Pro Plan - More features and storage</label>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="terms" />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    I agree to the terms and conditions
                  </label>
                </div>
                <div className="flex space-x-4">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg">Cancel</button>
                  <button 
                    className="px-6 py-2 rounded-lg text-white font-medium"
                    style={{ backgroundColor: theme.colors?.primary?.[500] || '#0ea5e9' }}
                  >
                    Upgrade Plan
                  </button>
                </div>
              </div>
            </div>

            {/* Team Members Card */}
            <div 
              className="bg-white rounded-lg shadow-md p-6"
              style={{ 
                backgroundColor: theme.colors?.background || '#ffffff',
                borderRadius: theme.borderRadius || '12px',
                boxShadow: theme.shadows?.md || '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            >
              <h3 className="text-lg font-semibold mb-2" style={{ color: theme.colors?.text || '#1e293b' }}>
                Team Members
              </h3>
              <p className="text-sm text-gray-600 mb-4">Invite your team members to collaborate.</p>
              <div className="space-y-3">
                {[
                  { name: 'Sofia Davis', email: 's@example.com', role: 'Owner' },
                  { name: 'Jackson Lee', email: 'j@example.com', role: 'Developer' },
                  { name: 'Isabella Nguyen', email: 'i@example.com', role: 'Billing' }
                ].map((member, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium"
                        style={{ backgroundColor: theme.colors?.primary?.[500] || '#0ea5e9' }}
                      >
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{member.name}</div>
                        <div className="text-xs text-gray-500">{member.email}</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">{member.role}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payments Table Card */}
            <div 
              className="bg-white rounded-lg shadow-md p-6"
              style={{ 
                backgroundColor: theme.colors?.background || '#ffffff',
                borderRadius: theme.borderRadius || '12px',
                boxShadow: theme.shadows?.md || '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            >
              <h3 className="text-lg font-semibold mb-2" style={{ color: theme.colors?.text || '#1e293b' }}>
                Payments
              </h3>
              <p className="text-sm text-gray-600 mb-4">Manage your payments.</p>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Status</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Email</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-600">Amount</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-600"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { status: 'Success', email: 'ken99@example.com', amount: '$316.00' },
                      { status: 'Success', email: 'abc@example.com', amount: '$242.00' },
                      { status: 'Processing', email: 'monster@example.com', amount: '$837.00' },
                      { status: 'Failed', email: 'carmella@example.com', amount: '$721.00' },
                      { status: 'Success', email: 'sarah23@example.com', amount: '$1,200.00' }
                    ].map((payment, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="py-3">
                          <span 
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              payment.status === 'Success' 
                                ? 'bg-green-100 text-green-800'
                                : payment.status === 'Processing'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {payment.status}
                          </span>
                        </td>
                        <td className="py-3 text-sm">{payment.email}</td>
                        <td className="py-3 text-sm font-medium">{payment.amount}</td>
                        <td className="py-3 text-right">
                          <button className="text-gray-400 hover:text-gray-600">⋯</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Exercise Minutes Card */}
            <div 
              className="bg-white rounded-lg shadow-md p-6"
              style={{ 
                backgroundColor: theme.colors?.background || '#ffffff',
                borderRadius: theme.borderRadius || '12px',
                boxShadow: theme.shadows?.md || '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            >
              <h3 className="text-lg font-semibold mb-2" style={{ color: theme.colors?.text || '#1e293b' }}>
                Exercise Minutes
              </h3>
              <p className="text-sm text-gray-600 mb-4">Your exercise minutes are ahead of where you normally are.</p>
              <div className="h-48 bg-gray-50 rounded-lg flex items-end justify-center p-4">
                <svg width="300" height="160" viewBox="0 0 300 160">
                  <defs>
                    <linearGradient id="exerciseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={theme.colors?.primary?.[500] || '#0ea5e9'} stopOpacity="0.3"/>
                      <stop offset="100%" stopColor={theme.colors?.primary?.[500] || '#0ea5e9'} stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  {/* Area chart */}
                  <path
                    d="M0,140 L50,120 L100,100 L150,70 L200,110 L250,90 L300,80 L300,160 L0,160 Z"
                    fill="url(#exerciseGradient)"
                  />
                  {/* Line chart */}
                  <polyline
                    fill="none"
                    stroke={theme.colors?.primary?.[500] || '#0ea5e9'}
                    strokeWidth="3"
                    points="0,140 50,120 100,100 150,70 200,110 250,90 300,80"
                  />
                  {/* Data points */}
                  {[0, 50, 100, 150, 200, 250, 300].map((x, i) => {
                    const y = [140, 120, 100, 70, 110, 90, 80][i]
                    return <circle key={i} cx={x} cy={y} r="4" fill={theme.colors?.primary?.[500] || '#0ea5e9'} />
                  })}
                </svg>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>

            {/* Cookie Settings Card */}
            <div 
              className="bg-white rounded-lg shadow-md p-6"
              style={{ 
                backgroundColor: theme.colors?.background || '#ffffff',
                borderRadius: theme.borderRadius || '12px',
                boxShadow: theme.shadows?.md || '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            >
              <h3 className="text-lg font-semibold mb-2" style={{ color: theme.colors?.text || '#1e293b' }}>
                Cookie Settings
              </h3>
              <p className="text-sm text-gray-600 mb-4">Manage your cookie settings here.</p>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">Strictly Necessary</div>
                    <div className="text-xs text-gray-500">These cookies are essential in order to use the website and use its features.</div>
                  </div>
                  <div className="relative">
                    <input type="checkbox" defaultChecked className="sr-only" />
                    <div className="w-12 h-6 bg-gray-300 rounded-full p-1 relative">
                      <div 
                        className="w-4 h-4 rounded-full shadow-sm transform transition translate-x-6"
                        style={{ backgroundColor: theme.colors?.primary?.[500] || '#0ea5e9' }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">Functional Cookies</div>
                    <div className="text-xs text-gray-500">These cookies allow the website to provide personalised functionality.</div>
                  </div>
                  <div className="relative">
                    <input type="checkbox" className="sr-only" />
                    <div className="w-12 h-6 bg-gray-300 rounded-full p-1 relative">
                      <div className="w-4 h-4 bg-white rounded-full shadow-sm transform transition" />
                    </div>
                  </div>
                </div>
              </div>
              <button 
                className="w-full mt-6 py-2 px-4 rounded-lg font-medium"
                style={{ backgroundColor: theme.colors?.primary?.[500] || '#0ea5e9', color: 'white' }}
              >
                Save preferences
              </button>
            </div>

            {/* Create Account Card */}
            <div 
              className="bg-white rounded-lg shadow-md p-6"
              style={{ 
                backgroundColor: theme.colors?.background || '#ffffff',
                borderRadius: theme.borderRadius || '12px',
                boxShadow: theme.shadows?.md || '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            >
              <h3 className="text-lg font-semibold mb-2" style={{ color: theme.colors?.text || '#1e293b' }}>
                Create an account
              </h3>
              <p className="text-sm text-gray-600 mb-4">Enter your email below to create your account</p>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <button className="flex-1 p-3 border border-gray-300 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-50">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.347-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.747 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.624 0 11.99-5.367 11.99-11.989C24.007 5.367 18.641.001 12.017.001z"/>
                    </svg>
                    <span>GitHub</span>
                  </button>
                  <button className="flex-1 p-3 border border-gray-300 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-50">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Google</span>
                  </button>
                </div>
                <div className="text-center text-sm text-gray-500 relative">
                  <span className="bg-white px-2">OR CONTINUE WITH</span>
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input 
                    type="email" 
                    placeholder="m@example.com"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input 
                    type="password"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button 
                  className="w-full py-3 px-4 rounded-lg font-medium text-white"
                  style={{ backgroundColor: theme.colors?.text || '#1e293b' }}
                >
                  Create account
                </button>
              </div>
            </div>

            {/* Share Document Card */}
            <div 
              className="bg-white rounded-lg shadow-md p-6"
              style={{ 
                backgroundColor: theme.colors?.background || '#ffffff',
                borderRadius: theme.borderRadius || '12px',
                boxShadow: theme.shadows?.md || '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            >
              <h3 className="text-lg font-semibold mb-2" style={{ color: theme.colors?.text || '#1e293b' }}>
                Share this document
              </h3>
              <p className="text-sm text-gray-600 mb-4">Anyone with the link can view this document</p>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    value="http://example.com/link/to/document"
                    readOnly
                    className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                  />
                  <button 
                    className="px-4 py-3 rounded-lg font-medium"
                    style={{ backgroundColor: theme.colors?.primary?.[500] || '#0ea5e9', color: 'white' }}
                  >
                    Copy link
                  </button>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-3">People with access</h4>
                  <div className="space-y-2">
                    {[
                      { name: 'Olivia Martin', email: 'm@example.com', role: 'Can edit' },
                      { name: 'Isabella Nguyen', email: 'b@example.com', role: 'Can edit' },
                      { name: 'Sofia Davis', email: 'p@example.com', role: 'Can edit' },
                      { name: 'Ethan Thompson', email: 'e@example.com', role: 'Can edit' }
                    ].map((person, i) => (
                      <div key={i} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium"
                            style={{ backgroundColor: theme.colors?.primary?.[500] || '#0ea5e9' }}
                          >
                            {person.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="text-sm font-medium">{person.name}</div>
                            <div className="text-xs text-gray-500">{person.email}</div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">{person.role}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Report Issue Card */}
            <div 
              className="bg-white rounded-lg shadow-md p-6"
              style={{ 
                backgroundColor: theme.colors?.background || '#ffffff',
                borderRadius: theme.borderRadius || '12px',
                boxShadow: theme.shadows?.md || '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            >
              <h3 className="text-lg font-semibold mb-2" style={{ color: theme.colors?.text || '#1e293b' }}>
                Report an issue
              </h3>
              <p className="text-sm text-gray-600 mb-4">What area are you having problems with?</p>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                    <select className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Billing</option>
                      <option>Technical</option>
                      <option>Account</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Security Level</label>
                    <select className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Severity 2</option>
                      <option>Severity 1</option>
                      <option>Severity 3</option>
                      <option>Severity 4</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input 
                    type="text" 
                    placeholder="I need help with..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea 
                    rows={4}
                    placeholder="Please include all information relevant to your issue."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                    Cancel
                  </button>
                  <button 
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                    style={{ backgroundColor: theme.colors?.text || '#1e293b' }}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>

            {/* Date Picker Card */}
            <div 
              className="bg-white rounded-lg shadow-md p-6"
              style={{ 
                backgroundColor: theme.colors?.background || '#ffffff',
                borderRadius: theme.borderRadius || '12px',
                boxShadow: theme.shadows?.md || '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            >
              <h3 className="text-lg font-semibold mb-2" style={{ color: theme.colors?.text || '#1e293b' }}>
                Date picker with range
              </h3>
              <p className="text-sm text-gray-600 mb-4">Select a date range</p>
              <div className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg">
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">Jan 20, 2022 - Feb 09, 2022</span>
              </div>
            </div>

            {/* Chat Interface Card */}
            <div 
              className="bg-white rounded-lg shadow-md p-6"
              style={{ 
                backgroundColor: theme.colors?.background || '#ffffff',
                borderRadius: theme.borderRadius || '12px',
                boxShadow: theme.shadows?.md || '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
            >
              <h3 className="text-lg font-semibold mb-2" style={{ color: theme.colors?.text || '#1e293b' }}>
                tweaken
              </h3>
              <p className="text-sm text-gray-600 mb-4">A visual editor for shadcn components with click to copy code. Accessible. Customizable. Open Source.</p>
              <div className="flex items-center space-x-2 mb-4">
                <svg className="h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span className="text-xs text-blue-600 font-medium">TypeScript</span>
                <svg className="h-4 w-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
                <span className="text-xs">20k</span>
                <span className="text-xs text-gray-500">Updated April 2023</span>
              </div>
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="font-medium">Hi, how can I help you today?</span>
                </div>
                <div className="bg-gray-900 text-white p-3 rounded-lg text-sm max-w-xs">
                  Hey, I&apos;m having trouble with my account.
                </div>
                <div className="text-sm text-gray-600">
                  What seems to be the problem?
                </div>
                <div className="bg-gray-900 text-white p-3 rounded-lg text-sm max-w-xs">
                  I can&apos;t log in.
                </div>
              </div>
              <div className="mt-4 flex items-center space-x-2">
                <input 
                  type="text" 
                  placeholder="Type your message..."
                  className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200">
                  <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>

          </div>
        </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}