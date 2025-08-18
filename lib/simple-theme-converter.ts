// 단순한 JSON 형식을 표준 테마 형식으로 변환하는 유틸리티

import { Theme, DEFAULT_THEME } from './theme-parser'
import { hexToHsl, hslToString, isValidColor } from './theme-parser'

// 기본 색상 스케일 (fallback용)
const DEFAULT_COLOR_SCALE: { [key: string]: string } = {
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
}

// 단순한 색상 팔레트에서 색상 스케일 생성
function generateColorScale(baseColor: string): { [key: string]: string } {
  if (!isValidColor(baseColor)) {
    console.warn(`Invalid color: ${baseColor}, using default`)
    return (DEFAULT_THEME.colors && DEFAULT_THEME.colors.primary) ? DEFAULT_THEME.colors.primary : DEFAULT_COLOR_SCALE
  }

  try {
    const { h, s, l } = hexToHsl(baseColor)
    
    return {
      '50': `hsl(${hslToString(h, Math.max(s - 30, 10), Math.min(l + 40, 95))})`,
      '100': `hsl(${hslToString(h, Math.max(s - 20, 15), Math.min(l + 30, 90))})`,
      '200': `hsl(${hslToString(h, Math.max(s - 10, 20), Math.min(l + 20, 80))})`,
      '300': `hsl(${hslToString(h, s, Math.min(l + 10, 70))})`,
      '400': `hsl(${hslToString(h, s, l > 50 ? l - 5 : l + 5)})`,
      '500': `hsl(${hslToString(h, s, l)})`, // 기본 색상
      '600': `hsl(${hslToString(h, Math.min(s + 5, 100), Math.max(l - 10, 20))})`,
      '700': `hsl(${hslToString(h, Math.min(s + 10, 100), Math.max(l - 20, 15))})`,
      '800': `hsl(${hslToString(h, Math.min(s + 15, 100), Math.max(l - 30, 10))})`,
      '900': `hsl(${hslToString(h, Math.min(s + 20, 100), Math.max(l - 40, 5))})`,
    }
  } catch (error) {
    console.warn(`Failed to generate color scale for ${baseColor}:`, error)
    return (DEFAULT_THEME.colors && DEFAULT_THEME.colors.primary) ? DEFAULT_THEME.colors.primary : DEFAULT_COLOR_SCALE
  }
}

// 폰트 패밀리 문자열을 배열로 변환
function parseFontFamily(fontFamily: string | string[]): string[] {
  if (Array.isArray(fontFamily)) {
    return fontFamily
  }
  
  if (typeof fontFamily === 'string') {
    return fontFamily.split(',').map(font => font.trim())
  }
  
  return ['Inter', 'system-ui', 'sans-serif']
}

// 단순 JSON을 표준 테마 형식으로 변환
export function convertSimpleJsonToTheme(simpleJson: any): Theme {
  console.log('Converting simple JSON to theme:', simpleJson)
  
  const converted: Theme = {
    ...DEFAULT_THEME,
    name: simpleJson.name || 'Custom Theme'
  }

  // 색상 처리
  if (simpleJson.colors) {
    const colors = simpleJson.colors
    
    // 단순한 색상 값들을 색상 스케일로 변환
    if (colors.primary && typeof colors.primary === 'string') {
      converted.colors = {
        ...converted.colors,
        primary: generateColorScale(colors.primary)
      }
    }
    
    if (colors.secondary && typeof colors.secondary === 'string') {
      converted.colors = {
        ...converted.colors,
        secondary: generateColorScale(colors.secondary)
      }
    }
    
    // 특별한 색상들 처리
    const specialColors = [
      'primaryDark', 'secondaryMedium', 'accent', 'background', 
      'foreground', 'muted', 'mutedForeground', 'border', 
      'input', 'ring', 'destructive', 'destructiveForeground'
    ]
    
    specialColors.forEach(colorKey => {
      if (colors[colorKey] && typeof colors[colorKey] === 'string') {
        // 특별한 색상들은 neutral 색상 스케일에 추가하거나 새로운 스케일 생성
        if (converted.colors && !converted.colors.neutral) {
          converted.colors = {
            ...converted.colors,
            neutral: generateColorScale(colors[colorKey])
          }
        }
        
        // 또는 accent 색상 스케일 생성
        if (colorKey === 'accent' && converted.colors) {
          converted.colors = {
            ...converted.colors,
            accent: generateColorScale(colors[colorKey])
          }
        }
      }
    })
  }

  // 타이포그래피 처리
  if (simpleJson.typography) {
    const typography = simpleJson.typography
    
    if (typography.fontFamily) {
      const fontFamilies = typography.fontFamily
      
      // 각 폰트 패밀리 타입 처리
      Object.keys(fontFamilies).forEach(key => {
        if (fontFamilies[key] && converted.typography?.fontFamily) {
          converted.typography = {
            ...converted.typography,
            fontFamily: {
              ...converted.typography.fontFamily,
              [key]: parseFontFamily(fontFamilies[key])
            }
          }
        }
      })
      
      // primary를 sans로, heading을 sans로 매핑
      if (fontFamilies.primary && !fontFamilies.sans && converted.typography?.fontFamily) {
        converted.typography = {
          ...converted.typography,
          fontFamily: {
            ...converted.typography.fontFamily,
            sans: parseFontFamily(fontFamilies.primary)
          }
        }
      }
      if (fontFamilies.heading && !fontFamilies.sans && !fontFamilies.primary && converted.typography?.fontFamily) {
        converted.typography = {
          ...converted.typography,
          fontFamily: {
            ...converted.typography.fontFamily,
            sans: parseFontFamily(fontFamilies.heading)
          }
        }
      }
    }
    
    // 폰트 크기 처리
    if (typography.fontSize && converted.typography?.fontSize) {
      converted.typography = {
        ...converted.typography,
        fontSize: {
          ...converted.typography.fontSize,
          ...typography.fontSize
        }
      }
    }
    
    // 폰트 무게 처리
    if (typography.fontWeight) {
      const fontWeight = typography.fontWeight
      const convertedFontWeight: { [key: string]: number } = {}
      
      Object.keys(fontWeight).forEach(key => {
        const weight = fontWeight[key]
        convertedFontWeight[key] = typeof weight === 'string' ? parseInt(weight, 10) : weight
      })
      
      if (converted.typography?.fontWeight) {
        converted.typography = {
          ...converted.typography,
          fontWeight: {
            ...converted.typography.fontWeight,
            ...convertedFontWeight
          }
        }
      }
    }
  }

  // 스페이싱 처리
  if (simpleJson.spacing) {
    converted.spacing = {
      ...converted.spacing,
      ...simpleJson.spacing
    }
  }

  // 보더 라디우스 처리
  if (simpleJson.borderRadius) {
    converted.borderRadius = {
      ...converted.borderRadius,
      ...simpleJson.borderRadius
    }
  }

  console.log('Converted theme:', converted)
  return converted
}

// JSON이 단순한 형식인지 확인
export function isSimpleJsonFormat(json: any): boolean {
  if (!json || typeof json !== 'object') return false
  
  // 단순한 형식의 특징들을 확인
  const hasSimpleColors = json.colors && (
    (json.colors.primary && typeof json.colors.primary === 'string') ||
    (json.colors.secondary && typeof json.colors.secondary === 'string') ||
    json.colors.accent ||
    json.colors.background ||
    json.colors.primaryDark
  )
  
  const hasSimpleTypography = json.typography && (
    json.typography.fontFamily?.primary ||
    json.typography.fontFamily?.heading
  )
  
  return hasSimpleColors || hasSimpleTypography
}