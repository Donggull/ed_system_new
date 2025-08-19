'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { parseThemeJson, applyCssVariables, sampleThemes } from '@/lib/theme-utils'

// Simple theme interface for runtime use
export interface SimpleTheme {
  colors?: {
    primary?: Record<string, string>
    secondary?: Record<string, string>
    success?: Record<string, string>
    warning?: Record<string, string>
    error?: Record<string, string>
    background?: string
    surface?: string
    text?: string
  }
  borderRadius?: string
  spacing?: string
  shadows?: {
    sm?: string
    md?: string
    lg?: string
  }
}

interface ThemeContextType {
  theme: SimpleTheme
  jsonInput: string
  jsonError: string | null
  updateTheme: (json: string) => void
  loadSampleTheme: (themeName: keyof typeof sampleThemes) => void
  resetTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
}

const defaultSimpleTheme: SimpleTheme = {
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
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<SimpleTheme>(defaultSimpleTheme)
  const [jsonInput, setJsonInput] = useState(JSON.stringify(sampleThemes.flat, null, 2))
  const [jsonError, setJsonError] = useState<string | null>(null)

  // JSON 업데이트 함수
  const updateTheme = (json: string) => {
    setJsonInput(json)
    const { theme: parsedTheme, error } = parseThemeJson(json)
    
    if (error) {
      setJsonError(error)
    } else if (parsedTheme) {
      setJsonError(null)
      // Convert parsed theme to SimpleTheme format
      setTheme(parsedTheme as any)
      applyCssVariables(parsedTheme as any)
    }
  }

  // 샘플 테마 로드
  const loadSampleTheme = (themeName: keyof typeof sampleThemes) => {
    const themeJson = JSON.stringify(sampleThemes[themeName], null, 2)
    updateTheme(themeJson)
  }

  // 테마 리셋
  const resetTheme = () => {
    const defaultJson = JSON.stringify(defaultSimpleTheme, null, 2)
    updateTheme(defaultJson)
  }

  // 초기 테마 적용
  useEffect(() => {
    applyCssVariables(theme as any)
  }, [])

  const value: ThemeContextType = {
    theme,
    jsonInput,
    jsonError,
    updateTheme,
    loadSampleTheme,
    resetTheme
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}