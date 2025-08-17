import { ThemeData, ColorPalette } from '@/types/database'

export const defaultTheme: ThemeData = {
  name: 'Default Theme',
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
    },
    success: {
      '50': '#f0fdf4',
      '100': '#dcfce7',
      '200': '#bbf7d0',
      '300': '#86efac',
      '400': '#4ade80',
      '500': '#22c55e',
      '600': '#16a34a',
      '700': '#15803d',
      '800': '#166534',
      '900': '#14532d',
    }
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'ui-monospace', 'monospace']
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

export function generateTailwindClasses(theme: ThemeData) {
  const classes: { [key: string]: string } = {}
  
  // Generate color classes
  Object.entries(theme.colors).forEach(([colorName, palette]) => {
    Object.entries(palette).forEach(([shade, value]) => {
      classes[`${colorName}-${shade}`] = value
    })
  })
  
  return classes
}

export function validateThemeData(data: any): data is ThemeData {
  if (!data || typeof data !== 'object') return false
  if (!data.name || typeof data.name !== 'string') return false
  if (!data.colors || typeof data.colors !== 'object') return false
  if (!data.colors.primary || !data.colors.secondary) return false
  
  return true
}

export function mergeThemeWithDefaults(partialTheme: Partial<ThemeData>): ThemeData {
  return {
    ...defaultTheme,
    ...partialTheme,
    colors: {
      ...defaultTheme.colors,
      ...partialTheme.colors
    },
    typography: {
      ...defaultTheme.typography,
      ...partialTheme.typography
    },
    spacing: {
      ...defaultTheme.spacing,
      ...partialTheme.spacing
    },
    borderRadius: {
      ...defaultTheme.borderRadius,
      ...partialTheme.borderRadius
    }
  }
}

// Flat JSON 형태 인터페이스 정의
interface FlatThemeJSON {
  colors?: {
    primary?: string
    primaryDark?: string
    secondary?: string
    secondaryMedium?: string
    accent?: string
    background?: string
    foreground?: string
    muted?: string
    mutedForeground?: string
    border?: string
    input?: string
    ring?: string
    destructive?: string
    destructiveForeground?: string
    [key: string]: string | undefined
  }
  typography?: {
    fontFamily?: {
      primary?: string
      heading?: string
      accent?: string
      display?: string
      [key: string]: string | undefined
    }
    fontSize?: {
      xs?: string
      sm?: string
      base?: string
      lg?: string
      xl?: string
      '2xl'?: string
      '3xl'?: string
      '4xl'?: string
      [key: string]: string | undefined
    }
    fontWeight?: {
      light?: string
      normal?: string
      medium?: string
      semibold?: string
      bold?: string
      [key: string]: string | undefined
    }
  }
  [key: string]: any
}

// Flat 색상을 TailwindCSS palette로 변환
function flatColorToPalette(color: string): ColorPalette {
  const base = hexToRgb(color)
  if (!base) {
    return {
      '50': '#f8fafc',
      '100': '#f1f5f9', 
      '200': '#e2e8f0',
      '300': '#cbd5e1',
      '400': '#94a3b8',
      '500': color,
      '600': color,
      '700': color,
      '800': '#1e293b',
      '900': '#0f172a'
    }
  }

  // 색상 변형 생성 (간단한 밝기 조절)
  const generateShade = (factor: number) => {
    const r = Math.round(Math.min(255, Math.max(0, base.r + (255 - base.r) * factor)))
    const g = Math.round(Math.min(255, Math.max(0, base.g + (255 - base.g) * factor)))
    const b = Math.round(Math.min(255, Math.max(0, base.b + (255 - base.b) * factor)))
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }

  const generateDarkShade = (factor: number) => {
    const r = Math.round(Math.max(0, base.r * factor))
    const g = Math.round(Math.max(0, base.g * factor))
    const b = Math.round(Math.max(0, base.b * factor))
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }

  return {
    '50': generateShade(0.95),
    '100': generateShade(0.9),
    '200': generateShade(0.8),
    '300': generateShade(0.6),
    '400': generateShade(0.3),
    '500': color,
    '600': generateDarkShade(0.8),
    '700': generateDarkShade(0.6),
    '800': generateDarkShade(0.4),
    '900': generateDarkShade(0.2)
  }
}

