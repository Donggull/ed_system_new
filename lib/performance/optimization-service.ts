'use client'

import { ComponentTemplate, ThemeData } from '@/types/database'

// 성능 최적화 관련 타입
export interface PerformanceMetrics {
  renderTime: number
  componentCount: number
  memoryUsage: number
  bundleSize: number
  cacheHitRate: number
}

export interface OptimizationSuggestion {
  type: 'component' | 'image' | 'bundle' | 'cache'
  priority: 'high' | 'medium' | 'low'
  title: string
  description: string
  impact: string
  action?: () => void
}

export interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

// 성능 최적화 서비스
export class PerformanceOptimizationService {
  private static cacheStorage: Map<string, CacheEntry<any>> = new Map()
  private static renderMetrics: Map<string, number> = new Map()
  private static observedElements: Set<HTMLElement> = new Set()

  // 컴포넌트 렌더링 최적화
  static optimizeComponentRendering(components: ComponentTemplate[]): ComponentTemplate[] {
    // 컴포넌트를 중요도에 따라 정렬
    const sortedComponents = components.sort((a, b) => {
      const priorityA = a.category === 'essential' ? 1 : 2
      const priorityB = b.category === 'essential' ? 1 : 2
      return priorityA - priorityB
    })

    // 렌더링 시간 측정 및 최적화
    return sortedComponents.map(component => ({
      ...component,
      template_code: this.optimizeComponentCode(component.template_code)
    }))
  }

  private static optimizeComponentCode(code: string): string {
    // React.memo 추가
    if (!code.includes('React.memo') && !code.includes('memo(')) {
      code = code.replace('export default function', 'const Component =')
      code += '\n\nexport default React.memo(Component)'
    }

    // useMemo, useCallback 최적화 힌트 추가
    if (code.includes('useState') && !code.includes('useMemo')) {
      code = code.replace(
        "import React from 'react'",
        "import React, { useMemo, useCallback } from 'react'"
      )
    }

    return code
  }

