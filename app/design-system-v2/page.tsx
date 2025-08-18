'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Navigation from '@/components/Navigation'
import ThemeEditor from '@/components/editor/ThemeEditor'
import EnhancedPreview from '@/components/preview/EnhancedPreview'
import ResponsivePreview from '@/components/preview/ResponsivePreview'
import { themeManager, ThemeState } from '@/lib/theme-manager'
import { DEFAULT_THEME } from '@/lib/theme-parser'
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
  const [selectedComponents, setSelectedComponents] = useState<string[]>(() => {
    // 필수 컴포넌트들을 기본 선택
    return allComponentTemplates
      .filter(template => template.category === 'essential')
      .slice(0, 3) // 처음 3개만 선택
      .map(template => template.id)
  })
  const [viewMode, setViewMode] = useState<'enhanced' | 'responsive'>('enhanced')
  const [themeState, setThemeState] = useState<ThemeState>(themeManager.getState())
  const [themeErrors, setThemeErrors] = useState<string[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const { user } = useAuth()

  // 컴포넌트 마운트 시 테마 초기화
  useEffect(() => {
    // 기본 테마로 초기화 및 CSS 변수 강제 주입
    themeManager.updateTheme(DEFAULT_THEME, { animate: false })
    
    // CSS 변수가 제대로 적용되는지 확인하기 위한 약간의 지연
    setTimeout(() => {
      setIsInitialized(true)
    }, 100)
  }, [])

  // 테마 상태 구독
  useEffect(() => {
    const unsubscribe = themeManager.subscribe((newState) => {
      setThemeState(newState)
      
      // 테마 변경 시 컴포넌트 강제 리렌더링을 위한 상태 업데이트
      if (newState.isValid) {
        // CSS 변수가 적용될 시간을 주기 위한 짧은 지연
        setTimeout(() => {
          setIsInitialized(prev => !prev ? prev : true) // 이미 true면 그대로, false면 true로
        }, 50)
      }
    })
    return unsubscribe
  }, [])

  // 컴포넌트 선택 변경 감지 및 리렌더링
  useEffect(() => {
    // 컴포넌트 선택이 변경되면 미리보기를 다시 렌더링하기 위해 상태 업데이트
    if (isInitialized) {
      console.log('Selected components changed:', selectedComponents)
    }
  }, [selectedComponents, isInitialized])

  // 컴포넌트 선택 토글
  const toggleComponent = (componentId: string) => {
    console.log('Toggling component:', componentId)
    setSelectedComponents(prev => {
      const newSelection = prev.includes(componentId)
        ? prev.filter(id => id !== componentId)
        : [...prev, componentId]
      console.log('New selectedComponents:', newSelection)
      // 강제 리렌더링을 위해 renderKey도 즉시 업데이트
      setRenderKey(prevKey => prevKey + 1)
      return newSelection
    })
  }

  // 선택된 컴포넌트 템플릿 필터링
  const selectedTemplates = allComponentTemplates.filter(template => 
    selectedComponents.includes(template.id)
  )

  // 강제 리렌더링을 위한 상태
  const [renderKey, setRenderKey] = useState(0)

  // 컴포넌트 선택 변경 감지
  useEffect(() => {
    console.log('🔄 Component selection changed:', selectedComponents)
    setRenderKey(prev => prev + 1) // 강제 리렌더링 트리거
  }, [selectedComponents])

  // 미리보기 컨텐츠 JSX (조건부 렌더링)
  const renderPreviewContent = useCallback(() => {
    console.log('🎨 Rendering preview with components:', selectedComponents)
    
    return (
      <div className="space-y-6" key={`render-${renderKey}-${selectedComponents.join(',')}`}>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">실시간 테마 미리보기</h3>
          
          {/* 선택된 컴포넌트 상태 표시 */}
          <div className="text-xs text-gray-500 bg-yellow-100 p-3 rounded border">
            <strong>현재 선택된 컴포넌트:</strong> {selectedComponents.length > 0 ? selectedComponents.join(', ') : '없음'}
            <br />
            <strong>렌더링 키:</strong> {renderKey}
          </div>
          
          {/* 디버그 정보 */}
          {selectedComponents.length === 0 && (
            <div className="text-center py-8 bg-red-50 border border-red-200 rounded">
              <p className="text-red-600 font-medium">선택된 컴포넌트가 없습니다.</p>
              <p className="text-red-500 text-sm">좌측에서 컴포넌트를 선택해주세요.</p>
            </div>
          )}
          
          {/* 버튼 컴포넌트들 */}
          {selectedComponents.includes('button') && (
            <div className="space-y-3 border border-green-200 p-4 rounded bg-green-50">
              <h4 className="font-medium text-gray-700 text-green-800">✅ Button 컴포넌트</h4>
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
            <div className="space-y-3 border border-blue-200 p-4 rounded bg-blue-50">
              <h4 className="font-medium text-gray-700 text-blue-800">✅ Card 컴포넌트</h4>
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
            <div className="space-y-3 border border-purple-200 p-4 rounded bg-purple-50">
              <h4 className="font-medium text-gray-700 text-purple-800">✅ Input 컴포넌트</h4>
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
  }, [selectedComponents, renderKey])

  // 초기화 중일 때 로딩 표시
  if (!isInitialized) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">테마 시스템 초기화 중...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <Navigation />
        
        {/* v2 페이지 전용 기능 헤더 */}
        <header className="sticky top-[80px] z-40 bg-white border-b border-gray-200">
          <div className="px-6 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">디자인 시스템 v2</h2>
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
              </div>
            </div>
          </div>
        </header>

        {/* 메인 레이아웃 */}
        <div className="flex h-[calc(100vh-140px)]">
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
              <div className="flex-1" key={`preview-area-${renderKey}-${selectedComponents.join('-')}`}>
                {viewMode === 'enhanced' ? (
                  <EnhancedPreview componentName="Design System" key={`enhanced-${renderKey}`}>
                    {renderPreviewContent()}
                  </EnhancedPreview>
                ) : (
                  <ResponsivePreview key={`responsive-${renderKey}`}>
                    {renderPreviewContent()}
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