'use client'

import { useState, useEffect, useCallback } from 'react'
import { ThemeData } from '@/types/database'
import { CSSVariablesGenerator } from '@/lib/css-variables-generator'

export interface ThemeContextType {
  theme: ThemeData | null
  setTheme: (theme: ThemeData) => void
  isDark: boolean
  toggleDarkMode: () => void
  cssVariables: Record<string, string>
  updateCSSVariables: (variables: Record<string, string>) => void
  isLoading: boolean
}

// 실시간 테마 변경을 위한 커스텀 훅
export const useTheme = (initialTheme?: ThemeData): ThemeContextType => {
  const [theme, setThemeState] = useState<ThemeData | null>(initialTheme || null)
  const [isDark, setIsDark] = useState(false)
  const [cssVariables, setCssVariables] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  // 다크 모드 감지
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDark(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // 테마 변경 시 CSS 변수 업데이트
  useEffect(() => {
    if (!theme) return

    setIsLoading(true)
    try {
      const generator = new CSSVariablesGenerator(theme)
      const { variables } = generator.generateCSSVariables()
      setCssVariables(variables)
      updateDocumentCSSVariables(variables)
    } catch (error) {
      console.error('Error generating CSS variables:', error)
    } finally {
      setIsLoading(false)
    }
  }, [theme])

  // DOM에 CSS 변수 적용
  const updateDocumentCSSVariables = (variables: Record<string, string>) => {
    const root = document.documentElement
    Object.entries(variables).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
  }

  // 테마 설정
  const setTheme = useCallback((newTheme: ThemeData) => {
    setThemeState(newTheme)
    
    // 테마 변경 이벤트 발생
    window.dispatchEvent(new CustomEvent('themechange', {
      detail: { theme: newTheme }
    }))
  }, [])

  // 다크 모드 토글
  const toggleDarkMode = useCallback(() => {
    setIsDark(prev => {
      const newValue = !prev
      document.documentElement.classList.toggle('dark', newValue)
      localStorage.setItem('darkMode', newValue.toString())
      return newValue
    })
  }, [])

  // CSS 변수 업데이트
  const updateCSSVariables = useCallback((variables: Record<string, string>) => {
    setCssVariables(prev => ({ ...prev, ...variables }))
    updateDocumentCSSVariables(variables)
  }, [])

  return {
    theme,
    setTheme,
    isDark,
    toggleDarkMode,
    cssVariables,
    updateCSSVariables,
    isLoading
  }
}

// 테마 변경 이벤트 리스너 훅
export const useThemeListener = (callback: (theme: ThemeData) => void) => {
  useEffect(() => {
    const handleThemeChange = (e: CustomEvent) => {
      callback(e.detail.theme)
    }

    window.addEventListener('themechange', handleThemeChange as EventListener)
    return () => window.removeEventListener('themechange', handleThemeChange as EventListener)
  }, [callback])
}

// 실시간 CSS 변수 업데이트 훅
export const useLiveThemePreview = (theme: ThemeData | null) => {
  const [previewVariables, setPreviewVariables] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!theme) return

    const generator = new CSSVariablesGenerator(theme)
    const { variables } = generator.generateCSSVariables()
    setPreviewVariables(variables)

    // 임시 CSS 변수 적용 (미리보기용)
    const root = document.documentElement
    const originalValues: Record<string, string> = {}

    Object.entries(variables).forEach(([key, value]) => {
      originalValues[key] = root.style.getPropertyValue(key)
      root.style.setProperty(key, value)
    })

    // 컴포넌트 언마운트 시 원래 값 복원
    return () => {
      Object.entries(originalValues).forEach(([key, value]) => {
        if (value) {
          root.style.setProperty(key, value)
        } else {
          root.style.removeProperty(key)
        }
      })
    }
  }, [theme])

  return previewVariables
}

// 테마 지속성을 위한 로컬 스토리지 훅
export const useThemePersistence = () => {
  const saveTheme = useCallback((theme: ThemeData) => {
    try {
      localStorage.setItem('designSystemTheme', JSON.stringify(theme))
    } catch (error) {
      console.error('Failed to save theme to localStorage:', error)
    }
  }, [])

  const loadTheme = useCallback((): ThemeData | null => {
    try {
      const saved = localStorage.getItem('designSystemTheme')
      return saved ? JSON.parse(saved) : null
    } catch (error) {
      console.error('Failed to load theme from localStorage:', error)
      return null
    }
  }, [])

  const clearTheme = useCallback(() => {
    try {
      localStorage.removeItem('designSystemTheme')
    } catch (error) {
      console.error('Failed to clear theme from localStorage:', error)
    }
  }, [])

  return { saveTheme, loadTheme, clearTheme }
}

// 테마 변경 애니메이션 훅
export const useThemeTransition = () => {
  const [isTransitioning, setIsTransitioning] = useState(false)

  const startTransition = useCallback(() => {
    setIsTransitioning(true)
    
    // 전환 애니메이션 클래스 추가
    document.documentElement.classList.add('theme-transitioning')
    
    // 애니메이션 완료 후 클래스 제거
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning')
      setIsTransitioning(false)
    }, 300)
  }, [])

  return { isTransitioning, startTransition }
}