// Flat JSON을 기존 ThemeData 구조로 변환
function convertFlatToThemeData(flatTheme: FlatThemeJSON): ThemeData {
  const colors: any = {}

  if (flatTheme.colors) {
    // Primary 색상 설정
    if (flatTheme.colors.primary) {
      colors.primary = flatColorToPalette(flatTheme.colors.primary)
    }

    // Secondary 색상 설정
    if (flatTheme.colors.secondary) {
      colors.secondary = flatColorToPalette(flatTheme.colors.secondary)
    }

    // 추가 색상들
    if (flatTheme.colors.destructive) {
      colors.error = flatColorToPalette(flatTheme.colors.destructive)
    }

    if (flatTheme.colors.accent) {
      colors.success = flatColorToPalette(flatTheme.colors.accent)
    }
  }

  const typography: any = {
    ...defaultTheme.typography
  }

  if (flatTheme.typography) {
    if (flatTheme.typography.fontFamily) {
      typography.fontFamily = {
        sans: flatTheme.typography.fontFamily.primary ? 
          [flatTheme.typography.fontFamily.primary, 'ui-sans-serif', 'system-ui', 'sans-serif'] :
          defaultTheme.typography.fontFamily.sans,
        mono: flatTheme.typography.fontFamily.accent ? 
          [flatTheme.typography.fontFamily.accent, 'ui-monospace', 'monospace'] :
          defaultTheme.typography.fontFamily.mono
      }
    }

    if (flatTheme.typography.fontSize) {
      typography.fontSize = {
        ...defaultTheme.typography.fontSize,
        ...flatTheme.typography.fontSize
      }
    }
  }

  return {
    name: "Custom Theme",
    colors: {
      ...defaultTheme.colors,
      ...colors
    },
    typography,
    spacing: defaultTheme.spacing,
    borderRadius: defaultTheme.borderRadius
  }
}

// JSON 문자열을 ThemeData로 파싱하고 검증 (기존 + 새로운 flat 형태 지원)
export function parseThemeJson(jsonString: string): { theme: ThemeData | null, error: string | null } {
  try {
    const parsed = JSON.parse(jsonString)
    
    // 기본 구조 검증
    if (!parsed || typeof parsed !== 'object') {
      return { theme: null, error: '유효하지 않은 JSON 객체입니다.' }
    }

    // Flat 형태인지 확인 (colors 객체에 직접 색상 값이 있는 경우)
    if (parsed.colors && typeof parsed.colors === 'object') {
      const colorValues = Object.values(parsed.colors)
      const hasDirectColorValues = colorValues.some(value => 
        typeof value === 'string' && (value.startsWith('#') || value.startsWith('rgb'))
      )

      if (hasDirectColorValues) {
        // Flat 형태로 처리
        const theme = convertFlatToThemeData(parsed as FlatThemeJSON)
        return { theme, error: null }
      }
    }
    
    // 기존 복잡한 형태 처리
    if (!parsed.colors || typeof parsed.colors !== 'object') {
      return { theme: null, error: 'colors 속성이 필요합니다.' }
    }
    
    if (!parsed.colors.primary || typeof parsed.colors.primary !== 'object') {
      return { theme: null, error: 'colors.primary 속성이 필요합니다.' }
    }
    
    if (!parsed.colors.secondary || typeof parsed.colors.secondary !== 'object') {
      return { theme: null, error: 'colors.secondary 속성이 필요합니다.' }
    }
    
    // 기본값으로 병합
    const theme: ThemeData = {
      name: parsed.name || "Custom Theme",
      colors: {
        primary: parsed.colors.primary,
        secondary: parsed.colors.secondary,
        success: parsed.colors.success,
        warning: parsed.colors.warning,
        error: parsed.colors.error
      },
      typography: {
        ...defaultTheme.typography,
        ...parsed.typography
      },
      spacing: {
        ...defaultTheme.spacing,
        ...parsed.spacing
      },
      borderRadius: {
        ...defaultTheme.borderRadius,
        ...parsed.borderRadius
      }
    }
    
    return { theme, error: null }
  } catch (err) {
    return { 
      theme: null, 
      error: err instanceof Error ? err.message : '유효하지 않은 JSON 형식입니다.' 
    }
  }
}

