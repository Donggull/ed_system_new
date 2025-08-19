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

export default function PricingThemePage() {
  const pathname = usePathname()
  const { theme, jsonInput, updateTheme, jsonError, loadSampleTheme } = useTheme()

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <Navigation />
        
        {/* Pricing Theme 페이지 전용 기능 헤더 */}
        <header className="sticky top-[80px] z-40 bg-gradient-to-r from-violet-50 to-purple-50 border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-lg font-bold">💰</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Pricing Theme</h2>
                    <p className="text-sm text-gray-600">구독 요금제 및 가격 테이블 컴포넌트</p>
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
                    className="px-3 py-2 bg-violet-500 text-white text-sm font-medium rounded-lg hover:bg-violet-600 transition-colors shadow-sm"
                  >
                    Flat
                  </button>
                  <button
                    onClick={() => loadSampleTheme('modern')}
                    className="px-3 py-2 bg-purple-500 text-white text-sm font-medium rounded-lg hover:bg-purple-600 transition-colors shadow-sm"
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
                  onClick={() => loadSampleTheme('vibrant')}
                  className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Vibrant
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

          {/* Pricing Components */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Pricing Header */}
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4" style={{ color: theme.colors?.text || '#1e293b' }}>
                Choose Your Plan
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Select the perfect plan for your needs. Upgrade or downgrade at any time.
              </p>
              <div className="mt-6 inline-flex items-center bg-gray-100 rounded-lg p-1">
                <button className="px-4 py-2 rounded-md bg-white shadow-sm text-sm font-medium">
                  Monthly
                </button>
                <button className="px-4 py-2 rounded-md text-sm font-medium text-gray-500">
                  Annual
                  <span className="ml-1 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                    Save 20%
                  </span>
                </button>
              </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: 'Starter',
                  price: '$9',
                  period: '/month',
                  description: 'Perfect for small projects',
                  features: ['5 Projects', '10GB Storage', 'Email Support', 'Basic Templates'],
                  popular: false,
                  cta: 'Get Started'
                },
                {
                  name: 'Professional',
                  price: '$29',
                  period: '/month',
                  description: 'Best for growing businesses',
                  features: ['25 Projects', '100GB Storage', 'Priority Support', 'Advanced Templates', 'Team Collaboration'],
                  popular: true,
                  cta: 'Start Free Trial'
                },
                {
                  name: 'Enterprise',
                  price: '$99',
                  period: '/month',
                  description: 'For large organizations',
                  features: ['Unlimited Projects', '1TB Storage', '24/7 Phone Support', 'Custom Templates', 'Advanced Analytics', 'API Access'],
                  popular: false,
                  cta: 'Contact Sales'
                }
              ].map((plan, i) => (
                <div 
                  key={i}
                  className={cn(
                    "bg-white rounded-2xl border shadow-sm p-8 relative",
                    plan.popular && "border-2 ring-2 ring-opacity-50",
                    plan.popular && "scale-105 z-10"
                  )}
                  style={{ 
                    borderRadius: theme.borderRadius || '16px',
                    borderColor: plan.popular ? theme.colors?.primary?.[500] || '#0ea5e9' : undefined,
                    boxShadow: plan.popular ? theme.shadows?.lg || '0 10px 15px -3px rgb(0 0 0 / 0.1)' : theme.shadows?.md || '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div 
                        className="px-4 py-1 rounded-full text-xs font-semibold text-white"
                        style={{ backgroundColor: theme.colors?.primary?.[500] || '#0ea5e9' }}
                      >
                        Most Popular
                      </div>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <h3 className="text-xl font-semibold mb-2" style={{ color: theme.colors?.text || '#1e293b' }}>
                      {plan.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-6">{plan.description}</p>
                    
                    <div className="mb-6">
                      <div className="flex items-baseline justify-center">
                        <span className="text-4xl font-bold" style={{ color: theme.colors?.text || '#1e293b' }}>
                          {plan.price}
                        </span>
                        <span className="text-gray-500 ml-1">{plan.period}</span>
                      </div>
                    </div>

                    <button 
                      className={cn(
                        "w-full py-3 px-4 rounded-xl font-semibold transition-all mb-6",
                        plan.popular 
                          ? "text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                          : "border-2 hover:bg-gray-50"
                      )}
                      style={plan.popular 
                        ? { backgroundColor: theme.colors?.primary?.[500] || '#0ea5e9' }
                        : { 
                            borderColor: theme.colors?.primary?.[300] || '#7dd3fc',
                            color: theme.colors?.primary?.[600] || '#0284c7'
                          }
                      }
                    >
                      {plan.cta}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <svg 
                            className="w-5 h-5" 
                            fill="currentColor" 
                            style={{ color: theme.colors?.success?.[500] || '#22c55e' }}
                            viewBox="0 0 20 20"
                          >
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* FAQ Section */}
            <div 
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8"
              style={{ borderRadius: theme.borderRadius || '16px' }}
            >
              <h3 className="text-2xl font-bold text-center mb-8" style={{ color: theme.colors?.text || '#1e293b' }}>
                Frequently Asked Questions
              </h3>
              <div className="space-y-6">
                {[
                  {
                    question: "Can I change my plan at any time?",
                    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and you'll be prorated for the difference."
                  },
                  {
                    question: "What payment methods do you accept?",
                    answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for enterprise plans."
                  },
                  {
                    question: "Is there a free trial available?",
                    answer: "Yes, we offer a 14-day free trial for all our paid plans. No credit card required to start your trial."
                  },
                  {
                    question: "What happens to my data if I cancel?",
                    answer: "Your data is retained for 30 days after cancellation. You can reactivate your account anytime within this period to restore full access."
                  }
                ].map((faq, i) => (
                  <div key={i} className="border-b border-gray-200 pb-6 last:border-b-0">
                    <h4 className="font-semibold mb-2" style={{ color: theme.colors?.text || '#1e293b' }}>
                      {faq.question}
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Enterprise CTA */}
            <div 
              className="bg-gradient-to-r from-gray-900 to-gray-700 rounded-2xl p-8 text-center text-white"
              style={{ borderRadius: theme.borderRadius || '16px' }}
            >
              <h3 className="text-2xl font-bold mb-4">Need something custom?</h3>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                Contact our sales team to discuss enterprise plans, custom integrations, and volume discounts for large organizations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-8 py-3 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                  Contact Sales
                </button>
                <button 
                  className="px-8 py-3 rounded-xl font-semibold border-2 border-white text-white hover:bg-white hover:text-gray-900 transition-colors"
                >
                  Schedule Demo
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