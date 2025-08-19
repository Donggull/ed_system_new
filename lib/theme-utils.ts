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

// Flat JSON 형태 인터페이스 정의 (사용자 제공 형식 지원)
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
      extrabold?: string
      [key: string]: string | undefined
    }
    lineHeight?: {
      tight?: string
      normal?: string
      relaxed?: string
      [key: string]: string | undefined
    }
  }
  spacing?: {
    xs?: string
    sm?: string
    md?: string
    lg?: string
    xl?: string
    '2xl'?: string
    '3xl'?: string
    '4xl'?: string
    [key: string]: string | undefined
  }
  borderRadius?: {
    none?: string
    sm?: string
    md?: string
    lg?: string
    xl?: string
    full?: string
    [key: string]: string | undefined
  }
  shadows?: {
    none?: string
    soft?: string
    medium?: string
    [key: string]: string | undefined
  }
  [key: string]: any
}

// Flat 색상을 TailwindCSS palette로 변환
function flatColorToPalette(color: string): ColorPalette {
  console.log('🎨 Converting color to palette:', color)
  
  // HSL을 사용한 더 정확한 색상 팔레트 생성
  const rgb = hexToRgb(color)
  if (!rgb) {
    console.warn('❌ Invalid color, using fallback palette')
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

  // RGB를 HSL로 변환
  const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b)
  
  // HSL 기반으로 정확한 shade 생성
  const palette = {
    '50': hslToHex(h, s, Math.min(95, l + (95 - l) * 0.8)),
    '100': hslToHex(h, s, Math.min(90, l + (90 - l) * 0.6)),
    '200': hslToHex(h, s, Math.min(80, l + (80 - l) * 0.4)),
    '300': hslToHex(h, s, Math.min(70, l + (70 - l) * 0.2)),
    '400': hslToHex(h, s, Math.min(60, l + (60 - l) * 0.1)),
    '500': color, // 원본 색상
    '600': hslToHex(h, s, Math.max(20, l * 0.85)),
    '700': hslToHex(h, s, Math.max(15, l * 0.7)),
    '800': hslToHex(h, s, Math.max(10, l * 0.55)),
    '900': hslToHex(h, s, Math.max(5, l * 0.4))
  }
  
  console.log('✅ Generated palette:', palette)
  return palette
}

