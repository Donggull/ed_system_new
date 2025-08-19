'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Navigation from '@/components/Navigation'
import AIRecommendations from '@/components/ai/AIRecommendations'
import CollaborationHub from '@/components/collaboration/CollaborationHub'
import PerformanceHub from '@/components/performance/PerformanceHub'
import ToolsHub from '@/components/tools/ToolsHub'
import { allComponentTemplates } from '@/lib/component-templates'
import { parseThemeJson, generateCssVariables, applyCssVariables } from '@/lib/theme-utils'
import { useToast } from '@/hooks/useToast'
import Toast from '@/components/ui/Toast'

// JSON 스키마 타입 정의
interface ThemeColors {
  primary: string
  secondary: string
  success: string
  warning: string
  danger: string
  info: string
  light: string
  dark: string
}

interface ThemeTypography {
  fontFamily: string
  fontSize: {
    xs: string
    sm: string
    base: string
    lg: string
    xl: string
    '2xl': string
    '3xl': string
    '4xl': string
  }
  fontWeight: {
    normal: number
    medium: number
    semibold: number
    bold: number
  }
  lineHeight: {
    tight: number
    normal: number
    relaxed: number
  }
}

interface ThemeSpacing {
  xs: string
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
  '3xl': string
  '4xl': string
}

interface ThemeBorderRadius {
  none: string
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
  full: string
}

interface ThemeShadows {
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
}

interface DesignTheme {
  colors: ThemeColors
  typography: ThemeTypography
  spacing: ThemeSpacing
  borderRadius: ThemeBorderRadius
  shadows: ThemeShadows
}

// 기본 테마 템플릿
const defaultTheme: DesignTheme = {
  colors: {
    primary: '#3B82F6',
    secondary: '#6B7280',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    info: '#06B6D4',
    light: '#F8FAFC',
    dark: '#1F2937'
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '6rem'
  },
  borderRadius: {
    none: '0',
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    full: '9999px'
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)'
  }
}

