import { ThemeData } from '@/types/database'

export interface CSSVariables {
  variables: Record<string, string>
  cssContent: string
  tailwindConfig: string
}

export class CSSVariablesGenerator {
  private theme: ThemeData

  constructor(theme: ThemeData) {
    this.theme = theme
  }

  /**
   * 테마 데이터를 CSS 변수로 변환
   */
  generateCSSVariables(): CSSVariables {
    const variables: Record<string, string> = {}
    
    // 색상 변수 생성
    this.generateColorVariables(variables)
    
    // 타이포그래피 변수 생성
    this.generateTypographyVariables(variables)
    
    // 간격 변수 생성
    this.generateSpacingVariables(variables)
    
    // 테두리 반경 변수 생성
    this.generateBorderRadiusVariables(variables)

    return {
      variables,
      cssContent: this.generateCSSContent(variables),
      tailwindConfig: this.generateTailwindConfig(variables)
    }
  }

  /**
   * 색상 CSS 변수 생성
   */
  private generateColorVariables(variables: Record<string, string>) {
    const { colors } = this.theme
    
    Object.entries(colors).forEach(([colorName, palette]) => {
      if (typeof palette === 'object' && palette !== null) {
        // 팔레트 색상 처리
        Object.entries(palette as Record<string, string>).forEach(([shade, value]) => {
          const cssVar = `--color-${colorName}-${shade}`
          variables[cssVar] = this.convertToHSL(value)
          
          // RGB 값도 함께 생성 (필요한 경우를 위해)
          variables[`${cssVar}-rgb`] = this.convertToRGB(value)
        })
      } else {
        // 단일 색상 처리
        const cssVar = `--color-${colorName}`
        variables[cssVar] = this.convertToHSL(palette as string)
        variables[`${cssVar}-rgb`] = this.convertToRGB(palette as string)
      }
    })
  }

  /**
   * 타이포그래피 CSS 변수 생성
   */
  private generateTypographyVariables(variables: Record<string, string>) {
    const { typography } = this.theme
    
    // 폰트 패밀리
    Object.entries(typography.fontFamily).forEach(([key, value]) => {
      variables[`--font-family-${key}`] = Array.isArray(value) ? value.join(', ') : value
    })
    
    // 폰트 크기
    Object.entries(typography.fontSize).forEach(([key, value]) => {
      variables[`--font-size-${key}`] = value
      // line-height 계산 (폰트 크기의 1.5배)
      const numericValue = parseFloat(value)
      const unit = value.replace(numericValue.toString(), '')
      variables[`--line-height-${key}`] = `${numericValue * 1.5}${unit}`
    })
  }

  /**
   * 간격 CSS 변수 생성
   */
  private generateSpacingVariables(variables: Record<string, string>) {
    const { spacing } = this.theme
    
    Object.entries(spacing).forEach(([key, value]) => {
      variables[`--spacing-${key}`] = value
      // 여백과 패딩 모두에 사용할 수 있도록
      variables[`--margin-${key}`] = value
      variables[`--padding-${key}`] = value
    })
  }

  /**
   * 테두리 반경 CSS 변수 생성
   */
  private generateBorderRadiusVariables(variables: Record<string, string>) {
    const { borderRadius } = this.theme
    
    Object.entries(borderRadius).forEach(([key, value]) => {
      variables[`--border-radius-${key}`] = value
    })
  }