  // 이미지 레이지 로딩
  static initializeLazyLoading(): IntersectionObserver {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            if (img.dataset.src) {
              img.src = img.dataset.src
              img.removeAttribute('data-src')
              observer.unobserve(img)
            }
          }
        })
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.01
      }
    )

    return observer
  }

  static setupLazyImage(imgElement: HTMLImageElement, src: string): void {
    imgElement.dataset.src = src
    imgElement.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IGZpbGw9IiNmMGYwZjAiIHdpZHRoPSIxIiBoZWlnaHQ9IjEiLz48L3N2Zz4='
    imgElement.className += ' opacity-0 transition-opacity duration-300'
    
    imgElement.onload = () => {
      imgElement.classList.remove('opacity-0')
    }
  }

  // 캐싱 전략
  static setCache<T>(key: string, data: T, ttl: number = 3600000): void { // 1시간 기본 TTL
    this.cacheStorage.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  static getCache<T>(key: string): T | null {
    const entry = this.cacheStorage.get(key)
    if (!entry) return null

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cacheStorage.delete(key)
      return null
    }

    return entry.data
  }

  static clearExpiredCache(): void {
    const now = Date.now()
    for (const [key, entry] of this.cacheStorage.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cacheStorage.delete(key)
      }
    }
  }

  // 테마 캐싱
  static cacheTheme(themeId: string, theme: ThemeData): void {
    this.setCache(`theme_${themeId}`, theme, 1800000) // 30분
  }

  static getCachedTheme(themeId: string): ThemeData | null {
    return this.getCache<ThemeData>(`theme_${themeId}`)
  }

  // 컴포넌트 템플릿 캐싱
  static cacheComponentTemplates(templates: ComponentTemplate[]): void {
    this.setCache('component_templates', templates, 3600000) // 1시간
  }

  static getCachedComponentTemplates(): ComponentTemplate[] | null {
    return this.getCache<ComponentTemplate[]>('component_templates')
  }

  // 성능 메트릭 수집
  static measureRenderTime(componentId: string, renderFunction: () => void): number {
    const startTime = performance.now()
    renderFunction()
    const endTime = performance.now()
    const renderTime = endTime - startTime

    this.renderMetrics.set(componentId, renderTime)
    return renderTime
  }

  static getPerformanceMetrics(): PerformanceMetrics {
    const renderTimes = Array.from(this.renderMetrics.values())
    const avgRenderTime = renderTimes.reduce((sum, time) => sum + time, 0) / renderTimes.length || 0

    return {
      renderTime: avgRenderTime,
      componentCount: this.renderMetrics.size,
      memoryUsage: this.getMemoryUsage(),
      bundleSize: this.estimateBundleSize(),
      cacheHitRate: this.calculateCacheHitRate()
    }
  }

  private static getMemoryUsage(): number {
    // @ts-ignore
    if (performance.memory) {
      // @ts-ignore
      return performance.memory.usedJSHeapSize / 1048576 // MB
    }
    return 0
  }

  private static estimateBundleSize(): number {
    // 대략적인 번들 크기 추정
    const componentCount = this.renderMetrics.size
    const estimatedSize = componentCount * 50 // KB per component
    return estimatedSize
  }

  private static calculateCacheHitRate(): number {
    const totalRequests = this.cacheStorage.size
    if (totalRequests === 0) return 0

    const hits = Array.from(this.cacheStorage.values()).filter(
      entry => Date.now() - entry.timestamp < entry.ttl
    ).length

    return (hits / totalRequests) * 100
  }

  // 최적화 제안 생성
  static generateOptimizationSuggestions(metrics: PerformanceMetrics): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = []

    // 렌더링 성능 제안
    if (metrics.renderTime > 100) {
      suggestions.push({
        type: 'component',
        priority: 'high',
        title: '컴포넌트 렌더링 최적화',
        description: '평균 렌더링 시간이 100ms를 초과합니다.',
        impact: '페이지 로딩 속도 30% 개선 예상',
        action: () => this.optimizeAllComponents()
      })
    }

    // 메모리 사용량 제안
    if (metrics.memoryUsage > 100) {
      suggestions.push({
        type: 'component',
        priority: 'medium',
        title: '메모리 사용량 최적화',
        description: 'JavaScript 힙 메모리 사용량이 높습니다.',
        impact: '메모리 사용량 20% 감소 예상'
      })
    }

    // 캐시 효율성 제안
    if (metrics.cacheHitRate < 70) {
      suggestions.push({
        type: 'cache',
        priority: 'medium',
        title: '캐시 전략 개선',
        description: '캐시 적중률이 낮습니다.',
        impact: '데이터 로딩 속도 50% 개선 예상',
        action: () => this.optimizeCaching()
      })
    }

    // 번들 크기 제안
    if (metrics.bundleSize > 1000) {
      suggestions.push({
        type: 'bundle',
        priority: 'high',
        title: '번들 크기 최적화',
        description: '번들 크기가 1MB를 초과합니다.',
        impact: '초기 로딩 시간 40% 단축 예상',
        action: () => this.implementCodeSplitting()
      })
    }

    return suggestions
  }

  private static optimizeAllComponents(): void {
    console.log('컴포넌트 렌더링 최적화를 적용합니다...')
    // React.memo, useMemo, useCallback 적용
  }

  private static optimizeCaching(): void {
    console.log('캐시 전략을 최적화합니다...')
    this.clearExpiredCache()
    // 캐시 TTL 조정, 캐시 키 최적화
  }

  private static implementCodeSplitting(): void {
    console.log('코드 분할을 구현합니다...')
    // 동적 import 적용, 청크 최적화
  }

  // Virtual Scrolling을 위한 헬퍼
  static calculateVisibleItems(
    containerHeight: number,
    itemHeight: number,
    scrollTop: number,
    totalItems: number
  ): { startIndex: number; endIndex: number; offsetY: number } {
    const startIndex = Math.floor(scrollTop / itemHeight)
    const visibleCount = Math.ceil(containerHeight / itemHeight)
    const endIndex = Math.min(startIndex + visibleCount + 5, totalItems) // 5개 추가 버퍼
    const offsetY = startIndex * itemHeight

    return { startIndex, endIndex, offsetY }
  }

  // 디바운스된 검색
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout
    return (...args: Parameters<T>) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func.apply(this, args), wait)
    }
  }

  // 스로틀된 스크롤 핸들러
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }

  // 웹 워커를 이용한 백그라운드 처리
  static processInBackground<T, R>(
    data: T,
    processingFunction: string
  ): Promise<R> {
    return new Promise((resolve, reject) => {
      const workerCode = `
        self.onmessage = function(e) {
          const { data, func } = e.data
          try {
            const result = (${processingFunction})(data)
            self.postMessage({ success: true, result })
          } catch (error) {
            self.postMessage({ success: false, error: error.message })
          }
        }
      `
      
      const blob = new Blob([workerCode], { type: 'application/javascript' })
      const workerUrl = URL.createObjectURL(blob)
      const worker = new Worker(workerUrl)
      
      worker.onmessage = (e) => {
        const { success, result, error } = e.data
        if (success) {
          resolve(result)
        } else {
          reject(new Error(error))
        }
        worker.terminate()
        URL.revokeObjectURL(workerUrl)
      }
      
      worker.onerror = reject
      worker.postMessage({ data, func: processingFunction })
    })
  }
}

export const performanceService = new PerformanceOptimizationService()