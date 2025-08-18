// 실시간 테마 관리 시스템
import { Theme, parseTheme, generateCSSVariables, mergeWithDefaultTheme, DEFAULT_THEME } from './theme-parser'
import { convertSimpleJsonToTheme, isSimpleJsonFormat } from './simple-theme-converter'

export interface ThemeState {
  currentTheme: Theme
  previousTheme: Theme | null
  isValid: boolean
  errors: string[]
  isTransitioning: boolean
}

export interface ThemeUpdateOptions {
  animate?: boolean
  animationDuration?: number
  rollbackOnError?: boolean
}

class ThemeManager {
  private state: ThemeState = {
    currentTheme: DEFAULT_THEME,
    previousTheme: null,
    isValid: true,
    errors: [],
    isTransitioning: false
  }

  private listeners: Array<(state: ThemeState) => void> = []
  private cssVariableCache: Record<string, string> = {}
  private animationTimeouts: Set<NodeJS.Timeout> = new Set()

  constructor() {
    // 브라우저 환경에서만 초기화
    if (typeof window !== 'undefined') {
      this.initializeCSSVariables()
    }
  }

  // 초기 CSS 변수 설정
  private initializeCSSVariables() {
    if (typeof window !== 'undefined') {
      this.updateCSSVariables(this.state.currentTheme, { animate: false })
    }
  }

