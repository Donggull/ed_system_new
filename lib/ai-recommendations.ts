import { ThemeData, ColorPalette } from '@/types/database'

// AI 기반 추천 시스템
export class AIRecommendationService {
  
  // 색상 조합 추천 알고리즘
  static recommendColorCombinations(primaryColor: string): ColorPalette[] {
    const recommendations: ColorPalette[] = []
    
    // 보색 조합 추천
    const complementaryColors = this.generateComplementaryPalette(primaryColor)
    recommendations.push(complementaryColors)
    
    // 유사색 조합 추천
    const analogousColors = this.generateAnalogousPalette(primaryColor)
    recommendations.push(analogousColors)
    
    // 삼색 조합 추천
    const triadicColors = this.generateTriadicPalette(primaryColor)
    recommendations.push(triadicColors)
    
    return recommendations
  }
  
  // 보색 팔레트 생성
  private static generateComplementaryPalette(baseColor: string): ColorPalette {
    const hsl = this.hexToHsl(baseColor)
    const complementaryHue = (hsl.h + 180) % 360
    
    return {
      '50': this.hslToHex({ h: complementaryHue, s: 10, l: 95 }),
      '100': this.hslToHex({ h: complementaryHue, s: 20, l: 90 }),
      '200': this.hslToHex({ h: complementaryHue, s: 30, l: 80 }),
      '300': this.hslToHex({ h: complementaryHue, s: 40, l: 70 }),
      '400': this.hslToHex({ h: complementaryHue, s: 50, l: 60 }),
      '500': this.hslToHex({ h: complementaryHue, s: 60, l: 50 }),
      '600': this.hslToHex({ h: complementaryHue, s: 70, l: 40 }),
      '700': this.hslToHex({ h: complementaryHue, s: 80, l: 30 }),
      '800': this.hslToHex({ h: complementaryHue, s: 90, l: 20 }),
      '900': this.hslToHex({ h: complementaryHue, s: 95, l: 10 }),
    }
  }
  
  // 유사색 팔레트 생성
  private static generateAnalogousPalette(baseColor: string): ColorPalette {
    const hsl = this.hexToHsl(baseColor)
    const analogousHue = (hsl.h + 30) % 360
    
    return {
      '50': this.hslToHex({ h: analogousHue, s: 10, l: 95 }),
      '100': this.hslToHex({ h: analogousHue, s: 20, l: 90 }),
      '200': this.hslToHex({ h: analogousHue, s: 30, l: 80 }),
      '300': this.hslToHex({ h: analogousHue, s: 40, l: 70 }),
      '400': this.hslToHex({ h: analogousHue, s: 50, l: 60 }),
      '500': this.hslToHex({ h: analogousHue, s: 60, l: 50 }),
      '600': this.hslToHex({ h: analogousHue, s: 70, l: 40 }),
      '700': this.hslToHex({ h: analogousHue, s: 80, l: 30 }),
      '800': this.hslToHex({ h: analogousHue, s: 90, l: 20 }),
      '900': this.hslToHex({ h: analogousHue, s: 95, l: 10 }),
    }
  }
  
  // 삼색 팔레트 생성
  private static generateTriadicPalette(baseColor: string): ColorPalette {
    const hsl = this.hexToHsl(baseColor)
    const triadicHue = (hsl.h + 120) % 360
    
    return {
      '50': this.hslToHex({ h: triadicHue, s: 10, l: 95 }),
      '100': this.hslToHex({ h: triadicHue, s: 20, l: 90 }),
      '200': this.hslToHex({ h: triadicHue, s: 30, l: 80 }),
      '300': this.hslToHex({ h: triadicHue, s: 40, l: 70 }),
      '400': this.hslToHex({ h: triadicHue, s: 50, l: 60 }),
      '500': this.hslToHex({ h: triadicHue, s: 60, l: 50 }),
      '600': this.hslToHex({ h: triadicHue, s: 70, l: 40 }),
      '700': this.hslToHex({ h: triadicHue, s: 80, l: 30 }),
      '800': this.hslToHex({ h: triadicHue, s: 90, l: 20 }),
      '900': this.hslToHex({ h: triadicHue, s: 95, l: 10 }),
    }
  }
  
