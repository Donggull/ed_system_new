'use client'

import { ThemeData, ColorPalette } from '@/types/database'

// 추가 도구 관련 타입
export interface ContrastResult {
  ratio: number
  wcagAA: boolean
  wcagAAA: boolean
  grade: 'excellent' | 'good' | 'poor' | 'fail'
  suggestions?: string[]
}

export interface DesignToken {
  name: string
  value: string
  type: 'color' | 'spacing' | 'typography' | 'borderRadius'
  category: string
  description?: string
}

export interface LintRule {
  id: string
  name: string
  description: string
  severity: 'error' | 'warning' | 'info'
  category: 'accessibility' | 'consistency' | 'naming' | 'performance'
}

export interface LintResult {
  rule: LintRule
  message: string
  severity: LintRule['severity']
  line?: number
  column?: number
  element?: string
}

export interface FigmaPluginConfig {
  apiKey?: string
  teamId?: string
  projectId?: string
  isConnected: boolean
}

// 디자인 도구 서비스
export class DesignToolsService {
  
  // 색상 대비 검사기
  static checkColorContrast(foreground: string, background: string): ContrastResult {
    const ratio = this.calculateContrastRatio(foreground, background)
    
    const wcagAA = ratio >= 4.5
    const wcagAAA = ratio >= 7
    
    let grade: ContrastResult['grade']
    if (ratio >= 7) grade = 'excellent'
    else if (ratio >= 4.5) grade = 'good'
    else if (ratio >= 3) grade = 'poor'
    else grade = 'fail'
    
    const suggestions: string[] = []
    if (!wcagAA) {
      suggestions.push('WCAG AA 기준을 충족하려면 대비비를 4.5:1 이상으로 높이세요.')
      if (this.getBrightness(foreground) > this.getBrightness(background)) {
        suggestions.push('전경색을 더 어둡게 하거나 배경색을 더 밝게 조정하세요.')
      } else {
        suggestions.push('전경색을 더 밝게 하거나 배경색을 더 어둡게 조정하세요.')
      }
    }
    
    return {
      ratio,
      wcagAA,
      wcagAAA,
      grade,
      suggestions
    }
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

  private static getBrightness(hex: string): number {
    const rgb = parseInt(hex.slice(1), 16)
    const r = (rgb >> 16) & 0xff
    const g = (rgb >> 8) & 0xff
    const b = (rgb >> 0) & 0xff
    return (r * 299 + g * 587 + b * 114) / 1000
  }

  // 디자인 토큰 변환 도구
  static convertThemeToTokens(theme: ThemeData): DesignToken[] {
    const tokens: DesignToken[] = []
    
    // 색상 토큰
    Object.entries(theme.colors).forEach(([colorType, palette]) => {
      Object.entries(palette).forEach(([shade, value]) => {
        tokens.push({
          name: `color-${colorType}-${shade}`,
          value,
          type: 'color',
          category: 'colors',
          description: `${colorType} 색상의 ${shade} 톤`
        })
      })
    })
    
    // 타이포그래피 토큰
    Object.entries(theme.typography.fontSize).forEach(([size, value]) => {
      tokens.push({
        name: `font-size-${size}`,
        value,
        type: 'typography',
        category: 'typography',
        description: `${size} 크기의 폰트`
      })
    })
    
    theme.typography.fontFamily.sans.forEach((font, index) => {
      tokens.push({
        name: `font-family-sans-${index}`,
        value: font,
        type: 'typography',
        category: 'typography',
        description: `Sans-serif 폰트 ${index + 1}순위`
      })
    })
    
    // 간격 토큰
    Object.entries(theme.spacing).forEach(([size, value]) => {
      tokens.push({
        name: `spacing-${size}`,
        value,
        type: 'spacing',
        category: 'spacing',
        description: `${size} 크기의 간격`
      })
    })
    
    // Border Radius 토큰
    Object.entries(theme.borderRadius).forEach(([size, value]) => {
      tokens.push({
        name: `border-radius-${size}`,
        value,
        type: 'borderRadius',
        category: 'borders',
        description: `${size} 크기의 모서리 둥글기`
      })
    })
    
    return tokens
  }

  static exportTokensAsJSON(tokens: DesignToken[]): string {
    const grouped = tokens.reduce((acc, token) => {
      if (!acc[token.category]) {
        acc[token.category] = {}
      }
      acc[token.category][token.name] = {
        value: token.value,
        type: token.type,
        description: token.description
      }
      return acc
    }, {} as Record<string, any>)
    
    return JSON.stringify(grouped, null, 2)
  }

  static exportTokensAsCSS(tokens: DesignToken[]): string {
    const cssVars = tokens.map(token => 
      `  --${token.name}: ${token.value};`
    ).join('\n')
    
    return `:root {\n${cssVars}\n}`
  }

  static exportTokensAsSCSS(tokens: DesignToken[]): string {
    const scssVars = tokens.map(token => 
      `$${token.name}: ${token.value};`
    ).join('\n')
    
    return `// Design Tokens\n${scssVars}`
  }

  // Figma 플러그인 연동
  static async connectToFigma(apiKey: string): Promise<FigmaPluginConfig> {
    try {
      // 실제로는 Figma API를 호출하여 연결 확인
      // 여기서는 시뮬레이션
      const response = await fetch('https://api.figma.com/v1/me', {
        headers: {
          'X-Figma-Token': apiKey
        }
      })
      
      if (response.ok) {
        return {
          apiKey,
          isConnected: true
        }
      } else {
        throw new Error('Invalid API key')
      }
    } catch (error) {
      console.error('Figma connection failed:', error)
      return {
        apiKey,
        isConnected: false
      }
    }
  }

  static async syncToFigma(config: FigmaPluginConfig, tokens: DesignToken[]): Promise<boolean> {
    if (!config.isConnected || !config.apiKey) {
      throw new Error('Figma not connected')
    }
    
    try {
      // 실제로는 Figma API를 통해 디자인 토큰을 동기화
      console.log('Syncing tokens to Figma:', tokens.length, 'tokens')
      
      // 시뮬레이션: API 호출
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      return true
    } catch (error) {
      console.error('Figma sync failed:', error)
      return false
    }
  }

  static generateFigmaPluginCode(tokens: DesignToken[]): string {
    const colorTokens = tokens.filter(t => t.type === 'color')
    const spacingTokens = tokens.filter(t => t.type === 'spacing')
    
    return `
// Figma Plugin Code - Design Tokens
figma.loadVersionHistoryAsync().then(() => {
  // Apply color styles
  ${colorTokens.map(token => `
  const ${token.name.replace(/-/g, '_')} = figma.createPaintStyle()
  ${token.name.replace(/-/g, '_')}.name = "${token.name}"
  ${token.name.replace(/-/g, '_')}.paints = [{
    type: "SOLID",
    color: hexToRgb("${token.value}")
  }]`).join('\n')}
  
  // Apply spacing tokens as local variables
  ${spacingTokens.map(token => `
  // ${token.name}: ${token.value}`).join('\n')}
  
  figma.closePlugin("Design tokens applied successfully!")
})

function hexToRgb(hex) {
  const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255
  } : null
}
`
  }

  // 디자인 시스템 린터
  static lintDesignSystem(theme: ThemeData): LintResult[] {
    const results: LintResult[] = []
    
    // 색상 접근성 검사
    const contrastIssues = this.checkColorAccessibility(theme)
    results.push(...contrastIssues)
    
    // 일관성 검사
    const consistencyIssues = this.checkConsistency(theme)
    results.push(...consistencyIssues)
    
    // 네이밍 검사
    const namingIssues = this.checkNaming(theme)
    results.push(...namingIssues)
    
    // 성능 검사
    const performanceIssues = this.checkPerformance(theme)
    results.push(...performanceIssues)
    
    return results
  }

  private static checkColorAccessibility(theme: ThemeData): LintResult[] {
    const results: LintResult[] = []
    
    // Primary 색상과 흰색 배경 대비 검사
    const primaryContrast = this.checkColorContrast(theme.colors.primary['500'], '#ffffff')
    if (!primaryContrast.wcagAA) {
      results.push({
        rule: {
          id: 'color-contrast-aa',
          name: 'Color Contrast AA',
          description: 'Colors must meet WCAG AA contrast requirements',
          severity: 'error',
          category: 'accessibility'
        },
        message: `Primary color (${theme.colors.primary['500']}) has insufficient contrast ratio (${primaryContrast.ratio.toFixed(2)}) against white background`,
        severity: 'error',
        element: 'primary-500'
      })
    }
    
    // Secondary 색상 검사
    const secondaryContrast = this.checkColorContrast(theme.colors.secondary['500'], '#ffffff')
    if (!secondaryContrast.wcagAA) {
      results.push({
        rule: {
          id: 'color-contrast-aa',
          name: 'Color Contrast AA',
          description: 'Colors must meet WCAG AA contrast requirements',
          severity: 'warning',
          category: 'accessibility'
        },
        message: `Secondary color (${theme.colors.secondary['500']}) has insufficient contrast ratio (${secondaryContrast.ratio.toFixed(2)}) against white background`,
        severity: 'warning',
        element: 'secondary-500'
      })
    }
    
    return results
  }

  private static checkConsistency(theme: ThemeData): LintResult[] {
    const results: LintResult[] = []
    
    // 색상 팔레트 완성도 검사
    const requiredShades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900']
    Object.entries(theme.colors).forEach(([colorType, palette]) => {
      const missingShades = requiredShades.filter(shade => !palette[shade as keyof ColorPalette])
      if (missingShades.length > 0) {
        results.push({
          rule: {
            id: 'complete-color-palette',
            name: 'Complete Color Palette',
            description: 'Color palettes should include all standard shades',
            severity: 'warning',
            category: 'consistency'
          },
          message: `${colorType} color palette is missing shades: ${missingShades.join(', ')}`,
          severity: 'warning',
          element: colorType
        })
      }
    })
    
    // 폰트 크기 비율 검사
    const fontSizes = Object.values(theme.typography.fontSize).map(size => parseFloat(size))
    const ratios = fontSizes.slice(1).map((size, index) => size / fontSizes[index])
    const inconsistentRatios = ratios.filter(ratio => ratio < 1.125 || ratio > 1.618)
    
    if (inconsistentRatios.length > 0) {
      results.push({
        rule: {
          id: 'font-size-scale',
          name: 'Font Size Scale',
          description: 'Font sizes should follow a consistent scale (1.125-1.618)',
          severity: 'info',
          category: 'consistency'
        },
        message: 'Font size scale ratios are inconsistent with typographic best practices',
        severity: 'info',
        element: 'typography.fontSize'
      })
    }
    
    return results
  }

  private static checkNaming(theme: ThemeData): LintResult[] {
    const results: LintResult[] = []
    
    // 색상 이름 검사
    const invalidColorNames = Object.keys(theme.colors).filter(name => 
      !['primary', 'secondary', 'success', 'warning', 'error', 'neutral', 'gray'].includes(name)
    )
    
    if (invalidColorNames.length > 0) {
      results.push({
        rule: {
          id: 'semantic-color-names',
          name: 'Semantic Color Names',
          description: 'Use semantic color names instead of specific colors',
          severity: 'info',
          category: 'naming'
        },
        message: `Consider using semantic names instead of: ${invalidColorNames.join(', ')}`,
        severity: 'info',
        element: 'colors'
      })
    }
    
    return results
  }

  private static checkPerformance(theme: ThemeData): LintResult[] {
    const results: LintResult[] = []
    
    // CSS 변수 개수 검사
    const totalTokens = this.convertThemeToTokens(theme).length
    if (totalTokens > 200) {
      results.push({
        rule: {
          id: 'token-count',
          name: 'Token Count',
          description: 'Limit the number of design tokens for better performance',
          severity: 'warning',
          category: 'performance'
        },
        message: `High number of design tokens (${totalTokens}). Consider consolidating similar tokens.`,
        severity: 'warning',
        element: 'tokens'
      })
    }
    
    // 폰트 패밀리 개수 검사
    const totalFonts = theme.typography.fontFamily.sans.length + theme.typography.fontFamily.mono.length
    if (totalFonts > 4) {
      results.push({
        rule: {
          id: 'font-family-count',
          name: 'Font Family Count',
          description: 'Limit font families to improve loading performance',
          severity: 'warning',
          category: 'performance'
        },
        message: `Consider reducing the number of font families (${totalFonts}) for better performance`,
        severity: 'warning',
        element: 'typography.fontFamily'
      })
    }
    
    return results
  }

  // 색상 팔레트 생성 도구
  static generateColorPalette(baseColor: string): ColorPalette {
    const hsl = this.hexToHsl(baseColor)
    
    return {
      '50': this.hslToHex({ h: hsl.h, s: Math.max(hsl.s - 30, 10), l: 95 }),
      '100': this.hslToHex({ h: hsl.h, s: Math.max(hsl.s - 20, 20), l: 90 }),
      '200': this.hslToHex({ h: hsl.h, s: Math.max(hsl.s - 10, 30), l: 80 }),
      '300': this.hslToHex({ h: hsl.h, s: hsl.s, l: 70 }),
      '400': this.hslToHex({ h: hsl.h, s: hsl.s, l: 60 }),
      '500': baseColor,
      '600': this.hslToHex({ h: hsl.h, s: Math.min(hsl.s + 10, 90), l: 40 }),
      '700': this.hslToHex({ h: hsl.h, s: Math.min(hsl.s + 20, 95), l: 30 }),
      '800': this.hslToHex({ h: hsl.h, s: Math.min(hsl.s + 30, 100), l: 20 }),
      '900': this.hslToHex({ h: hsl.h, s: Math.min(hsl.s + 40, 100), l: 10 }),
    }
  }

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
}

export const designToolsService = new DesignToolsService()