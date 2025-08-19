'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { PerformanceOptimizationService } from '@/lib/performance/optimization-service'
import { cn } from '@/lib/utils'

interface VirtualizedListProps<T> {
  items: T[]
  itemHeight: number
  containerHeight: number
  renderItem: (item: T, index: number) => React.ReactNode
  className?: string
  overscan?: number
  onScroll?: (scrollTop: number) => void
}

export default function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className,
  overscan = 5,
  onScroll
}: VirtualizedListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const scrollElementRef = useRef<HTMLDivElement>(null)

  // 스크롤 핸들러를 스로틀링
  const throttledScrollHandler = useMemo(
    () => PerformanceOptimizationService.throttle((e: Event) => {
      const target = e.target as HTMLDivElement
      const newScrollTop = target.scrollTop
      setScrollTop(newScrollTop)
      onScroll?.(newScrollTop)
    }, 16), // 60fps
    [onScroll]
  )

  useEffect(() => {
    const scrollElement = scrollElementRef.current
    if (!scrollElement) return

    scrollElement.addEventListener('scroll', throttledScrollHandler)
    return () => {
      scrollElement.removeEventListener('scroll', throttledScrollHandler)
    }
  }, [throttledScrollHandler])

  // 보이는 아이템 범위 계산
  const visibleRange = useMemo(() => {
    return PerformanceOptimizationService.calculateVisibleItems(
      containerHeight,
      itemHeight,
      scrollTop,
      items.length
    )
  }, [containerHeight, itemHeight, scrollTop, items.length])

  // 렌더링할 아이템들
  const visibleItems = useMemo(() => {
    const start = Math.max(0, visibleRange.startIndex - overscan)
    const end = Math.min(items.length, visibleRange.endIndex + overscan)
    
    return items.slice(start, end).map((item, index) => ({
      item,
      index: start + index,
      key: start + index
    }))
  }, [items, visibleRange.startIndex, visibleRange.endIndex, overscan])

  const totalHeight = items.length * itemHeight
  const offsetY = Math.max(0, visibleRange.startIndex - overscan) * itemHeight

  return (
    <div
      ref={scrollElementRef}
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map(({ item, index, key }) => (
            <div
              key={key}
              style={{
                height: itemHeight,
                overflow: 'hidden'
              }}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// 사용 예시를 위한 컴포넌트
interface VirtualizedComponentListProps {
  components: any[]
  onComponentSelect?: (component: any) => void
}

export function VirtualizedComponentList({ 
  components, 
  onComponentSelect 
}: VirtualizedComponentListProps) {
  const renderComponent = (component: any, index: number) => (
    <div
      key={component.id}
      className="p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
      onClick={() => onComponentSelect?.(component)}
    >
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-gray-900">{component.name}</h4>
          <p className="text-sm text-gray-600">{component.description}</p>
        </div>
        <span className={cn(
          'px-2 py-1 text-xs font-medium rounded-full',
          component.category === 'essential' 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-green-100 text-green-800'
        )}>
          {component.category === 'essential' ? '필수' : '선택'}
        </span>
      </div>
    </div>
  )

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-medium text-gray-900">
          컴포넌트 목록 ({components.length}개)
        </h3>
        <p className="text-sm text-gray-500">
          가상화된 리스트로 성능이 최적화되었습니다.
        </p>
      </div>
      <VirtualizedList
        items={components}
        itemHeight={80}
        containerHeight={400}
        renderItem={renderComponent}
        className="border-0"
      />
    </div>
  )
}