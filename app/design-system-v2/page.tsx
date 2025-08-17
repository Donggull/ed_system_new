'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import ThemeEditor from '@/components/editor/ThemeEditor'
import EnhancedPreview from '@/components/preview/EnhancedPreview'
import ResponsivePreview from '@/components/preview/ResponsivePreview'
import { themeManager, ThemeState } from '@/lib/theme-manager'
import { allComponentTemplates } from '@/lib/component-templates'
import { ComponentTemplate } from '@/types/database'
import { cn } from '@/lib/utils'
import { ThemeErrorBoundary } from '@/components/ui/ErrorBoundary'

// 컴포넌트 미리보기를 위한 예시 컴포넌트들
const PreviewComponents = {
  Button: ({ variant = 'primary', size = 'md', children = 'Button' }: any) => (
    <button 
      className={cn(
        'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        {
          'bg-[hsl(var(--color-primary-500))] text-white hover:bg-[hsl(var(--color-primary-600))]': variant === 'primary',
          'bg-[hsl(var(--color-secondary-200))] text-[hsl(var(--color-secondary-900))] hover:bg-[hsl(var(--color-secondary-300))]': variant === 'secondary',
          'border border-[hsl(var(--color-primary-500))] text-[hsl(var(--color-primary-500))] hover:bg-[hsl(var(--color-primary-50))]': variant === 'outline',
          'text-[hsl(var(--color-primary-500))] hover:bg-[hsl(var(--color-primary-50))]': variant === 'ghost'
        },
        {
          'h-8 px-3 text-sm rounded-md': size === 'sm',
          'h-10 px-4 text-base rounded-lg': size === 'md',
          'h-12 px-6 text-lg rounded-lg': size === 'lg'
        }
      )}
    >
      {children}
    </button>
  ),

  Card: ({ children, variant = 'default' }: any) => (
    <div className={cn(
      'rounded-lg p-6',
      {
        'bg-white': variant === 'default',
        'bg-white border border-[hsl(var(--color-secondary-300))]': variant === 'outlined',
        'bg-white shadow-lg': variant === 'elevated'
      }
    )}>
      {children}
    </div>
  ),

  Input: ({ placeholder = 'Enter text...', variant = 'default' }: any) => (
    <input
      type="text"
      placeholder={placeholder}
      className={cn(
        'w-full h-10 px-4 text-base rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1',
        {
          'border-[hsl(var(--color-secondary-300))] bg-white focus:border-[hsl(var(--color-primary-500))] focus:ring-[hsl(var(--color-primary-500))]': variant === 'default',
          'border-transparent bg-[hsl(var(--color-secondary-100))] focus:bg-white focus:border-[hsl(var(--color-primary-500))] focus:ring-[hsl(var(--color-primary-500))]': variant === 'filled'
        }
      )}
    />
  )
}