  // 트렌드 기반 테마 제안
  static getTrendingThemes(): ThemeData[] {
    return [
      {
        name: '2024 Minimal Blue',
        colors: {
          primary: {
            '50': '#eff6ff',
            '100': '#dbeafe',
            '200': '#bfdbfe',
            '300': '#93c5fd',
            '400': '#60a5fa',
            '500': '#3b82f6',
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
            '500': '#64748b',
            '600': '#475569',
            '700': '#334155',
            '800': '#1e293b',
            '900': '#0f172a',
          }
        },
        typography: {
          fontFamily: {
            sans: ['Inter', 'system-ui', 'sans-serif'],
            mono: ['JetBrains Mono', 'monospace']
          },
          fontSize: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
            '3xl': '1.875rem',
            '4xl': '2.25rem'
          }
        },
        spacing: {
          xs: '0.25rem',
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem',
          '2xl': '3rem'
        },
        borderRadius: {
          none: '0',
          sm: '0.125rem',
          md: '0.375rem',
          lg: '0.5rem',
          full: '9999px'
        }
      },
      {
        name: 'Warm Sunset',
        colors: {
          primary: {
            '50': '#fef7ee',
            '100': '#fdedd3',
            '200': '#fbd8a5',
            '300': '#f8bc6d',
            '400': '#f59932',
            '500': '#f27d0a',
            '600': '#e36305',
            '700': '#bc4906',
            '800': '#973a0c',
            '900': '#7a310d',
          },
          secondary: {
            '50': '#fdf4ff',
            '100': '#fae8ff',
            '200': '#f5d0fe',
            '300': '#f0abfc',
            '400': '#e879f9',
            '500': '#d946ef',
            '600': '#c026d3',
            '700': '#a21caf',
            '800': '#86198f',
            '900': '#701a75',
          }
        },
        typography: {
          fontFamily: {
            sans: ['Poppins', 'system-ui', 'sans-serif'],
            mono: ['Source Code Pro', 'monospace']
          },
          fontSize: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
            '3xl': '1.875rem',
            '4xl': '2.25rem'
          }
        },
        spacing: {
          xs: '0.25rem',
          sm: '0.5rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem',
          '2xl': '3rem'
        },
        borderRadius: {
          none: '0',
          sm: '0.125rem',
          md: '0.375rem',
          lg: '0.5rem',
          full: '9999px'
        }
      }
    ]
  }
  
  // 접근성 개선 제안
  static analyzeAccessibility(theme: ThemeData): AccessibilityReport {
    const issues: AccessibilityIssue[] = []
    const suggestions: AccessibilitySuggestion[] = []
    
    // 색상 대비 검사
    const contrastRatio = this.calculateContrastRatio(
      theme.colors.primary['500'],
      '#ffffff'
    )
    
    if (contrastRatio < 4.5) {
      issues.push({
        type: 'contrast',
        severity: 'high',
        message: '주요 색상과 흰색 배경의 대비비가 낮습니다.',
        element: 'primary-500'
      })
      
      suggestions.push({
        type: 'color-adjustment',
        message: '주요 색상을 더 어둡게 조정하여 대비비를 높이세요.',
        action: 'darken-primary'
      })
    }
    
    return {
      score: this.calculateAccessibilityScore(issues),
      issues,
      suggestions
    }
  }
  
  // 유사한 디자인 시스템 추천
  static findSimilarDesignSystems(currentTheme: ThemeData): SimilarDesignSystem[] {
    // 실제로는 데이터베이스나 API에서 가져올 것
    return [
      {
        id: '1',
        name: 'Material Design',
        similarity: 0.85,
        description: '구글의 머티리얼 디자인 시스템',
        previewUrl: '/images/material-preview.jpg',
        tags: ['modern', 'clean', 'accessible']
      },
      {
        id: '2',
        name: 'Ant Design',
        similarity: 0.78,
        description: '엔터프라이즈급 UI 디자인 언어',
        previewUrl: '/images/ant-preview.jpg',
        tags: ['enterprise', 'comprehensive', 'stable']
      }
    ]
  }
  
  // 유틸리티 함수들
  private static hexToHsl(hex: string): { h: number; s: number; l: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return { h: 0, s: 0, l: 0 }

    const r = parseInt(result[1], 16) / 255
    const g = parseInt(result[2], 16) / 255
    const b = parseInt(result[3], 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (max === min) {
      h = s = 0
    } else {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }

    return { h: h * 360, s: s * 100, l: l * 100 }
  }
  
  private static hslToHex({ h, s, l }: { h: number; s: number; l: number }): string {
    s /= 100
    l /= 100

    const c = (1 - Math.abs(2 * l - 1)) * s
    const x = c * (1 - Math.abs((h / 60) % 2 - 1))
    const m = l - c / 2
    let r = 0
    let g = 0
    let b = 0

    if (0 <= h && h < 60) {
      r = c; g = x; b = 0
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x
    }

    r = Math.round((r + m) * 255)
    g = Math.round((g + m) * 255)
    b = Math.round((b + m) * 255)

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }
  
  private static calculateContrastRatio(color1: string, color2: string): number {
    const getLuminance = (hex: string): number => {
      const rgb = parseInt(hex.slice(1), 16)
      const r = (rgb >> 16) & 0xff
      const g = (rgb >> 8) & 0xff
      const b = (rgb >> 0) & 0xff
      
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      })
      
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
    }
    
    const lum1 = getLuminance(color1)
    const lum2 = getLuminance(color2)
    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)
    
    return (brightest + 0.05) / (darkest + 0.05)
  }
  
  private static calculateAccessibilityScore(issues: AccessibilityIssue[]): number {
    let score = 100
    
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'high':
          score -= 20
          break
        case 'medium':
          score -= 10
          break
        case 'low':
          score -= 5
          break
      }
    })
    
    return Math.max(0, score)
  }
}

// 타입 정의
export interface AccessibilityReport {
  score: number
  issues: AccessibilityIssue[]
  suggestions: AccessibilitySuggestion[]
}

export interface AccessibilityIssue {
  type: 'contrast' | 'color-blindness' | 'size' | 'spacing'
  severity: 'high' | 'medium' | 'low'
  message: string
  element: string
}

export interface AccessibilitySuggestion {
  type: 'color-adjustment' | 'size-increase' | 'spacing-increase'
  message: string
  action: string
}

export interface SimilarDesignSystem {
  id: string
  name: string
  similarity: number
  description: string
  previewUrl: string
  tags: string[]
}