'use client'

import React, { useState, useEffect } from 'react'
import { ComponentTemplate } from '@/types/database'
import { PerformanceOptimizationService, OptimizationSuggestion } from '@/lib/performance/optimization-service'
import { cn } from '@/lib/utils'
import PerformanceMonitor from './PerformanceMonitor'
import LazyImageLoader from './LazyImageLoader'
import { VirtualizedComponentList } from './VirtualizedList'

interface PerformanceHubProps {
  components: ComponentTemplate[]
  className?: string
  onOptimizationApply?: (suggestion: OptimizationSuggestion) => void
}

export default function PerformanceHub({ 
  components, 
  className, 
  onOptimizationApply 
}: PerformanceHubProps) {
  const [activeTab, setActiveTab] = useState<'monitor' | 'optimization' | 'caching' | 'components'>('monitor')
  const [optimizedComponents, setOptimizedComponents] = useState<ComponentTemplate[]>([])
  const [cacheStatus, setCacheStatus] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    // 컴포넌트 최적화 적용
    const optimized = PerformanceOptimizationService.optimizeComponentRendering(components)
    setOptimizedComponents(optimized)

    // 캐시된 컴포넌트 템플릿 확인
    const cached = PerformanceOptimizationService.getCachedComponentTemplates()
    if (!cached) {
      PerformanceOptimizationService.cacheComponentTemplates(components)
    }

    // 캐시 상태 업데이트
    updateCacheStatus()
  }, [components])

  const updateCacheStatus = () => {
    const status: { [key: string]: boolean } = {}
    components.forEach(component => {
      // 캐시 키별 상태 확인 (실제로는 캐시 서비스에서 확인)
      status[component.id] = Math.random() > 0.3 // 시뮬레이션
    })
    setCacheStatus(status)
  }

  const handleClearCache = () => {
    PerformanceOptimizationService.clearExpiredCache()
    updateCacheStatus()
    alert('캐시가 정리되었습니다.')
  }

  const handleOptimizeComponents = () => {
    const optimized = PerformanceOptimizationService.optimizeComponentRendering(components)
    setOptimizedComponents(optimized)
    alert('컴포넌트가 최적화되었습니다.')
  }

  const tabs = [
    { id: 'monitor', label: '성능 모니터', icon: '📊' },
    { id: 'optimization', label: '자동 최적화', icon: '⚡' },
    { id: 'caching', label: '캐시 관리', icon: '💾' },
    { id: 'components', label: '가상화', icon: '🔄' },
  ] as const

  return (
    <div className={cn('bg-gray-50 rounded-lg', className)}>
      {/* 탭 메뉴 */}
      <div className="border-b border-gray-200 bg-white rounded-t-lg">
        <div className="flex space-x-1 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              )}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 컨텐츠 영역 */}
      <div className="p-6">
        {activeTab === 'monitor' && (
          <PerformanceMonitor 
            onOptimizationApply={onOptimizationApply}
          />
        )}

        {activeTab === 'optimization' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">⚡ 자동 최적화</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 컴포넌트 최적화 */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h4 className="font-medium text-gray-900 mb-2">컴포넌트 렌더링 최적화</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    React.memo, useMemo, useCallback을 자동으로 적용하여 불필요한 리렌더링을 방지합니다.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {optimizedComponents.length}개 컴포넌트 최적화됨
                    </span>
                    <button
                      onClick={handleOptimizeComponents}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      최적화 적용
                    </button>
                  </div>
                </div>

                {/* 이미지 최적화 */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h4 className="font-medium text-gray-900 mb-2">이미지 레이지 로딩</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    뷰포트에 들어올 때만 이미지를 로드하여 초기 로딩 시간을 단축합니다.
                  </p>
                  <div className="space-y-2">
                    <LazyImageLoader
                      src="/api/placeholder/300/200"
                      alt="성능 최적화 예시"
                      width={300}
                      height={200}
                      className="rounded border border-gray-200"
                    />
                    <p className="text-xs text-gray-500">
                      ↑ 레이지 로딩이 적용된 이미지 예시
                    </p>
                  </div>
                </div>
              </div>

              {/* 코드 분할 */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 mt-6">
                <h4 className="font-medium text-gray-900 mb-2">코드 분할 및 동적 임포트</h4>
                <p className="text-sm text-gray-600 mb-4">
                  필요할 때만 컴포넌트를 로드하여 초기 번들 크기를 줄입니다.
                </p>
                <div className="bg-gray-50 rounded p-3">
                  <code className="text-sm text-gray-800">
                    {`const LazyComponent = React.lazy(() => import('./Component'))
                    
<Suspense fallback={<div>Loading...</div>}>
  <LazyComponent />
</Suspense>`}
                  </code>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'caching' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💾 캐시 관리</h3>
              
              <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">캐시 상태</h4>
                  <button
                    onClick={handleClearCache}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  >
                    만료된 캐시 정리
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {Object.values(cacheStatus).filter(Boolean).length}
                    </div>
                    <div className="text-sm text-green-700">캐시된 항목</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {(Object.values(cacheStatus).filter(Boolean).length / Object.keys(cacheStatus).length * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-blue-700">캐시 적중률</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">30분</div>
                    <div className="text-sm text-purple-700">평균 TTL</div>
                  </div>
                </div>
              </div>

              {/* 캐시된 항목 목록 */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h4 className="font-medium text-gray-900">캐시된 컴포넌트</h4>
                </div>
                <div className="divide-y divide-gray-200">
                  {components.slice(0, 5).map((component) => (
                    <div key={component.id} className="p-4 flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{component.name}</div>
                        <div className="text-sm text-gray-500">{component.id}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={cn(
                          'w-2 h-2 rounded-full',
                          cacheStatus[component.id] ? 'bg-green-400' : 'bg-gray-300'
                        )} />
                        <span className="text-sm text-gray-600">
                          {cacheStatus[component.id] ? '캐시됨' : '캐시 없음'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'components' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🔄 가상화된 컴포넌트 리스트</h3>
              <p className="text-gray-600 mb-4">
                대량의 컴포넌트를 효율적으로 렌더링하기 위해 가상화 기술을 사용합니다.
                화면에 보이는 항목만 렌더링하여 성능을 크게 향상시킵니다.
              </p>
              
              <VirtualizedComponentList 
                components={components}
                onComponentSelect={(component) => {
                  console.log('Selected component:', component)
                }}
              />
              
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">가상화의 이점</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• DOM 노드 수 감소로 메모리 사용량 최적화</li>
                  <li>• 스크롤 성능 향상 (60fps 유지)</li>
                  <li>• 대량 데이터 처리 시 안정적인 성능</li>
                  <li>• 초기 렌더링 시간 단축</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}