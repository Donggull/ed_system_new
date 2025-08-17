// 테마 파싱 및 검증 시스템
import { z } from 'zod'

// 색상 값 검증을 위한 정규 표현식
const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
const RGB_COLOR_REGEX = /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/
const RGBA_COLOR_REGEX = /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0|1|0?\.\d+)\s*\)$/
const HSL_COLOR_REGEX = /^hsl\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)$/
const HSLA_COLOR_REGEX = /^hsla\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*,\s*(0|1|0?\.\d+)\s*\)$/

// CSS 변수명 검증
const CSS_VAR_REGEX = /^[a-zA-Z-][a-zA-Z0-9-]*$/

// 색상 검증 함수
export function isValidColor(color: string): boolean {
  if (!color || typeof color !== 'string') return false
  
  const trimmedColor = color.trim()
  
  return (
    HEX_COLOR_REGEX.test(trimmedColor) ||
    RGB_COLOR_REGEX.test(trimmedColor) ||
    RGBA_COLOR_REGEX.test(trimmedColor) ||
    HSL_COLOR_REGEX.test(trimmedColor) ||
    HSLA_COLOR_REGEX.test(trimmedColor) ||
    isNamedColor(trimmedColor)
  )
}

// CSS 명명된 색상 (일부만 포함)
const NAMED_COLORS = new Set([
  'transparent', 'currentColor', 'inherit', 'initial', 'unset',
  'black', 'white', 'red', 'green', 'blue', 'yellow', 'orange', 'purple',
  'gray', 'grey', 'brown', 'pink', 'cyan', 'magenta', 'lime', 'navy',
  'maroon', 'olive', 'teal', 'silver', 'aqua', 'fuchsia'
])

function isNamedColor(color: string): boolean {
  return NAMED_COLORS.has(color.toLowerCase())
}

// HSL 색상을 HSL string으로 변환
export function hslToString(h: number, s: number, l: number): string {
  return `${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%`
}

// HEX를 HSL로 변환
export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const diff = max - min

  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (diff !== 0) {
    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / diff + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / diff + 2) / 6
        break
      case b:
        h = ((r - g) / diff + 4) / 6
        break
    }
  }

  return {
    h: h * 360,
    s: s * 100,
    l: l * 100
  }
}

// RGB를 HSL로 변환
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  return hexToHsl(`#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`)
}

// 색상을 HSL CSS 변수 형식으로 변환
export function colorToHslVariable(color: string): string {
  if (!isValidColor(color)) {
    throw new Error(`Invalid color: ${color}`)
  }

  const trimmedColor = color.trim()

  // 이미 HSL 형식인 경우
  if (HSL_COLOR_REGEX.test(trimmedColor)) {
    const match = trimmedColor.match(/hsl\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)/)
    if (match) {
      return `${match[1]} ${match[2]}% ${match[3]}%`
    }
  }

  // HEX 색상인 경우
  if (HEX_COLOR_REGEX.test(trimmedColor)) {
    const hsl = hexToHsl(trimmedColor)
    return hslToString(hsl.h, hsl.s, hsl.l)
  }

  // RGB 색상인 경우
  if (RGB_COLOR_REGEX.test(trimmedColor)) {
    const match = trimmedColor.match(RGB_COLOR_REGEX)
    if (match) {
      const hsl = rgbToHsl(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]))
      return hslToString(hsl.h, hsl.s, hsl.l)
    }
  }

  // 명명된 색상이나 기타 경우는 그대로 반환
  return trimmedColor
}

// 테마 스키마 정의
const ColorShadeSchema = z.record(z.string(), z.string().refine(isValidColor, {
  message: 'Invalid color format'
}))

const ColorsSchema = z.object({
  primary: ColorShadeSchema.optional(),
  secondary: ColorShadeSchema.optional(),
  accent: ColorShadeSchema.optional(),
  neutral: ColorShadeSchema.optional(),
  success: ColorShadeSchema.optional(),
  warning: ColorShadeSchema.optional(),
  error: ColorShadeSchema.optional(),
  info: ColorShadeSchema.optional()
}).catchall(ColorShadeSchema)

const TypographySchema = z.object({
  fontFamily: z.record(z.string(), z.array(z.string())).optional(),
  fontSize: z.record(z.string(), z.string()).optional(),
  fontWeight: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
  lineHeight: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
  letterSpacing: z.record(z.string(), z.string()).optional()
})

const SpacingSchema = z.record(z.string(), z.string())

const BorderRadiusSchema = z.record(z.string(), z.string())

const ShadowSchema = z.record(z.string(), z.string())

const ThemeSchema = z.object({
  name: z.string().min(1, 'Theme name is required'),
  colors: ColorsSchema.optional(),
  typography: TypographySchema.optional(),
  spacing: SpacingSchema.optional(),
  borderRadius: BorderRadiusSchema.optional(),
  shadows: ShadowSchema.optional(),
  // 커스텀 속성도 허용
}).passthrough()

export type Theme = z.infer<typeof ThemeSchema>
export type ValidationError = {
  path: string[]
  message: string
  code: string
}

// 기본 테마 정의
export const DEFAULT_THEME: Theme = {
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
      '900': '#1e3a8a'
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
      '900': '#0f172a'
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
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  },
  spacing: {
    '0': '0',
    '1': '0.25rem',
    '2': '0.5rem',
    '3': '0.75rem',
    '4': '1rem',
    '5': '1.25rem',
    '6': '1.5rem',
    '8': '2rem',
    '10': '2.5rem',
    '12': '3rem'
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
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
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
  }
}