// ThemeData를 CSS 커스텀 속성으로 변환
export function generateCssVariables(theme: ThemeData): Record<string, string> {
  const variables: Record<string, string> = {}
  
  // 컬러 변수 생성
  Object.entries(theme.colors).forEach(([colorName, colorPalette]) => {
    if (colorPalette && typeof colorPalette === 'object') {
      Object.entries(colorPalette).forEach(([shade, value]) => {
        if (typeof value === 'string') {
          // #ffffff -> 255 255 255 형태로 변환
          const rgb = hexToRgb(value)
          if (rgb) {
            variables[`--color-${colorName}-${shade}`] = `${rgb.r} ${rgb.g} ${rgb.b}`
          }
        }
      })
    }
  })
  
  // 타이포그래피 변수 생성
  if (theme.typography) {
    Object.entries(theme.typography.fontSize || {}).forEach(([size, value]) => {
      variables[`--font-size-${size}`] = value
    })
    
    if (theme.typography.fontFamily?.sans) {
      variables['--font-family-sans'] = theme.typography.fontFamily.sans.join(', ')
    }
    
    if (theme.typography.fontFamily?.mono) {
      variables['--font-family-mono'] = theme.typography.fontFamily.mono.join(', ')
    }
  }
  
  // 스페이싱 변수 생성
  if (theme.spacing) {
    Object.entries(theme.spacing).forEach(([size, value]) => {
      variables[`--spacing-${size}`] = value
    })
  }
  
  // 보더 라디우스 변수 생성
  if (theme.borderRadius) {
    Object.entries(theme.borderRadius).forEach(([size, value]) => {
      variables[`--border-radius-${size}`] = value
    })
  }
  
  return variables
}

// CSS 변수를 DOM에 적용
export function applyCssVariables(variables: Record<string, string>, element?: HTMLElement) {
  const target = element || document.documentElement
  
  Object.entries(variables).forEach(([property, value]) => {
    target.style.setProperty(property, value)
  })
}

// HEX 색상을 RGB로 변환
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

// CSS 변수 문자열로 변환 (style 태그용)
export function cssVariablesToString(variables: Record<string, string>): string {
  const declarations = Object.entries(variables)
    .map(([property, value]) => `  ${property}: ${value};`)
    .join('\n')
  
  return `:root {\n${declarations}\n}`
}

// 테마 미리보기용 샘플 JSON
export const sampleThemes = {
  modern: {
    name: "Modern Blue",
    colors: {
      primary: {
        "50": "#eff6ff",
        "500": "#3b82f6", 
        "900": "#1e3a8a"
      },
      secondary: {
        "50": "#f8fafc",
        "500": "#64748b",
        "900": "#0f172a"
      }
    }
  },
  dark: {
    name: "Dark Purple",
    colors: {
      primary: {
        "50": "#faf5ff",
        "500": "#8b5cf6",
        "900": "#581c87"
      },
      secondary: {
        "50": "#1e293b", 
        "500": "#475569",
        "900": "#0f172a"
      }
    }
  },
  minimal: {
    name: "Minimal Gray",
    colors: {
      primary: {
        "50": "#f9fafb",
        "500": "#6b7280",
        "900": "#111827"
      },
      secondary: {
        "50": "#f3f4f6",
        "500": "#9ca3af", 
        "900": "#1f2937"
      }
    }
  },
  // 새로운 Flat 형태 샘플 테마들
  flat: {
    colors: {
      primary: "#04bcb4",
      primaryDark: "#02938c", 
      secondary: "#e2f6f5",
      secondaryMedium: "#b8ede8",
      accent: "#FF6B35",
      background: "#FAFBFB",
      foreground: "#1A202C",
      muted: "#F5F7F7",
      mutedForeground: "#8B9898",
      border: "#e2e8f0",
      input: "#e2e8f0",
      ring: "#04bcb4",
      destructive: "#ef4444",
      destructiveForeground: "#ffffff"
    },
    typography: {
      fontFamily: {
        primary: "Pretendard Variable, sans-serif",
        heading: "Manrope, sans-serif", 
        accent: "Noto Serif KR, serif",
        display: "Custom Brutalist, sans-serif"
      },
      fontSize: {
        xs: "0.75rem",
        sm: "0.875rem",
        base: "1rem",
        lg: "1.125rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.875rem",
        "4xl": "2.25rem"
      },
      fontWeight: {
        light: "300",
        normal: "400", 
        medium: "500",
        semibold: "600",
        bold: "700"
      }
    }
  }
}