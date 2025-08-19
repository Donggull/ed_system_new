'use client'

import { useState, useEffect } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline'

export default function CardThemePage() {
  const [theme, setTheme] = useState({
    colors: {
      primary: { 50: '#f0f9ff', 100: '#e0f2fe', 500: '#0ea5e9', 600: '#0284c7', 900: '#0c4a6e' },
      secondary: { 50: '#fafafa', 100: '#f4f4f5', 500: '#71717a', 600: '#52525b', 900: '#18181b' },
      success: { 50: '#f0fdf4', 500: '#22c55e', 600: '#16a34a' },
      warning: { 50: '#fffbeb', 500: '#f59e0b', 600: '#d97706' },
      error: { 50: '#fef2f2', 500: '#ef4444', 600: '#dc2626' },
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#1e293b'
    },
    borderRadius: '12px',
    spacing: '16px',
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
    }
  })

  const [jsonInput, setJsonInput] = useState(JSON.stringify(theme, null, 2))

  useEffect(() => {
    try {
      const parsed = JSON.parse(jsonInput)
      setTheme(parsed)
      
      // Apply CSS variables
      const root = document.documentElement
      if (parsed.colors) {
        Object.entries(parsed.colors).forEach(([key, value]) => {
          if (typeof value === 'object') {
            Object.entries(value).forEach(([shade, color]) => {
              root.style.setProperty(`--color-${key}-${shade}`, color)
            })
          } else {
            root.style.setProperty(`--color-${key}`, value)
          }
        })
      }
      if (parsed.borderRadius) {
        root.style.setProperty('--border-radius', parsed.borderRadius)
      }
      if (parsed.spacing) {
        root.style.setProperty('--spacing', parsed.spacing)
      }
    } catch (e) {
      // Invalid JSON, keep previous theme
    }
  }, [jsonInput])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Card Theme Generator</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Theme Editor */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-4">Theme Configuration</h2>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm"
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
                  <ChevronLeftIcon className="h-5 w-5 text-gray-400" />
                  <ChevronRightIcon className="h-5 w-5 text-gray-400" />
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
                <MinusIcon className="h-8 w-8 p-2 rounded-full bg-gray-100 cursor-pointer" />
                <div className="text-center">
                  <div className="text-4xl font-bold" style={{ color: theme.colors?.primary?.[500] || '#0ea5e9' }}>
                    350
                  </div>
                  <div className="text-sm text-gray-500">CALORIES/DAY</div>
                </div>
                <PlusIcon className="h-8 w-8 p-2 rounded-full bg-gray-100 cursor-pointer" />
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

          </div>
        </div>
      </div>
    </div>
  )
}