// 테마 파싱 및 검증
export function parseTheme(jsonString: string): { 
  success: boolean
  data?: Theme
  errors?: ValidationError[]
  originalData?: any
} {
  try {
    // JSON 파싱
    const parsed = JSON.parse(jsonString)
    
    // 스키마 검증
    const result = ThemeSchema.safeParse(parsed)
    
    if (result.success) {
      return {
        success: true,
        data: result.data,
        originalData: parsed
      }
    } else {
      // Zod 오류를 사용자 친화적 형식으로 변환
      const errors: ValidationError[] = result.error.issues.map(error => ({
        path: error.path.map(String),
        message: getReadableErrorMessage(error),
        code: error.code
      }))
      
      return {
        success: false,
        errors,
        originalData: parsed
      }
    }
  } catch (error) {
    return {
      success: false,
      errors: [{
        path: [],
        message: error instanceof Error ? `JSON parsing error: ${error.message}` : 'Invalid JSON format',
        code: 'invalid_json'
      }]
    }
  }
}

// 사용자 친화적 오류 메시지 생성
function getReadableErrorMessage(error: any): string {
  const path = error.path.join('.')
  
  switch (error.code) {
    case 'invalid_type':
      return `${path}: Expected ${error.expected} but got ${error.received}`
    case 'too_small':
      return `${path}: Value is too small (minimum: ${error.minimum})`
    case 'custom':
      return `${path}: ${error.message}`
    case 'invalid_string':
      return `${path}: Invalid string format`
    default:
      return `${path}: ${error.message || 'Invalid value'}`
  }
}

// 테마를 기본 테마와 병합
export function mergeWithDefaultTheme(theme: Partial<Theme>): Theme {
  return {
    ...DEFAULT_THEME,
    ...theme,
    colors: {
      ...DEFAULT_THEME.colors,
      ...theme.colors
    },
    typography: {
      ...DEFAULT_THEME.typography,
      ...theme.typography
    },
    spacing: {
      ...DEFAULT_THEME.spacing,
      ...theme.spacing
    },
    borderRadius: {
      ...DEFAULT_THEME.borderRadius,
      ...theme.borderRadius
    },
    shadows: {
      ...DEFAULT_THEME.shadows,
      ...theme.shadows
    }
  }
}

// CSS 변수 생성
export function generateCSSVariables(theme: Theme): Record<string, string> {
  const variables: Record<string, string> = {}

  // 색상 변수 생성
  if (theme.colors) {
    Object.entries(theme.colors).forEach(([colorName, shades]) => {
      if (typeof shades === 'object') {
        Object.entries(shades).forEach(([shade, color]) => {
          try {
            const hslValue = colorToHslVariable(color)
            variables[`--color-${colorName}-${shade}`] = hslValue
          } catch (error) {
            console.warn(`Failed to convert color ${colorName}-${shade}: ${color}`)
          }
        })
      }
    })
  }

  // 타이포그래피 변수 생성
  if (theme.typography) {
    const { fontFamily, fontSize, fontWeight, lineHeight, letterSpacing } = theme.typography
    
    if (fontFamily) {
      Object.entries(fontFamily).forEach(([name, families]) => {
        variables[`--font-${name}`] = families.join(', ')
      })
    }
    
    if (fontSize) {
      Object.entries(fontSize).forEach(([name, size]) => {
        variables[`--text-${name}`] = size
      })
    }
    
    if (fontWeight) {
      Object.entries(fontWeight).forEach(([name, weight]) => {
        variables[`--font-weight-${name}`] = String(weight)
      })
    }
    
    if (lineHeight) {
      Object.entries(lineHeight).forEach(([name, height]) => {
        variables[`--line-height-${name}`] = String(height)
      })
    }
    
    if (letterSpacing) {
      Object.entries(letterSpacing).forEach(([name, spacing]) => {
        variables[`--letter-spacing-${name}`] = spacing
      })
    }
  }

  // 간격 변수 생성
  if (theme.spacing) {
    Object.entries(theme.spacing).forEach(([name, value]) => {
      variables[`--spacing-${name}`] = value
    })
  }

  // 둥근 모서리 변수 생성
  if (theme.borderRadius) {
    Object.entries(theme.borderRadius).forEach(([name, value]) => {
      variables[`--radius-${name}`] = value
    })
  }

  // 그림자 변수 생성
  if (theme.shadows) {
    Object.entries(theme.shadows).forEach(([name, value]) => {
      variables[`--shadow-${name}`] = value
    })
  }

  return variables
}

// CSS 문자열 생성
export function generateCSSString(theme: Theme): string {
  const variables = generateCSSVariables(theme)
  
  const cssRules = Object.entries(variables)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n')
    
  return `:root {\n${cssRules}\n}`
}

// 테마 검증만 수행 (파싱 없이)
export function validateThemeStructure(theme: any): {
  isValid: boolean
  errors?: ValidationError[]
} {
  const result = ThemeSchema.safeParse(theme)
  
  if (result.success) {
    return { isValid: true }
  }
  
  const errors: ValidationError[] = result.error.issues.map(error => ({
    path: error.path.map(String),
    message: getReadableErrorMessage(error),
    code: error.code
  }))
  
  return {
    isValid: false,
    errors
  }
}