  /**
   * HEX 색상을 HSL로 변환
   */
  private convertToHSL(hex: string): string {
    if (!hex.startsWith('#')) return hex
    
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const diff = max - min
    const add = max + min
    const l = add * 0.5

    let h: number, s: number

    if (diff === 0) {
      h = s = 0
    } else {
      s = l < 0.5 ? diff / add : diff / (2 - add)
      
      switch (max) {
        case r: h = ((g - b) / diff) + (g < b ? 6 : 0); break
        case g: h = (b - r) / diff + 2; break
        case b: h = (r - g) / diff + 4; break
        default: h = 0
      }
      h /= 6
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
  }

  /**
   * HEX 색상을 RGB로 변환
   */
  private convertToRGB(hex: string): string {
    if (!hex.startsWith('#')) return hex
    
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    
    return `${r} ${g} ${b}`
  }

  /**
   * CSS 내용 생성
   */
  private generateCSSContent(variables: Record<string, string>): string {
    const cssVariables = Object.entries(variables)
      .map(([key, value]) => `  ${key}: ${value};`)
      .join('\n')

    return `:root {
${cssVariables}
}

/* 다크 모드 지원 */
@media (prefers-color-scheme: dark) {
  :root {
    /* 다크 모드용 색상 오버라이드 */
    --color-primary-50: var(--color-primary-900);
    --color-primary-900: var(--color-primary-50);
  }
}

/* 유틸리티 클래스 */
.theme-transition {
  transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out, border-color 0.2s ease-in-out;
}

.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500;
}

.disabled-styles {
  @apply opacity-50 cursor-not-allowed pointer-events-none;
}

/* 접근성 개선 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* 고대비 모드 지원 */
@media (prefers-contrast: high) {
  :root {
    --color-primary-500: #000000;
    --color-secondary-500: #666666;
  }
}

/* 모션 감소 지원 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}`
  }

  /**
   * Tailwind CSS 설정 생성
   */
  private generateTailwindConfig(variables: Record<string, string>): string {
    const colorConfig = this.generateTailwindColorConfig()
    const spacingConfig = this.generateTailwindSpacingConfig()
    const typographyConfig = this.generateTailwindTypographyConfig()
    const borderRadiusConfig = this.generateTailwindBorderRadiusConfig()

    return `/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {${colorConfig}
      },
      spacing: {${spacingConfig}
      },
      fontSize: {${typographyConfig}
      },
      borderRadius: {${borderRadiusConfig}
      },
      fontFamily: {
        sans: ['var(--font-family-sans)', 'ui-sans-serif', 'system-ui'],
        mono: ['var(--font-family-mono)', 'ui-monospace', 'monospace'],
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-in": {
          from: { transform: "translateY(-10px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
}`
  }

  /**
   * Tailwind 색상 설정 생성
   */
  private generateTailwindColorConfig(): string {
    const { colors } = this.theme
    const colorEntries: string[] = []

    Object.entries(colors).forEach(([colorName, palette]) => {
      if (typeof palette === 'object' && palette !== null) {
        const shades = Object.keys(palette as Record<string, string>)
          .map(shade => `          "${shade}": "hsl(var(--color-${colorName}-${shade}))"`)
          .join(',\n')
        
        colorEntries.push(`
        ${colorName}: {
${shades}
        }`)
      } else {
        colorEntries.push(`        ${colorName}: "hsl(var(--color-${colorName}))"`)
      }
    })

    return colorEntries.join(',')
  }

  /**
   * Tailwind 간격 설정 생성
   */
  private generateTailwindSpacingConfig(): string {
    const { spacing } = this.theme
    
    return Object.keys(spacing)
      .map(key => `        "${key}": "var(--spacing-${key})"`)
      .join(',\n')
  }

  /**
   * Tailwind 타이포그래피 설정 생성
   */
  private generateTailwindTypographyConfig(): string {
    const { typography } = this.theme
    
    return Object.keys(typography.fontSize)
      .map(key => `        "${key}": ["var(--font-size-${key})", { lineHeight: "var(--line-height-${key})" }]`)
      .join(',\n')
  }

  /**
   * Tailwind 테두리 반경 설정 생성
   */
  private generateTailwindBorderRadiusConfig(): string {
    const { borderRadius } = this.theme
    
    return Object.keys(borderRadius)
      .map(key => `        "${key}": "var(--border-radius-${key})"`)
      .join(',\n')
  }

  /**
   * 다이나믹 테마 변경을 위한 JavaScript 코드 생성
   */
  generateThemeToggleScript(): string {
    return `// 테마 변경 유틸리티
class ThemeManager {
  constructor() {
    this.currentTheme = 'light'
    this.init()
  }

  init() {
    // 저장된 테마 설정 로드
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      this.setTheme(savedTheme)
    } else {
      // 시스템 설정에 따라 초기 테마 결정
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      this.setTheme(prefersDark ? 'dark' : 'light')
    }

    // 시스템 설정 변경 감지
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        this.setTheme(e.matches ? 'dark' : 'light')
      }
    })
  }

  setTheme(theme) {
    this.currentTheme = theme
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
    
    // 커스텀 이벤트 발생
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }))
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light'
    this.setTheme(newTheme)
  }

  updateCSSVariables(variables) {
    const root = document.documentElement
    Object.entries(variables).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
  }
}

// 전역 테마 관리자 인스턴스
window.themeManager = new ThemeManager()

// React 컴포넌트에서 사용할 훅
export function useTheme() {
  const [theme, setTheme] = React.useState(() => 
    typeof window !== 'undefined' ? window.themeManager?.currentTheme || 'light' : 'light'
  )

  React.useEffect(() => {
    const handleThemeChange = (e) => {
      setTheme(e.detail.theme)
    }

    window.addEventListener('themechange', handleThemeChange)
    return () => window.removeEventListener('themechange', handleThemeChange)
  }, [])

  const toggleTheme = React.useCallback(() => {
    window.themeManager?.toggleTheme()
  }, [])

  const updateTheme = React.useCallback((variables) => {
    window.themeManager?.updateCSSVariables(variables)
  }, [])

  return { theme, toggleTheme, updateTheme }
}`
  }
}