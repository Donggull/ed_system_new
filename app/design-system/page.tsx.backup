'use client'

import React, { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

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

  // 테마 적용 핸들러
  const handleApplyTheme = useCallback(() => {
    const parsed = validateAndParseJson(jsonInput)
    if (parsed) {
      setTheme(parsed)
      // TODO: 테마를 Supabase에 저장하는 로직 추가
      console.log('테마 적용됨:', parsed)
    }
  }, [jsonInput, validateAndParseJson])

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

  return (
    <ProtectedRoute>
      <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
        {/* 상단 헤더 */}
        <header className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-colors ${
          isDarkMode 
            ? 'bg-gray-900/90 border-gray-700' 
            : 'bg-white/90 border-gray-200'
        }`}>
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">DS</span>
                  </div>
                  <div>
                    <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      디자인 시스템 생성기
                    </h1>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      JSON 테마로 자동 컴포넌트 생성
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
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
                
                {/* 사용자 정보 */}
                <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {user?.email}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex h-[calc(100vh-80px)]">
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

              {/* 적용 버튼 */}
              <button
                onClick={handleApplyTheme}
                disabled={!!jsonError}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
                  jsonError
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                }`}
              >
                테마 적용
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
    </ProtectedRoute>
  )
}