export default function DesignSystemPage() {
  const { user } = useAuth()
  const [theme, setTheme] = useState<DesignTheme>(defaultTheme)
  const [jsonInput, setJsonInput] = useState(JSON.stringify(defaultTheme, null, 2))
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  
  // Advanced features state
  const [showAIRecommendations, setShowAIRecommendations] = useState(false)
  const [showCollaboration, setShowCollaboration] = useState(false)
  const [showPerformance, setShowPerformance] = useState(false)
  const [showTools, setShowTools] = useState(false)

  // 컴포넌트 마운트 시 메인 페이지 데이터 확인
  useEffect(() => {
    const checkMainPageTheme = () => {
      const mainThemeData = localStorage.getItem('main-theme-data')
      const mainThemeJson = localStorage.getItem('main-theme-json')
      
      if (mainThemeData && mainThemeJson) {
        try {
          // 메인 페이지 테마를 v2 형식으로 변환
          const mainTheme = JSON.parse(mainThemeData)
          const convertedJson = convertMainThemeToV2Format(mainTheme)
          
          setJsonInput(convertedJson)
          const parsed = validateAndParseJson(convertedJson)
          if (parsed) {
            setTheme(parsed)
          }
          
          // 사용 후 localStorage 정리
          localStorage.removeItem('main-theme-data')
          localStorage.removeItem('main-theme-json')
          
          console.log('메인 페이지 테마가 v2 형식으로 변환되어 적용되었습니다!')
        } catch (error) {
          console.error('Main theme conversion error:', error)
        }
      }
    }

    checkMainPageTheme()
    
    // focus 이벤트에서도 확인
    const handleFocus = () => checkMainPageTheme()
    window.addEventListener('focus', handleFocus)
    
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  // 메인 페이지 테마를 v2 형식으로 변환하는 함수
  const convertMainThemeToV2Format = (mainTheme: any): string => {
    const v2Theme = {
      colors: {
        primary: mainTheme.colors?.primary?.['500'] || '#6C63FF',
        primaryDark: mainTheme.colors?.primary?.['700'] || '#4A3FFF',
        secondary: mainTheme.colors?.secondary?.['200'] || '#E9E6FF',
        secondaryMedium: mainTheme.colors?.secondary?.['400'] || '#C9C5FF',
        accent: mainTheme.colors?.success?.['500'] || '#FF6B9D',
        background: '#FBFAFF',
        foreground: '#1E1B2E',
        muted: '#F5F3FF',
        mutedForeground: '#7C7A99',
        border: '#E2E0F0',
        input: '#E2E0F0',
        ring: mainTheme.colors?.primary?.['500'] || '#6C63FF',
        destructive: mainTheme.colors?.error?.['500'] || '#E63946',
        destructiveForeground: '#ffffff'
      },
      typography: {
        fontFamily: {
          primary: mainTheme.typography?.fontFamily?.sans?.[0] || 'Pretendard Variable, sans-serif',
          heading: 'Manrope, sans-serif',
          accent: 'Noto Serif KR, serif',
          display: 'Custom Brutalist, sans-serif'
        },
        fontSize: mainTheme.typography?.fontSize || {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem'
        },
        fontWeight: {
          light: '300',
          normal: '400',
          medium: '500',
          semibold: '600',
          bold: '700'
        }
      }
    }
    
    return JSON.stringify(v2Theme, null, 2)
  }
  
  const { toast, success, error: showError, hideToast } = useToast()

  // JSON 유효성 검증 및 파싱
  const validateAndParseJson = useCallback((jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString)
      
      // 기본 구조 검증
      if (!parsed.colors || !parsed.typography || !parsed.spacing || !parsed.borderRadius || !parsed.shadows) {
        throw new Error('필수 속성이 누락되었습니다: colors, typography, spacing, borderRadius, shadows')
      }
      
      setJsonError(null)
      return parsed as DesignTheme
    } catch (error) {
      setJsonError(error instanceof Error ? error.message : '유효하지 않은 JSON 형식입니다.')
      return null
    }
  }, [])

  // JSON 입력 핸들러
  const handleJsonChange = useCallback((value: string) => {
    setJsonInput(value)
    const parsed = validateAndParseJson(value)
    if (parsed) {
      setTheme(parsed)
    }
  }, [validateAndParseJson])

  // Convert v2 theme to main page theme format
  const convertToThemeData = useCallback((designTheme: DesignTheme) => {
    return {
      name: 'V2 Design System',
      colors: {
        primary: {
          '50': '#eff6ff',
          '100': '#dbeafe',
          '200': '#bfdbfe',
          '300': '#93c5fd',
          '400': '#60a5fa',
          '500': designTheme.colors.primary,
          '600': '#2563eb',
          '700': '#1d4ed8',
          '800': '#1e40af',
          '900': '#1e3a8a',
        },
        secondary: {
          '50': '#f8fafc',
          '100': '#f1f5f9',
          '200': '#e2e8f0',
          '300': '#cbd5e1',
          '400': '#94a3b8',
          '500': designTheme.colors.secondary,
          '600': '#475569',
          '700': '#334155',
          '800': '#1e293b',
          '900': '#0f172a',
        }
      },
      typography: {
        fontFamily: {
          sans: [designTheme.typography.fontFamily, 'system-ui', 'sans-serif'],
          mono: ['JetBrains Mono', 'monospace']
        },
        fontSize: designTheme.typography.fontSize
      },
      spacing: designTheme.spacing,
      borderRadius: designTheme.borderRadius
    }
  }, [])

  // 테마 적용 핸들러
  const handleApplyTheme = useCallback(() => {
    const parsed = validateAndParseJson(jsonInput)
    if (parsed) {
      setTheme(parsed)
      
      // 메인 페이지와 연동을 위해 localStorage에 저장
      const convertedTheme = convertToThemeData(parsed)
      localStorage.setItem('shared-theme-data', JSON.stringify(convertedTheme))
      localStorage.setItem('shared-theme-json', jsonInput)
      
      console.log('테마 적용됨:', parsed)
      console.log('변환된 테마:', convertedTheme)
    }
  }, [jsonInput, validateAndParseJson, convertToThemeData])

  // 예시 템플릿 로드
  const loadTemplate = useCallback((templateName: string) => {
    let template: DesignTheme
    
    switch (templateName) {
      case 'dark':
        template = {
          ...defaultTheme,
          colors: {
            ...defaultTheme.colors,
            primary: '#8B5CF6',
            secondary: '#64748B',
            light: '#1E293B',
            dark: '#0F172A'
          }
        }
        break
      case 'minimal':
        template = {
          ...defaultTheme,
          colors: {
            ...defaultTheme.colors,
            primary: '#000000',
            secondary: '#666666',
            success: '#22C55E',
            warning: '#EAB308',
            danger: '#DC2626',
            info: '#0EA5E9'
          },
          borderRadius: {
            ...defaultTheme.borderRadius,
            sm: '0',
            md: '0',
            lg: '0',
            xl: '0',
            '2xl': '0'
          }
        }
        break
      case 'colorful':
        template = {
          ...defaultTheme,
          colors: {
            primary: '#FF6B6B',
            secondary: '#4ECDC4',
            success: '#45B7D1',
            warning: '#FFA07A',
            danger: '#FF6B9D',
            info: '#98D8C8',
            light: '#F7F9FC',
            dark: '#2C3E50'
          }
        }
        break
      default:
        template = defaultTheme
    }
    
    const jsonString = JSON.stringify(template, null, 2)
    setJsonInput(jsonString)
    setTheme(template)
  }, [])

  // Advanced features handlers
  const handleAIThemeUpdate = useCallback((updatedTheme: Partial<any>) => {
    try {
      const mergedTheme = { ...theme, ...updatedTheme }
      setTheme(mergedTheme)
      setJsonInput(JSON.stringify(mergedTheme, null, 2))
      success('AI 추천이 적용되었습니다!')
    } catch (error) {
      console.error('AI theme update failed:', error)
      showError('AI 추천 적용 중 오류가 발생했습니다.')
    }
  }, [theme, success, showError])

  return (
    <ProtectedRoute>
      <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
        {/* Navigation */}
        <Navigation />
        
        {/* v1 페이지 전용 기능 헤더 */}
        <div className={`sticky top-[80px] z-40 backdrop-blur-xl border-b transition-colors ${
          isDarkMode 
            ? 'bg-gray-900/90 border-gray-700' 
            : 'bg-white/90 border-gray-200'
        }`}>
          <div className="px-6 py-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  디자인 시스템 v1
                </h2>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  JSON 테마로 자동 컴포넌트 생성
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Advanced Features Buttons */}
                <button 
                  onClick={() => setShowAIRecommendations(true)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'bg-purple-900/50 text-purple-300 hover:bg-purple-800/50' 
                      : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                  }`}
                >
                  🤖 AI 추천
                </button>
                <button 
                  onClick={() => setShowCollaboration(true)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'bg-blue-900/50 text-blue-300 hover:bg-blue-800/50' 
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  🤝 협업
                </button>
                <button 
                  onClick={() => setShowPerformance(true)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'bg-green-900/50 text-green-300 hover:bg-green-800/50' 
                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                  }`}
                >
                  ⚡ 성능
                </button>
                <button 
                  onClick={() => setShowTools(true)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'bg-orange-900/50 text-orange-300 hover:bg-orange-800/50' 
                      : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                  }`}
                >
                  🛠️ 도구
                </button>
                
                {/* 다크 모드 토글 */}
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title="다크 모드 토글"
                >
                  {isDarkMode ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex h-[calc(100vh-140px)]">
          {/* 왼쪽 사이드바 - JSON 입력 영역 */}
          <div className={`w-96 border-r overflow-y-auto transition-colors ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="p-6">
              {/* 템플릿 선택 */}
              <div className="mb-6">
                <h3 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  템플릿 선택
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => loadTemplate('default')}
                    className={`p-3 text-sm rounded-lg border transition-colors ${
                      isDarkMode 
                        ? 'border-gray-600 hover:border-gray-500 text-gray-300 hover:bg-gray-700' 
                        : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    기본
                  </button>
                  <button
                    onClick={() => loadTemplate('dark')}
                    className={`p-3 text-sm rounded-lg border transition-colors ${
                      isDarkMode 
                        ? 'border-gray-600 hover:border-gray-500 text-gray-300 hover:bg-gray-700' 
                        : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    다크
                  </button>
                  <button
                    onClick={() => loadTemplate('minimal')}
                    className={`p-3 text-sm rounded-lg border transition-colors ${
                      isDarkMode 
                        ? 'border-gray-600 hover:border-gray-500 text-gray-300 hover:bg-gray-700' 
                        : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    미니멀
                  </button>
                  <button
                    onClick={() => loadTemplate('colorful')}
                    className={`p-3 text-sm rounded-lg border transition-colors ${
                      isDarkMode 
                        ? 'border-gray-600 hover:border-gray-500 text-gray-300 hover:bg-gray-700' 
                        : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    컬러풀
                  </button>
                </div>
              </div>

              {/* JSON 입력 */}
              <div className="mb-4">
                <h3 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  JSON 테마 설정
                </h3>
                <div className="relative">
                  <textarea
                    value={jsonInput}
                    onChange={(e) => handleJsonChange(e.target.value)}
                    className={`w-full h-96 p-4 text-sm font-mono rounded-lg border resize-none transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-900 border-gray-600 text-gray-300 focus:border-blue-500' 
                        : 'bg-gray-50 border-gray-200 text-gray-800 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    placeholder="JSON 테마를 입력하세요..."
                  />
                  {jsonError && (
                    <div className="absolute -bottom-6 left-0 text-xs text-red-500">
                      {jsonError}
                    </div>
                  )}
                </div>
              </div>

              {/* 컴포넌트 생성하기 버튼 */}
              <button
                onClick={handleApplyTheme}
                disabled={!!jsonError}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
                  jsonError
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                }`}
              >
                🎨 컴포넌트 생성하기
              </button>

              {/* 유효성 상태 */}
              <div className="mt-3 text-xs text-center">
                {jsonError ? (
                  <span className="text-red-500">❌ JSON 오류</span>
                ) : (
                  <span className="text-green-500">✅ 유효한 JSON</span>
                )}
              </div>
            </div>
          </div>

          {/* 오른쪽 캔버스 - 컴포넌트 미리보기 */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-8">
              <div className="max-w-6xl mx-auto space-y-12">
                {/* 컬러 팔레트 미리보기 */}
                <section>
                  <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    컬러 팔레트
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(theme.colors).map(([name, color]) => (
                      <div key={name} className={`p-4 rounded-lg border ${
                        isDarkMode ? 'border-gray-700' : 'border-gray-200'
                      }`}>
                        <div 
                          className="w-full h-16 rounded-lg mb-3 border-2 border-white shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                        <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {name}
                        </div>
                        <div className={`text-xs font-mono ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {color}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 버튼 컴포넌트 미리보기 */}
                <section>
                  <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    버튼 컴포넌트
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Primary Button */}
                    <div className={`p-6 rounded-lg border ${
                      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                      <h3 className={`text-sm font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Primary
                      </h3>
                      <button
                        style={{
                          backgroundColor: theme.colors.primary,
                          borderRadius: theme.borderRadius.lg,
                          padding: `${theme.spacing.md} ${theme.spacing.xl}`,
                          fontSize: theme.typography.fontSize.sm,
                          fontWeight: theme.typography.fontWeight.semibold,
                          boxShadow: theme.shadows.md
                        }}
                        className="text-white hover:opacity-90 transition-opacity"
                      >
                        Primary Button
                      </button>
                    </div>

                    {/* Secondary Button */}
                    <div className={`p-6 rounded-lg border ${
                      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                      <h3 className={`text-sm font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Secondary
                      </h3>
                      <button
                        style={{
                          backgroundColor: theme.colors.secondary,
                          borderRadius: theme.borderRadius.lg,
                          padding: `${theme.spacing.md} ${theme.spacing.xl}`,
                          fontSize: theme.typography.fontSize.sm,
                          fontWeight: theme.typography.fontWeight.semibold,
                          boxShadow: theme.shadows.md
                        }}
                        className="text-white hover:opacity-90 transition-opacity"
                      >
                        Secondary Button
                      </button>
                    </div>

                    {/* Success Button */}
                    <div className={`p-6 rounded-lg border ${
                      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                      <h3 className={`text-sm font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Success
                      </h3>
                      <button
                        style={{
                          backgroundColor: theme.colors.success,
                          borderRadius: theme.borderRadius.lg,
                          padding: `${theme.spacing.md} ${theme.spacing.xl}`,
                          fontSize: theme.typography.fontSize.sm,
                          fontWeight: theme.typography.fontWeight.semibold,
                          boxShadow: theme.shadows.md
                        }}
                        className="text-white hover:opacity-90 transition-opacity"
                      >
                        Success Button
                      </button>
                    </div>
                  </div>
                </section>

                {/* 카드 컴포넌트 미리보기 */}
                <section>
                  <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    카드 컴포넌트
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {['기본 카드', '이미지 카드', '액션 카드'].map((cardTitle, index) => (
                      <div
                        key={index}
                        style={{
                          borderRadius: theme.borderRadius.xl,
                          padding: theme.spacing.xl,
                          boxShadow: theme.shadows.lg
                        }}
                        className={`border transition-transform hover:-translate-y-1 ${
                          isDarkMode 
                            ? 'bg-gray-800 border-gray-700' 
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        {index === 1 && (
                          <div 
                            style={{
                              backgroundColor: theme.colors.primary,
                              borderRadius: theme.borderRadius.lg,
                              marginBottom: theme.spacing.lg
                            }}
                            className="h-32 opacity-20"
                          />
                        )}
                        <h3 
                          style={{
                            fontSize: theme.typography.fontSize.lg,
                            fontWeight: theme.typography.fontWeight.bold,
                            marginBottom: theme.spacing.md
                          }}
                          className={isDarkMode ? 'text-white' : 'text-gray-900'}
                        >
                          {cardTitle}
                        </h3>
                        <p 
                          style={{
                            fontSize: theme.typography.fontSize.sm,
                            lineHeight: theme.typography.lineHeight.relaxed,
                            marginBottom: theme.spacing.lg
                          }}
                          className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}
                        >
                          카드 컴포넌트의 설명 텍스트입니다. 테마에 따라 스타일이 자동으로 적용됩니다.
                        </p>
                        {index === 2 && (
                          <button
                            style={{
                              backgroundColor: theme.colors.primary,
                              borderRadius: theme.borderRadius.md,
                              padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
                              fontSize: theme.typography.fontSize.sm,
                              fontWeight: theme.typography.fontWeight.medium
                            }}
                            className="text-white hover:opacity-90 transition-opacity"
                          >
                            액션
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                {/* 폼 컴포넌트 미리보기 */}
                <section>
                  <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    폼 컴포넌트
                  </h2>
                  <div className={`p-8 rounded-xl border ${
                    isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label 
                          style={{
                            fontSize: theme.typography.fontSize.sm,
                            fontWeight: theme.typography.fontWeight.medium,
                            marginBottom: theme.spacing.sm
                          }}
                          className={`block ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                        >
                          텍스트 입력
                        </label>
                        <input
                          type="text"
                          placeholder="텍스트를 입력하세요"
                          style={{
                            borderRadius: theme.borderRadius.lg,
                            padding: theme.spacing.md,
                            fontSize: theme.typography.fontSize.sm
                          }}
                          className={`w-full border transition-colors ${
                            isDarkMode 
                              ? 'bg-gray-900 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                        />
                      </div>
                      
                      <div>
                        <label 
                          style={{
                            fontSize: theme.typography.fontSize.sm,
                            fontWeight: theme.typography.fontWeight.medium,
                            marginBottom: theme.spacing.sm
                          }}
                          className={`block ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                        >
                          이메일 입력
                        </label>
                        <input
                          type="email"
                          placeholder="email@example.com"
                          style={{
                            borderRadius: theme.borderRadius.lg,
                            padding: theme.spacing.md,
                            fontSize: theme.typography.fontSize.sm
                          }}
                          className={`w-full border transition-colors ${
                            isDarkMode 
                              ? 'bg-gray-900 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500' 
                              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                          } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                        />
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendations Modal */}
      {showAIRecommendations && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowAIRecommendations(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">🤖 AI 기반 디자인 추천</h2>
              <button
                onClick={() => setShowAIRecommendations(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <AIRecommendations
                currentTheme={convertToThemeData(theme)}
                onThemeUpdate={handleAIThemeUpdate}
              />
            </div>
          </div>
        </div>
      )}

      {/* Collaboration Hub Modal */}
      {showCollaboration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowCollaboration(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">🤝 팀 협업</h2>
              <button
                onClick={() => setShowCollaboration(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <CollaborationHub
                themeId="v2-temp-theme-id"
                currentTheme={convertToThemeData(theme)}
                onThemeUpdate={handleAIThemeUpdate}
              />
            </div>
          </div>
        </div>
      )}

      {/* Performance Hub Modal */}
      {showPerformance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowPerformance(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">⚡ 성능 최적화</h2>
              <button
                onClick={() => setShowPerformance(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <PerformanceHub
                components={allComponentTemplates}
                onOptimizationApply={(suggestion) => {
                  success(`${suggestion.title} 최적화가 적용되었습니다!`)
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tools Hub Modal */}
      {showTools && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowTools(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">🛠️ 디자인 도구</h2>
              <button
                onClick={() => setShowTools(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <ToolsHub
                theme={convertToThemeData(theme)}
                onToolAction={(tool, action, data) => {
                  console.log('Tool action:', tool, action, data)
                  success(`${tool} 도구에서 ${action} 작업이 완료되었습니다!`)
                }}
              />
            </div>
          </div>
        </div>
      )}

      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={hideToast} 
      />
    </ProtectedRoute>
  )
}