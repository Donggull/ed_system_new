'use client'

import React, { useState, useEffect, useRef } from 'react'
import { PerformanceOptimizationService, PerformanceMetrics, OptimizationSuggestion } from '@/lib/performance/optimization-service'
import { cn } from '@/lib/utils'

interface PerformanceMonitorProps {
  className?: string
  onOptimizationApply?: (suggestion: OptimizationSuggestion) => void
}

export default function PerformanceMonitor({ className, onOptimizationApply }: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([])
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isMonitoring) {
      startMonitoring()
    } else {
      stopMonitoring()
    }

    return () => stopMonitoring()
  }, [isMonitoring])

  const startMonitoring = () => {
    updateMetrics()
    intervalRef.current = setInterval(updateMetrics, 5000) // 5초마다 업데이트
  }

  const stopMonitoring = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const updateMetrics = () => {
    const currentMetrics = PerformanceOptimizationService.getPerformanceMetrics()
    setMetrics(currentMetrics)

    const optimizationSuggestions = PerformanceOptimizationService.generateOptimizationSuggestions(currentMetrics)
    setSuggestions(optimizationSuggestions)
  }

  const handleApplyOptimization = (suggestion: OptimizationSuggestion) => {
    if (suggestion.action) {
      suggestion.action()
    }
    onOptimizationApply?.(suggestion)
    
    // 메트릭 업데이트
    setTimeout(updateMetrics, 1000)
  }

  const getMetricColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-600'
    if (value <= thresholds.warning) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getMetricBgColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'bg-green-100'
    if (value <= thresholds.warning) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200', className)}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900">⚡ 성능 모니터</h3>
            <div className={cn(
              'w-2 h-2 rounded-full',
              isMonitoring ? 'bg-green-400 animate-pulse' : 'bg-gray-300'
            )} />
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              {showDetails ? '간단히' : '자세히'}
            </button>
            <button
              onClick={() => setIsMonitoring(!isMonitoring)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-md',
                isMonitoring
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              )}
            >
              {isMonitoring ? '모니터링 중지' : '모니터링 시작'}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {metrics ? (
          <div className="space-y-6">
            {/* 성능 메트릭 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">현재 성능 지표</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={cn(
                  'p-3 rounded-lg border',
                  getMetricBgColor(metrics.renderTime, { good: 50, warning: 100 })
                )}>
                  <div className={cn(
                    'text-2xl font-bold',
                    getMetricColor(metrics.renderTime, { good: 50, warning: 100 })
                  )}>
                    {metrics.renderTime.toFixed(1)}ms
                  </div>
                  <div className="text-sm text-gray-600">렌더링 시간</div>
                </div>

                <div className={cn(
                  'p-3 rounded-lg border',
                  getMetricBgColor(metrics.memoryUsage, { good: 50, warning: 100 })
                )}>
                  <div className={cn(
                    'text-2xl font-bold',
                    getMetricColor(metrics.memoryUsage, { good: 50, warning: 100 })
                  )}>
                    {metrics.memoryUsage.toFixed(1)}MB
                  </div>
                  <div className="text-sm text-gray-600">메모리 사용량</div>
                </div>

                <div className={cn(
                  'p-3 rounded-lg border',
                  getMetricBgColor(100 - metrics.cacheHitRate, { good: 30, warning: 50 })
                )}>
                  <div className={cn(
                    'text-2xl font-bold',
                    getMetricColor(100 - metrics.cacheHitRate, { good: 30, warning: 50 })
                  )}>
                    {metrics.cacheHitRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">캐시 적중률</div>
                </div>

                <div className={cn(
                  'p-3 rounded-lg border',
                  getMetricBgColor(metrics.bundleSize, { good: 500, warning: 1000 })
                )}>
                  <div className={cn(
                    'text-2xl font-bold',
                    getMetricColor(metrics.bundleSize, { good: 500, warning: 1000 })
                  )}>
                    {metrics.bundleSize}KB
                  </div>
                  <div className="text-sm text-gray-600">번들 크기</div>
                </div>
              </div>
            </div>

            {/* 자세한 메트릭 */}
            {showDetails && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">상세 정보</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>총 컴포넌트 수:</span>
                    <span className="font-medium">{metrics.componentCount}개</span>
                  </div>
                  <div className="flex justify-between">
                    <span>평균 렌더링 시간:</span>
                    <span className="font-medium">{metrics.renderTime.toFixed(2)}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>JavaScript 힙 메모리:</span>
                    <span className="font-medium">{metrics.memoryUsage.toFixed(2)}MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>추정 번들 크기:</span>
                    <span className="font-medium">{metrics.bundleSize}KB</span>
                  </div>
                </div>
              </div>
            )}

            {/* 최적화 제안 */}
            {suggestions.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">최적화 제안</h4>
                <div className="space-y-3">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className={cn(
                        'border rounded-lg p-4',
                        suggestion.priority === 'high' ? 'border-red-200 bg-red-50' :
                        suggestion.priority === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                        'border-blue-200 bg-blue-50'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h5 className="font-medium text-gray-900">{suggestion.title}</h5>
                            <span className={cn(
                              'px-2 py-0.5 rounded-full text-xs font-medium',
                              suggestion.priority === 'high' ? 'bg-red-100 text-red-800' :
                              suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            )}>
                              {suggestion.priority === 'high' ? '높음' :
                               suggestion.priority === 'medium' ? '보통' : '낮음'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {suggestion.type === 'component' ? '컴포넌트' :
                               suggestion.type === 'image' ? '이미지' :
                               suggestion.type === 'bundle' ? '번들' : '캐시'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                          <p className="text-sm text-green-600 font-medium">{suggestion.impact}</p>
                        </div>
                        {suggestion.action && (
                          <button
                            onClick={() => handleApplyOptimization(suggestion)}
                            className="ml-4 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                          >
                            적용
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 성능 점수 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">종합 성능 점수</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">전체 점수</span>
                  <span className="text-lg font-bold text-gray-900">
                    {calculateOverallScore(metrics)}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={cn(
                      'h-3 rounded-full transition-all duration-500',
                      calculateOverallScore(metrics) >= 80 ? 'bg-green-500' :
                      calculateOverallScore(metrics) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    )}
                    style={{ width: `${calculateOverallScore(metrics)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>나쁨</span>
                  <span>보통</span>
                  <span>좋음</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">⚡</div>
            <p>성능 모니터링을 시작하여 메트릭을 확인하세요.</p>
            <p className="text-sm">실시간으로 애플리케이션 성능을 추적하고 최적화 제안을 받아보세요.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function calculateOverallScore(metrics: PerformanceMetrics): number {
  // 각 메트릭의 가중치
  const renderScore = Math.max(0, 100 - (metrics.renderTime / 100) * 100) * 0.3
  const memoryScore = Math.max(0, 100 - (metrics.memoryUsage / 100) * 100) * 0.2
  const cacheScore = metrics.cacheHitRate * 0.2
  const bundleScore = Math.max(0, 100 - (metrics.bundleSize / 1000) * 100) * 0.3

  return Math.round(renderScore + memoryScore + cacheScore + bundleScore)
}