// RGB를 HSL로 변환
function rgbToHsl(r: number, g: number, b: number): { h: number, s: number, l: number } {
  r /= 255
  g /= 255
  b /= 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2
  
  if (max !== min) {
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

// HSL을 HEX로 변환
function hslToHex(h: number, s: number, l: number): string {
  h /= 360
  s /= 100
  l /= 100
  
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs((h * 6) % 2 - 1))
  const m = l - c / 2
  
  let r = 0, g = 0, b = 0
  
  if (0 <= h && h < 1/6) {
    r = c; g = x; b = 0
  } else if (1/6 <= h && h < 2/6) {
    r = x; g = c; b = 0
  } else if (2/6 <= h && h < 3/6) {
    r = 0; g = c; b = x
  } else if (3/6 <= h && h < 4/6) {
    r = 0; g = x; b = c
  } else if (4/6 <= h && h < 5/6) {
    r = x; g = 0; b = c
  } else if (5/6 <= h && h < 1) {
    r = c; g = 0; b = x
  }
  
  r = Math.round((r + m) * 255)
  g = Math.round((g + m) * 255)
  b = Math.round((b + m) * 255)
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

// Flat JSON을 기존 ThemeData 구조로 변환
function convertFlatToThemeData(flatTheme: FlatThemeJSON): ThemeData {
  const colors: any = {}

  if (flatTheme.colors) {
    // Primary 색상 설정
    if (flatTheme.colors.primary) {
      colors.primary = flatColorToPalette(flatTheme.colors.primary)
      console.log('🎨 Primary color palette generated:', colors.primary)
    } else {
      colors.primary = defaultTheme.colors.primary
    }

    // Secondary 색상 설정 - secondary 또는 secondaryMedium 사용
    if (flatTheme.colors.secondary) {
      colors.secondary = flatColorToPalette(flatTheme.colors.secondary)
      console.log('🎨 Secondary color palette generated:', colors.secondary)
    } else if (flatTheme.colors.secondaryMedium) {
      colors.secondary = flatColorToPalette(flatTheme.colors.secondaryMedium)
    } else {
      colors.secondary = defaultTheme.colors.secondary
    }

    // 추가 색상들
    if (flatTheme.colors.destructive) {
      colors.error = flatColorToPalette(flatTheme.colors.destructive)
    } else if (defaultTheme.colors.success) {
      colors.error = defaultTheme.colors.success
    }

    if (flatTheme.colors.accent) {
      colors.success = flatColorToPalette(flatTheme.colors.accent)
    } else if (defaultTheme.colors.success) {
      colors.success = defaultTheme.colors.success
    }

    // 기타 색상들 매핑
    if (flatTheme.colors.primaryDark) {
      colors.warning = flatColorToPalette(flatTheme.colors.primaryDark)
    } else if (defaultTheme.colors.success) {
      colors.warning = defaultTheme.colors.success
    }
  }

  const typography: any = {
    ...defaultTheme.typography
  }

  if (flatTheme.typography) {
    if (flatTheme.typography.fontFamily) {
      // 폰트 패밀리 매핑 개선
      const fontFamilies = flatTheme.typography.fontFamily
      
      typography.fontFamily = {
        sans: fontFamilies.primary ? 
          fontFamilies.primary.split(',').map(f => f.trim()) :
          defaultTheme.typography.fontFamily.sans,
        mono: fontFamilies.accent ? 
          fontFamilies.accent.split(',').map(f => f.trim()) :
          defaultTheme.typography.fontFamily.mono
      }

      // heading과 display 폰트가 있다면 추가
      if (fontFamilies.heading) {
        typography.fontFamily.heading = fontFamilies.heading.split(',').map(f => f.trim())
      }
      if (fontFamilies.display) {
        typography.fontFamily.display = fontFamilies.display.split(',').map(f => f.trim())
      }
    }

    if (flatTheme.typography.fontSize) {
      typography.fontSize = {
        ...defaultTheme.typography.fontSize,
        ...flatTheme.typography.fontSize
      }
    }

    if (flatTheme.typography.fontWeight) {
      typography.fontWeight = {
        ...defaultTheme.typography.fontWeight
      }
      // fontWeight 속성들을 안전하게 복사
      Object.entries(flatTheme.typography.fontWeight).forEach(([key, value]) => {
        if (value) {
          typography.fontWeight[key] = value
        }
      })
    }
  }

  // spacing과 borderRadius 처리 - 타입 안전성 확보
  const spacing = flatTheme.spacing ? {
    ...defaultTheme.spacing,
    ...Object.fromEntries(
      Object.entries(flatTheme.spacing).filter(([, value]) => value !== undefined)
    )
  } : defaultTheme.spacing

  const borderRadius = flatTheme.borderRadius ? {
    ...defaultTheme.borderRadius,
    ...Object.fromEntries(
      Object.entries(flatTheme.borderRadius).filter(([, value]) => value !== undefined)
    )
  } : defaultTheme.borderRadius

  return {
    name: "Custom Theme",
    colors: {
      ...defaultTheme.colors,
      ...colors
    },
    typography,
    spacing,
    borderRadius
  }
}

// JSON 문자열을 ThemeData로 파싱하고 검증 (기존 + 새로운 flat 형태 지원)
export function parseThemeJson(jsonString: string): { theme: ThemeData | null, error: string | null } {
  try {
    const parsed = JSON.parse(jsonString)
    
    console.log('🔍 Parsing JSON input:', parsed)
    
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

      console.log('🎨 Color values found:', colorValues)
      console.log('📊 Has direct color values:', hasDirectColorValues)

      if (hasDirectColorValues) {
        console.log('✅ Processing as flat JSON format')
        // Flat 형태로 처리
        const theme = convertFlatToThemeData(parsed as FlatThemeJSON)
        console.log('🎯 Final converted theme:', theme)
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
  
  console.log('🔄 Generating CSS variables from theme:', theme)
  
  // 컬러 변수 생성 - HEX 값을 직접 사용
  Object.entries(theme.colors).forEach(([colorName, colorPalette]) => {
    if (colorPalette && typeof colorPalette === 'object') {
      Object.entries(colorPalette).forEach(([shade, value]) => {
        if (typeof value === 'string') {
          // 직접 HEX 값 사용 (RGB 변환 없이)
          const varName = `--color-${colorName}-${shade}`
          variables[varName] = value
          
          // RGB 형태도 함께 생성 (기존 호환성을 위해)
          const rgb = hexToRgb(value)
          if (rgb) {
            variables[`--color-${colorName}-${shade}-rgb`] = `${rgb.r} ${rgb.g} ${rgb.b}`
          }
          
          if (colorName === 'primary' && shade === '500') {
            console.log(`🎯 Primary-500 CSS variables:`)
            console.log(`  ${varName} = ${value}`)
            console.log(`  ${varName}-rgb = ${rgb ? `${rgb.r} ${rgb.g} ${rgb.b}` : 'N/A'}`)
          }
        }
      })
    }
  })
  
  console.log('✅ CSS variables generated:', Object.keys(variables).length, 'variables')
  
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
  
  console.log('🎨 Applying CSS variables to DOM:', Object.keys(variables).length, 'variables')
  
  Object.entries(variables).forEach(([property, value]) => {
    target.style.setProperty(property, value)
    if (property === '--color-primary-500') {
      console.log(`🎯 Applied ${property}: ${value}`)
      console.log('🔍 Verification:', target.style.getPropertyValue(property))
    }
  })
  
  console.log('✅ CSS variables applied to:', target === document.documentElement ? 'document.documentElement' : 'custom element')
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
  vibrant: {
    name: "Vibrant Colors",
    colors: {
      primary: {
        "50": "#fdf4ff",
        "500": "#c026d3",
        "900": "#701a75"
      },
      secondary: {
        "50": "#fff7ed",
        "500": "#f97316",
        "900": "#9a3412"
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