  // 상태 변경 리스너 등록
  subscribe(listener: (state: ThemeState) => void) {
    this.listeners.push(listener)
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  // 상태 변경 알림
  private notifyListeners() {
    this.listeners.forEach(listener => listener({ ...this.state }))
  }

  // 현재 상태 반환
  getState(): ThemeState {
    return { ...this.state }
  }

  // JSON으로부터 테마 업데이트
  updateThemeFromJSON(jsonString: string, options: ThemeUpdateOptions = {}): boolean {
    const {
      animate = true,
      animationDuration = 300,
      rollbackOnError = true
    } = options

    // 이전 상태 저장
    const previousTheme = { ...this.state.currentTheme }
    
    try {
      // 먼저 JSON 파싱 시도
      const parsedJson = JSON.parse(jsonString)
      
      let finalTheme: Theme
      
      // 단순한 JSON 형식인지 확인
      if (isSimpleJsonFormat(parsedJson)) {
        console.log('Detected simple JSON format, converting to standard theme format')
        finalTheme = convertSimpleJsonToTheme(parsedJson)
      } else {
        // 표준 형식으로 파싱 시도
        const parseResult = parseTheme(jsonString)
        
        if (!parseResult.success) {
          this.state = {
            ...this.state,
            isValid: false,
            errors: parseResult.errors?.map(e => e.message) || ['Unknown error']
          }
          this.notifyListeners()
          return false
        }

        // 기본 테마와 병합
        finalTheme = mergeWithDefaultTheme(parseResult.data!)
      }

      // 최종 테마 적용
      const mergedTheme = finalTheme
    
      // 상태 업데이트
      this.state = {
        currentTheme: mergedTheme,
        previousTheme,
        isValid: true,
        errors: [],
        isTransitioning: animate
      }

      // CSS 변수 업데이트
      this.updateCSSVariables(mergedTheme, { animate, animationDuration })
      
      this.notifyListeners()
      return true
    } catch (error) {
      // JSON 파싱 오류 처리
      this.state = {
        ...this.state,
        isValid: false,
        errors: [error instanceof Error ? `JSON parsing error: ${error.message}` : 'Invalid JSON format']
      }
      this.notifyListeners()
      return false
    }
  }

  // 테마 객체로부터 직접 업데이트
  updateTheme(theme: Partial<Theme>, options: ThemeUpdateOptions = {}): boolean {
    const {
      animate = true,
      animationDuration = 300
    } = options

    try {
      // 이전 상태 저장
      const previousTheme = { ...this.state.currentTheme }
      
      // 기본 테마와 병합
      const mergedTheme = mergeWithDefaultTheme({ ...this.state.currentTheme, ...theme })
      
      // 상태 업데이트
      this.state = {
        currentTheme: mergedTheme,
        previousTheme,
        isValid: true,
        errors: [],
        isTransitioning: animate
      }

      // CSS 변수 업데이트
      this.updateCSSVariables(mergedTheme, { animate, animationDuration })
      
      this.notifyListeners()
      return true
    } catch (error) {
      this.state = {
        ...this.state,
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      }
      this.notifyListeners()
      return false
    }
  }

  // 이전 테마로 롤백
  rollback(options: ThemeUpdateOptions = {}): boolean {
    if (!this.state.previousTheme) {
      return false
    }

    const { animate = true, animationDuration = 300 } = options
    
    this.state = {
      currentTheme: this.state.previousTheme,
      previousTheme: null,
      isValid: true,
      errors: [],
      isTransitioning: animate
    }

    this.updateCSSVariables(this.state.currentTheme, { animate, animationDuration })
    this.notifyListeners()
    return true
  }

  // CSS 변수 업데이트
  private updateCSSVariables(
    theme: Theme, 
    options: { animate?: boolean; animationDuration?: number } = {}
  ) {
    // 브라우저 환경에서만 실행
    if (typeof window === 'undefined') return
    
    const { animate = true, animationDuration = 300 } = options
    const variables = generateCSSVariables(theme)
    const root = document.documentElement

    // 애니메이션 기간 동안 트랜지션 설정
    if (animate) {
      this.setTransition(animationDuration)
    }

    // CSS 변수 업데이트
    Object.entries(variables).forEach(([property, value]) => {
      if (this.cssVariableCache[property] !== value) {
        root.style.setProperty(property, value)
        this.cssVariableCache[property] = value
      }
    })

    // 애니메이션 완료 후 트랜지션 제거 및 상태 업데이트
    if (animate) {
      const timeout = setTimeout(() => {
        this.clearTransition()
        this.state.isTransitioning = false
        this.notifyListeners()
        this.animationTimeouts.delete(timeout)
      }, animationDuration)
      
      this.animationTimeouts.add(timeout)
    } else {
      this.state.isTransitioning = false
    }
  }

  // CSS 트랜지션 설정
  private setTransition(duration: number) {
    if (typeof window === 'undefined') return
    const root = document.documentElement
    const properties = [
      'background-color',
      'border-color',
      'color',
      'fill',
      'stroke',
      'box-shadow',
      'border-radius',
      'font-size',
      'font-weight',
      'line-height',
      'letter-spacing'
    ]

    const transition = properties
      .map(prop => `${prop} ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`)
      .join(', ')

    root.style.setProperty('--theme-transition', transition)
    
    // 모든 요소에 트랜지션 적용
    const style = document.createElement('style')
    style.id = 'theme-transition'
    style.textContent = `
      *, *::before, *::after {
        transition: var(--theme-transition) !important;
      }
    `
    document.head.appendChild(style)
  }

  // CSS 트랜지션 제거
  private clearTransition() {
    if (typeof window === 'undefined') return
    const root = document.documentElement
    root.style.removeProperty('--theme-transition')
    
    const transitionStyle = document.getElementById('theme-transition')
    if (transitionStyle) {
      transitionStyle.remove()
    }
  }

  // 특정 색상 변경
  updateColor(colorName: string, shade: string, color: string, options: ThemeUpdateOptions = {}) {
    const newColors = {
      ...this.state.currentTheme.colors,
      [colorName]: {
        ...this.state.currentTheme.colors?.[colorName],
        [shade]: color
      }
    }

    return this.updateTheme({ colors: newColors }, options)
  }

  // 타이포그래피 업데이트
  updateTypography(typography: Partial<Theme['typography']>, options: ThemeUpdateOptions = {}) {
    const newTypography = {
      ...this.state.currentTheme.typography,
      ...typography
    }

    return this.updateTheme({ typography: newTypography }, options)
  }

  // 간격 업데이트
  updateSpacing(spacing: Partial<Theme['spacing']>, options: ThemeUpdateOptions = {}) {
    const currentSpacing = this.state.currentTheme.spacing || {}
    const newSpacing: Record<string, string> = {}
    
    // 기존 spacing 복사
    Object.entries(currentSpacing).forEach(([key, value]) => {
      if (value !== undefined) {
        newSpacing[key] = value
      }
    })
    
    // 새로운 spacing 추가/업데이트
    if (spacing) {
      Object.entries(spacing).forEach(([key, value]) => {
        if (value !== undefined) {
          newSpacing[key] = value
        }
      })
    }

    return this.updateTheme({ spacing: newSpacing }, options)
  }

  // 정리 (메모리 누수 방지)
  cleanup() {
    this.listeners = []
    this.animationTimeouts.forEach(timeout => clearTimeout(timeout))
    this.animationTimeouts.clear()
    this.clearTransition()
  }

  // CSS 변수 직접 읽기
  getCSSVariable(property: string): string {
    if (typeof window === 'undefined') return ''
    return getComputedStyle(document.documentElement).getPropertyValue(property).trim()
  }

  // 모든 CSS 변수 읽기
  getAllCSSVariables(): Record<string, string> {
    const variables: Record<string, string> = {}
    if (typeof window === 'undefined') return variables
    const computedStyle = getComputedStyle(document.documentElement)
    
    Object.keys(this.cssVariableCache).forEach(property => {
      variables[property] = computedStyle.getPropertyValue(property).trim()
    })
    
    return variables
  }

  // 테마를 JSON 문자열로 변환
  exportTheme(): string {
    return JSON.stringify(this.state.currentTheme, null, 2)
  }

  // 기본 테마로 리셋
  resetToDefault(options: ThemeUpdateOptions = {}) {
    return this.updateTheme(DEFAULT_THEME, options)
  }
}

// 싱글톤 인스턴스
export const themeManager = new ThemeManager()

// React Hook과 유사한 사용법을 위한 함수들
export function useThemeManager() {
  return themeManager
}

// 디바운스된 테마 업데이트를 위한 헬퍼 함수
export function createDebouncedThemeUpdater(delay: number = 300) {
  let timeoutId: NodeJS.Timeout | null = null
  
  return (jsonString: string, options: ThemeUpdateOptions = {}) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = setTimeout(() => {
      themeManager.updateThemeFromJSON(jsonString, options)
      timeoutId = null
    }, delay)
  }
}

// 특정 CSS 속성 변화 감지
export function watchCSSProperty(
  property: string, 
  callback: (oldValue: string, newValue: string) => void
) {
  let oldValue = themeManager.getCSSVariable(property)
  
  const unsubscribe = themeManager.subscribe(() => {
    const newValue = themeManager.getCSSVariable(property)
    if (oldValue !== newValue) {
      callback(oldValue, newValue)
      oldValue = newValue
    }
  })
  
  return unsubscribe
}

export default themeManager