export default function DesignSystemV2() {
  const [selectedComponents, setSelectedComponents] = useState<string[]>(['button', 'card', 'input'])
  const [viewMode, setViewMode] = useState<'enhanced' | 'responsive'>('enhanced')
  const [themeState, setThemeState] = useState<ThemeState>(themeManager.getState())
  const [themeErrors, setThemeErrors] = useState<string[]>([])
  const { user } = useAuth()

  // 테마 상태 구독
  useEffect(() => {
    const unsubscribe = themeManager.subscribe((newState) => {
      setThemeState(newState)
    })
    return unsubscribe
  }, [])

  // 컴포넌트 선택 토글
  const toggleComponent = (componentId: string) => {
    setSelectedComponents(prev => 
      prev.includes(componentId)
        ? prev.filter(id => id !== componentId)
        : [...prev, componentId]
    )
  }

  // 선택된 컴포넌트 템플릿 필터링
  const selectedTemplates = allComponentTemplates.filter(template => 
    selectedComponents.includes(template.id)
  )

  // 미리보기 컴포넌트 렌더링
  const renderPreviewComponents = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">실시간 테마 미리보기</h3>
        
        {/* 버튼 컴포넌트들 */}
        {selectedComponents.includes('button') && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700">Button 컴포넌트</h4>
            <div className="flex flex-wrap gap-2">
              <PreviewComponents.Button variant="primary" size="sm">Primary</PreviewComponents.Button>
              <PreviewComponents.Button variant="secondary" size="sm">Secondary</PreviewComponents.Button>
              <PreviewComponents.Button variant="outline" size="sm">Outline</PreviewComponents.Button>
              <PreviewComponents.Button variant="ghost" size="sm">Ghost</PreviewComponents.Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <PreviewComponents.Button variant="primary" size="md">Medium</PreviewComponents.Button>
              <PreviewComponents.Button variant="primary" size="lg">Large</PreviewComponents.Button>
            </div>
          </div>
        )}

        {/* 카드 컴포넌트들 */}
        {selectedComponents.includes('card') && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700">Card 컴포넌트</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <PreviewComponents.Card variant="default">
                <h5 className="font-semibold mb-2">Default Card</h5>
                <p className="text-sm text-gray-600">This is a default card with basic styling.</p>
              </PreviewComponents.Card>
              <PreviewComponents.Card variant="outlined">
                <h5 className="font-semibold mb-2">Outlined Card</h5>
                <p className="text-sm text-gray-600">This card has a border outline.</p>
              </PreviewComponents.Card>
              <PreviewComponents.Card variant="elevated">
                <h5 className="font-semibold mb-2">Elevated Card</h5>
                <p className="text-sm text-gray-600">This card has shadow elevation.</p>
              </PreviewComponents.Card>
            </div>
          </div>
        )}

        {/* 입력 컴포넌트들 */}
        {selectedComponents.includes('input') && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700">Input 컴포넌트</h4>
            <div className="space-y-2 max-w-md">
              <PreviewComponents.Input placeholder="Default input" variant="default" />
              <PreviewComponents.Input placeholder="Filled input" variant="filled" />
            </div>
          </div>
        )}
      </div>

      {/* 타이포그래피 미리보기 */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-700">Typography</h4>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">Heading 1</h1>
          <h2 className="text-3xl font-bold text-gray-800">Heading 2</h2>
          <h3 className="text-2xl font-semibold text-gray-700">Heading 3</h3>
          <p className="text-base text-gray-600">Body text with normal weight and standard line height.</p>
          <p className="text-sm text-gray-500">Small text for captions and secondary information.</p>
        </div>
      </div>

      {/* 색상 팔레트 */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-700">Color Palette</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="text-sm font-medium">Primary</div>
            <div className="grid grid-cols-5 gap-1">
              {['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'].map(shade => (
                <div
                  key={shade}
                  className="aspect-square rounded"
                  style={{ backgroundColor: `hsl(var(--color-primary-${shade}))` }}
                  title={`Primary ${shade}`}
                />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Secondary</div>
            <div className="grid grid-cols-5 gap-1">
              {['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'].map(shade => (
                <div
                  key={shade}
                  className="aspect-square rounded"
                  style={{ backgroundColor: `hsl(var(--color-secondary-${shade}))` }}
                  title={`Secondary ${shade}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* 헤더 */}
        <header className="bg-white border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Design System Generator v2</h1>
                <p className="text-sm text-gray-600">실시간 테마 편집 및 미리보기</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    'w-3 h-3 rounded-full',
                    themeState.isValid ? 'bg-green-500' : 'bg-red-500'
                  )}></div>
                  <span className="text-sm font-medium">
                    {themeState.isValid ? '테마 적용됨' : '테마 오류'}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  사용자: {user?.email}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* 메인 레이아웃 */}
        <div className="flex h-[calc(100vh-80px)]">
          {/* 왼쪽: 테마 에디터 */}
          <div className="w-1/3 border-r border-gray-200 bg-white">
            <ThemeErrorBoundary onThemeError={(error) => setThemeErrors([error.message])}>
              <ThemeEditor 
                onThemeChange={(theme) => {
                  // 테마 변경 처리는 ThemeManager에서 자동으로 처리됨
                }}
                onError={setThemeErrors}
              />
            </ThemeErrorBoundary>
          </div>

          {/* 가운데: 컴포넌트 선택 */}
          <div className="w-1/4 border-r border-gray-200 bg-white overflow-auto">
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4">컴포넌트 선택</h3>
              
              {/* 필수 컴포넌트 */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">필수 컴포넌트</h4>
                <div className="space-y-2">
                  {allComponentTemplates
                    .filter(template => template.category === 'essential')
                    .map((template) => (
                      <label key={template.id} className="flex items-center gap-2 p-2 rounded border hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={selectedComponents.includes(template.id)}
                          onChange={() => toggleComponent(template.id)}
                          className="rounded"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{template.name}</div>
                          <div className="text-xs text-gray-500">{template.description}</div>
                        </div>
                      </label>
                    ))}
                </div>
              </div>

              {/* 선택적 컴포넌트 */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">선택적 컴포넌트</h4>
                <div className="space-y-2">
                  {allComponentTemplates
                    .filter(template => template.category === 'optional')
                    .slice(0, 10) // 처음 10개만 표시
                    .map((template) => (
                      <label key={template.id} className="flex items-center gap-2 p-2 rounded border hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={selectedComponents.includes(template.id)}
                          onChange={() => toggleComponent(template.id)}
                          className="rounded"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{template.name}</div>
                          <div className="text-xs text-gray-500">{template.description}</div>
                        </div>
                      </label>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* 오른쪽: 미리보기 */}
          <div className="flex-1 bg-white">
            <div className="h-full flex flex-col">
              {/* 미리보기 모드 선택 */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">미리보기 모드:</span>
                  <button
                    onClick={() => setViewMode('enhanced')}
                    className={cn(
                      'px-3 py-1 text-sm rounded-md transition-colors',
                      viewMode === 'enhanced'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    )}
                  >
                    고급 미리보기
                  </button>
                  <button
                    onClick={() => setViewMode('responsive')}
                    className={cn(
                      'px-3 py-1 text-sm rounded-md transition-colors',
                      viewMode === 'responsive'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    )}
                  >
                    반응형 미리보기
                  </button>
                </div>
              </div>

              {/* 미리보기 영역 */}
              <div className="flex-1">
                {viewMode === 'enhanced' ? (
                  <EnhancedPreview componentName="Design System">
                    {renderPreviewComponents()}
                  </EnhancedPreview>
                ) : (
                  <ResponsivePreview>
                    {renderPreviewComponents()}
                  </ResponsivePreview>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 오류 토스트 */}
        {themeErrors.length > 0 && (
          <div className="fixed bottom-4 left-4 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg z-50">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 text-red-500 flex-shrink-0">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-800">테마 오류</h4>
                <ul className="text-sm text-red-700 mt-1">
                  {themeErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => setThemeErrors([])}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}