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
import ExportModal from '@/components/export/ExportModal'
import SaveDesignSystemModal from '@/components/design-system/SaveDesignSystemModal'
import SavedDesignSystems from '@/components/design-system/SavedDesignSystems'
import VersionHistoryModal from '@/components/design-system/VersionHistoryModal'
import ShareDesignSystemModal from '@/components/design-system/ShareDesignSystemModal'
import DiscoverDesignSystems from '@/components/design-system/DiscoverDesignSystems'
import { DesignSystem, DesignSystemVersion } from '@/types/database'
import { useDesignSystem } from '@/lib/hooks/useDesignSystem'
import { useToast } from '@/hooks/useToast'
import Toast from '@/components/ui/Toast'
import { generateCssVariables, applyCssVariables } from '@/lib/theme-utils'

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

  Input: ({ placeholder = 'Enter text...', variant = 'default', label }: any) => (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-[hsl(var(--color-secondary-700))]">
          {label}
        </label>
      )}
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
    </div>
  ),

  Modal: ({ title = 'Modal Title', children = 'Modal content goes here.' }: any) => (
    <div className="relative bg-white rounded-lg shadow-xl p-6 border border-gray-200 max-w-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <button className="text-gray-400 hover:text-gray-600 text-xl">×</button>
      </div>
      <div className="text-gray-600">{children}</div>
      <div className="flex gap-2 mt-4">
        <button className="px-4 py-2 bg-[hsl(var(--color-primary-500))] text-white rounded-lg text-sm hover:bg-[hsl(var(--color-primary-600))]">
          확인
        </button>
        <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300">
          취소
        </button>
      </div>
    </div>
  ),

  Typography: ({ variant = 'body', children }: any) => {
    const componentMap: Record<string, keyof JSX.IntrinsicElements> = {
      h1: 'h1',
      h2: 'h2', 
      h3: 'h3',
      h4: 'h4',
      body: 'p',
      small: 'span',
      code: 'code'
    }

    const classMap: Record<string, string> = {
      h1: 'text-4xl font-bold text-gray-900 leading-tight',
      h2: 'text-3xl font-bold text-gray-800 leading-tight',
      h3: 'text-2xl font-semibold text-gray-700 leading-tight',
      h4: 'text-xl font-medium text-gray-700 leading-tight',
      body: 'text-base text-gray-600 leading-relaxed',
      small: 'text-sm text-gray-500 leading-relaxed',
      code: 'font-mono text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded'
    }

    const Component = componentMap[variant] || 'p'
    const classes = classMap[variant] || classMap.body

    return React.createElement(Component, { className: classes }, children)
  },

  Badge: ({ variant = 'default', children = 'Badge' }: any) => (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      {
        'bg-[hsl(var(--color-secondary-100))] text-[hsl(var(--color-secondary-800))]': variant === 'default',
        'bg-[hsl(var(--color-primary-100))] text-[hsl(var(--color-primary-800))]': variant === 'primary',
        'bg-green-100 text-green-800': variant === 'success',
        'bg-yellow-100 text-yellow-800': variant === 'warning',
        'bg-red-100 text-red-800': variant === 'danger'
      }
    )}>
      {children}
    </span>
  ),

  Avatar: ({ size = 'md', src, name = 'User' }: any) => (
    <div className={cn(
      'rounded-full bg-[hsl(var(--color-primary-500))] flex items-center justify-center text-white font-medium',
      {
        'w-8 h-8 text-sm': size === 'sm',
        'w-12 h-12 text-base': size === 'md',
        'w-16 h-16 text-lg': size === 'lg'
      }
    )}>
      {src ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={name} className="w-full h-full rounded-full object-cover" />
        </>
      ) : (
        name.charAt(0).toUpperCase()
      )}
    </div>
  ),

  Alert: ({ variant = 'info', title = 'Alert Title', children = 'This is an alert message.' }: any) => (
    <div className={cn(
      'p-4 rounded-lg border-l-4',
      {
        'bg-blue-50 border-blue-400': variant === 'info',
        'bg-green-50 border-green-400': variant === 'success',
        'bg-yellow-50 border-yellow-400': variant === 'warning',
        'bg-red-50 border-red-400': variant === 'danger'
      }
    )}>
      <div className="flex">
        <div className="flex-shrink-0">
          <span className={cn(
            'text-sm',
            {
              'text-blue-400': variant === 'info',
              'text-green-400': variant === 'success',
              'text-yellow-400': variant === 'warning',
              'text-red-400': variant === 'danger'
            }
          )}>
            {variant === 'info' && 'ℹ️'}
            {variant === 'success' && '✅'}
            {variant === 'warning' && '⚠️'}
            {variant === 'danger' && '❌'}
          </span>
        </div>
        <div className="ml-3">
          <h3 className={cn(
            'text-sm font-medium',
            {
              'text-blue-800': variant === 'info',
              'text-green-800': variant === 'success',
              'text-yellow-800': variant === 'warning',
              'text-red-800': variant === 'danger'
            }
          )}>
            {title}
          </h3>
          <div className={cn(
            'mt-1 text-sm',
            {
              'text-blue-700': variant === 'info',
              'text-green-700': variant === 'success',
              'text-yellow-700': variant === 'warning',
              'text-red-700': variant === 'danger'
            }
          )}>
            {children}
          </div>
        </div>
      </div>
    </div>
  ),

  Checkbox: ({ label = 'Checkbox label', checked = false }: any) => (
    <label className="flex items-center space-x-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        readOnly
        className="rounded border-[hsl(var(--color-secondary-300))] text-[hsl(var(--color-primary-500))] focus:ring-[hsl(var(--color-primary-500))]"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  ),

  Switch: ({ label = 'Switch label', enabled = false }: any) => (
    <label className="flex items-center space-x-2 cursor-pointer">
      <div className={cn(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
        enabled ? 'bg-[hsl(var(--color-primary-500))]' : 'bg-gray-200'
      )}>
        <span className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
          enabled ? 'translate-x-6' : 'translate-x-1'
        )} />
      </div>
      <span className="text-sm text-gray-700">{label}</span>
    </label>
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
  const [showExportModal, setShowExportModal] = useState(false)
  const [showSaveDesignSystemModal, setShowSaveDesignSystemModal] = useState(false)
  const [showSavedDesignSystems, setShowSavedDesignSystems] = useState(false)
  const [currentDesignSystem, setCurrentDesignSystem] = useState<DesignSystem | null>(null)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [versionHistoryDesignSystem, setVersionHistoryDesignSystem] = useState<DesignSystem | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareDesignSystem, setShareDesignSystem] = useState<DesignSystem | null>(null)
  const [showDiscoverSystems, setShowDiscoverSystems] = useState(false)
  const { user } = useAuth()
  const { toast, success, error: showError, hideToast } = useToast()
  const { createVersion } = useDesignSystem()

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

  // 전체 선택
  const selectAllComponents = () => {
    const allComponentIds = allComponentTemplates.map(template => template.id)
    setSelectedComponents(allComponentIds)
    setRenderKey(prevKey => prevKey + 1)
  }

  // 전체 해제
  const deselectAllComponents = () => {
    setSelectedComponents([])
    setRenderKey(prevKey => prevKey + 1)
  }

  // 필수 컴포넌트만 선택
  const selectEssentialComponents = () => {
    const essentialComponentIds = allComponentTemplates
      .filter(template => template.category === 'essential')
      .map(template => template.id)
    setSelectedComponents(essentialComponentIds)
    setRenderKey(prevKey => prevKey + 1)
  }

  // 강제 리렌더링을 위한 상태
  const [renderKey, setRenderKey] = useState(0)

  // Design System handlers
  const handleSaveDesignSystem = () => {
    if (!user) {
      showError('로그인이 필요합니다.')
      return
    }
    setShowSaveDesignSystemModal(true)
  }

  const handleLoadDesignSystem = (designSystem: DesignSystem) => {
    // 테마 상태 복원
    themeManager.updateTheme(designSystem.theme_data as any, { animate: true })
    
    // 컴포넌트 선택 상태 복원
    setSelectedComponents(designSystem.selected_components)
    
    // 현재 디자인 시스템 설정
    setCurrentDesignSystem(designSystem)
    
    // 성공 메시지 표시
    success(`디자인 시스템 "${designSystem.name}"을 불러왔습니다!`)
    
    // 강제 리렌더링
    setRenderKey(prev => prev + 1)
  }

  const handleEditDesignSystem = (designSystem: DesignSystem) => {
    setCurrentDesignSystem(designSystem)
    setShowSaveDesignSystemModal(true)
    setShowSavedDesignSystems(false)
  }

  const handleViewVersionHistory = (designSystem: DesignSystem) => {
    setVersionHistoryDesignSystem(designSystem)
    setShowVersionHistory(true)
    setShowSavedDesignSystems(false)
  }

  const handleCreateVersion = async (changeNotes?: string) => {
    if (!versionHistoryDesignSystem || !themeState.currentTheme) return

    await createVersion(
      versionHistoryDesignSystem.id,
      themeState.currentTheme as any,
      selectedComponents,
      {}, // component_settings - v2에서는 빈 객체
      changeNotes
    )

    success('새 버전이 생성되었습니다!')
  }

  const handleLoadVersion = (version: DesignSystemVersion) => {
    // 테마 상태 복원
    themeManager.updateTheme(version.theme_data as any, { animate: true })
    
    // 컴포넌트 선택 상태 복원
    setSelectedComponents(version.selected_components)
    
    // 강제 리렌더링
    setRenderKey(prev => prev + 1)
    
    success(`버전 ${version.version_number}을 불러왔습니다!`)
  }

  const handleShareDesignSystem = (designSystem: DesignSystem) => {
    setShareDesignSystem(designSystem)
    setShowShareModal(true)
    setShowSavedDesignSystems(false)
  }

  const handleCloneDesignSystem = (designSystem: DesignSystem) => {
    // Load the cloned system into the current editor
    handleLoadDesignSystem(designSystem)
    setShowDiscoverSystems(false)
    success('Design system cloned successfully!')
  }

  const handleViewDiscoveredSystem = (designSystem: DesignSystem) => {
    // Open the shared design system page in a new tab
    if (designSystem.share_token) {
      const shareUrl = `${window.location.origin}/shared/${designSystem.share_token}`
      window.open(shareUrl, '_blank')
    }
  }

  // 컴포넌트 선택 변경 감지
  useEffect(() => {
    console.log('🔄 Component selection changed:', selectedComponents)
    setRenderKey(prev => prev + 1) // 강제 리렌더링 트리거
  }, [selectedComponents])

  // 선택된 컴포넌트 템플릿 필터링
  const selectedTemplates = useMemo(() => {
    return allComponentTemplates.filter(template => 
      selectedComponents.includes(template.id)
    )
  }, [selectedComponents])

  // 미리보기 컨텐츠 JSX (동적 렌더링)
  const renderPreviewContent = useCallback(() => {
    console.log('🎨 Rendering preview with components:', selectedComponents)
    
    return (
      <div className="space-y-6" key={`render-${renderKey}-${selectedComponents.join(',')}`}>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">실시간 테마 미리보기</h3>
          
          {/* 선택된 컴포넌트 상태 표시 */}
          <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded border border-blue-200">
            <strong>선택된 컴포넌트 ({selectedComponents.length}개):</strong> {selectedComponents.length > 0 ? selectedComponents.join(', ') : '없음'}
          </div>
          
          {/* 선택된 컴포넌트가 없을 때 */}
          {selectedComponents.length === 0 && (
            <div className="text-center py-12 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="text-gray-400 text-4xl mb-4">📦</div>
              <p className="text-gray-600 font-medium">선택된 컴포넌트가 없습니다</p>
              <p className="text-gray-500 text-sm mt-1">왼쪽에서 컴포넌트를 선택하여 미리보기를 확인하세요</p>
            </div>
          )}
          
          {/* 동적 컴포넌트 렌더링 */}
          {selectedTemplates.map((template, index) => (
            <div key={`${template.id}-${renderKey}`} className="space-y-3 border border-indigo-200 p-4 rounded-lg bg-indigo-50">
              <div className="flex items-center gap-2">
                <span className="text-indigo-600 text-lg">✅</span>
                <h4 className="font-semibold text-indigo-800">{template.name}</h4>
                <span className="text-xs bg-indigo-200 text-indigo-700 px-2 py-1 rounded-full">
                  {template.category}
                </span>
              </div>
              {template.description && (
                <p className="text-sm text-indigo-600 mb-3">{template.description}</p>
              )}
              
              {/* 컴포넌트별 미리보기 */}
              {template.id === 'button' && (
                <div className="space-y-3">
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

              {template.id === 'card' && (
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
              )}

              {template.id === 'input' && (
                <div className="space-y-3 max-w-md">
                  <PreviewComponents.Input placeholder="Default input" variant="default" label="Default Input" />
                  <PreviewComponents.Input placeholder="Filled input" variant="filled" label="Filled Input" />
                </div>
              )}

              {template.id === 'modal' && (
                <div className="flex justify-center">
                  <PreviewComponents.Modal title="예시 모달" />
                </div>
              )}

              {template.id === 'typography' && (
                <div className="space-y-3">
                  <PreviewComponents.Typography variant="h1">Heading 1</PreviewComponents.Typography>
                  <PreviewComponents.Typography variant="h2">Heading 2</PreviewComponents.Typography>
                  <PreviewComponents.Typography variant="h3">Heading 3</PreviewComponents.Typography>
                  <PreviewComponents.Typography variant="body">This is body text with normal weight and standard line height.</PreviewComponents.Typography>
                  <PreviewComponents.Typography variant="small">Small text for captions and secondary information.</PreviewComponents.Typography>
                  <PreviewComponents.Typography variant="code">const example = &apos;code text&apos;;</PreviewComponents.Typography>
                </div>
              )}

              {(template.id === 'badge' || template.name === 'Badge') && (
                <div className="flex flex-wrap gap-2">
                  <PreviewComponents.Badge variant="default">Default</PreviewComponents.Badge>
                  <PreviewComponents.Badge variant="primary">Primary</PreviewComponents.Badge>
                  <PreviewComponents.Badge variant="success">Success</PreviewComponents.Badge>
                  <PreviewComponents.Badge variant="warning">Warning</PreviewComponents.Badge>
                  <PreviewComponents.Badge variant="danger">Danger</PreviewComponents.Badge>
                </div>
              )}

              {(template.id === 'avatar' || template.name === 'Avatar') && (
                <div className="flex items-center gap-4">
                  <PreviewComponents.Avatar size="sm" name="Small" />
                  <PreviewComponents.Avatar size="md" name="Medium" />
                  <PreviewComponents.Avatar size="lg" name="Large" />
                </div>
              )}

              {(template.id === 'alert' || template.name === 'Alert') && (
                <div className="space-y-3">
                  <PreviewComponents.Alert variant="info" title="정보" />
                  <PreviewComponents.Alert variant="success" title="성공" />
                  <PreviewComponents.Alert variant="warning" title="경고" />
                  <PreviewComponents.Alert variant="danger" title="오류" />
                </div>
              )}

              {(template.id === 'checkbox' || template.name === 'Checkbox') && (
                <div className="space-y-2">
                  <PreviewComponents.Checkbox label="체크박스 옵션 1" />
                  <PreviewComponents.Checkbox label="체크박스 옵션 2" checked={true} />
                </div>
              )}

              {(template.id === 'switch' || template.name === 'Switch') && (
                <div className="space-y-2">
                  <PreviewComponents.Switch label="스위치 옵션 1" />
                  <PreviewComponents.Switch label="스위치 옵션 2" enabled={true} />
                </div>
              )}

              {(template.id === 'toast' || template.name === 'Toast') && (
                <div className="space-y-2">
                  <PreviewComponents.Alert variant="success" title="토스트 알림">작업이 성공적으로 완료되었습니다.</PreviewComponents.Alert>
                </div>
              )}

              {(template.id === 'loading-spinner' || template.name === 'Loading Spinner') && (
                <div className="flex items-center justify-center p-8">
                  <div className="w-8 h-8 border-4 border-[hsl(var(--color-primary-500))] border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}

              {(template.id === 'tabs' || template.name === 'Tabs') && (
                <div className="space-y-4">
                  <div className="flex space-x-1 border-b">
                    <button className="px-4 py-2 text-sm font-medium border-b-2 border-[hsl(var(--color-primary-500))] text-[hsl(var(--color-primary-600))]">탭 1</button>
                    <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">탭 2</button>
                    <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">탭 3</button>
                  </div>
                  <div className="p-4 bg-gray-50 rounded">
                    <p className="text-sm text-gray-600">탭 1의 내용입니다.</p>
                  </div>
                </div>
              )}

              {/* 기타 컴포넌트들을 위한 기본 미리보기 */}
              {!['button', 'card', 'input', 'modal', 'typography', 'badge', 'avatar', 'alert', 'checkbox', 'switch', 'toast', 'loading-spinner', 'tabs'].includes(template.id) && 
               !['Badge', 'Avatar', 'Alert', 'Checkbox', 'Switch', 'Toast', 'Loading Spinner', 'Tabs'].includes(template.name) && (
                <div className="p-4 bg-white rounded border border-gray-200">
                  <p className="text-sm text-gray-600">
                    <strong>{template.name}</strong> 컴포넌트 미리보기
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    이 컴포넌트는 생성된 코드에 포함됩니다.
                  </p>
                </div>
              )}
            </div>
          ))}
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
  }, [selectedComponents, renderKey, selectedTemplates])

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
        <header className="sticky top-[80px] z-40 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-lg font-bold">v2</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">디자인 시스템 생성기 v2</h2>
                    <p className="text-sm text-gray-600">실시간 테마 편집 및 컴포넌트 미리보기</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                {/* 저장/로드 버튼들 */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveDesignSystem}
                    className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
                  >
                    💾 저장
                  </button>
                  <button
                    onClick={() => setShowSavedDesignSystems(true)}
                    className="px-4 py-2 bg-white text-purple-600 text-sm font-medium rounded-lg border border-purple-200 hover:bg-purple-50 transition-colors shadow-sm"
                  >
                    📁 불러오기
                  </button>
                  <button
                    onClick={() => setShowDiscoverSystems(true)}
                    className="px-4 py-2 bg-white text-blue-600 text-sm font-medium rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors shadow-sm"
                  >
                    🌐 둘러보기
                  </button>
                </div>

                {/* 테마 상태 */}
                <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className={cn(
                    'w-3 h-3 rounded-full animate-pulse',
                    themeState.isValid ? 'bg-green-500' : 'bg-red-500'
                  )}></div>
                  <span className={cn(
                    'text-sm font-medium',
                    themeState.isValid ? 'text-green-700' : 'text-red-700'
                  )}>
                    {themeState.isValid ? '테마 정상' : '테마 오류'}
                  </span>
                </div>
                
                {/* 선택된 컴포넌트 수 */}
                <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">
                    컴포넌트 {selectedComponents.length}개 선택
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* 메인 레이아웃 */}
        <div className="flex h-[calc(100vh-160px)]">
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">컴포넌트 선택</h3>
                <button
                  onClick={() => setShowExportModal(true)}
                  disabled={selectedComponents.length === 0}
                  className={cn(
                    "px-3 py-1 text-sm rounded-md font-medium transition-colors",
                    selectedComponents.length > 0
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  )}
                  title={selectedComponents.length === 0 ? "컴포넌트를 선택해주세요" : "선택된 컴포넌트 내보내기"}
                >
                  {selectedComponents.length > 0 ? `내보내기 (${selectedComponents.length})` : '내보내기'}
                </button>
              </div>

              {/* 컴포넌트 선택 버튼들 */}
              <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                <button
                  onClick={selectAllComponents}
                  className="px-3 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  title="모든 컴포넌트 선택"
                >
                  전체 선택
                </button>
                <button
                  onClick={deselectAllComponents}
                  className="px-3 py-1 text-xs bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                  title="모든 컴포넌트 선택 해제"
                >
                  전체 해제
                </button>
                <button
                  onClick={selectEssentialComponents}
                  className="px-3 py-1 text-xs bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
                  title="필수 컴포넌트만 선택"
                >
                  필수 선택
                </button>
              </div>
              
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

        {/* Export Modal */}
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          selectedComponents={selectedTemplates}
          theme={themeState.currentTheme}
          projectName="My Design System"
        />

        {/* Toast Notifications */}
        <Toast 
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={hideToast}
        />

        {/* Save Design System Modal */}
        <SaveDesignSystemModal
          isOpen={showSaveDesignSystemModal}
          onClose={() => {
            setShowSaveDesignSystemModal(false)
            setCurrentDesignSystem(null)
          }}
          themeData={themeState.currentTheme as any}
          selectedComponents={selectedComponents}
          componentSettings={{}}
          existingDesignSystem={currentDesignSystem ? {
            id: currentDesignSystem.id,
            name: currentDesignSystem.name,
            description: currentDesignSystem.description,
            tags: currentDesignSystem.tags,
            is_public: currentDesignSystem.is_public
          } : undefined}
        />

        {/* Saved Design Systems Modal */}
        <SavedDesignSystems
          isOpen={showSavedDesignSystems}
          onClose={() => setShowSavedDesignSystems(false)}
          onLoadDesignSystem={handleLoadDesignSystem}
          onEditDesignSystem={handleEditDesignSystem}
          onViewVersionHistory={handleViewVersionHistory}
          onShareDesignSystem={handleShareDesignSystem}
        />

        {/* Version History Modal */}
        {versionHistoryDesignSystem && (
          <VersionHistoryModal
            isOpen={showVersionHistory}
            onClose={() => {
              setShowVersionHistory(false)
              setVersionHistoryDesignSystem(null)
            }}
            designSystem={versionHistoryDesignSystem}
            onLoadVersion={handleLoadVersion}
            onCreateVersion={handleCreateVersion}
          />
        )}

        {/* Share Modal */}
        {shareDesignSystem && (
          <ShareDesignSystemModal
            isOpen={showShareModal}
            onClose={() => {
              setShowShareModal(false)
              setShareDesignSystem(null)
            }}
            designSystem={shareDesignSystem}
          />
        )}

        {/* Discover Design Systems Modal */}
        <DiscoverDesignSystems
          isOpen={showDiscoverSystems}
          onClose={() => setShowDiscoverSystems(false)}
          onCloneDesignSystem={handleCloneDesignSystem}
          onViewDesignSystem={handleViewDiscoveredSystem}
        />

        <Toast toast={toast} onClose={hideToast} />
      </div>
    </ProtectedRoute>
  )
}