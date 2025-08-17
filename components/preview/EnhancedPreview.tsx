'use client'

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ThemeErrorBoundary } from '@/components/ui/ErrorBoundary'
import { themeManager, ThemeState } from '@/lib/theme-manager'

interface ViewportSize {
  name: string
  width: number
  height: number
  icon: string
}

const VIEWPORT_SIZES: ViewportSize[] = [
  { name: 'Mobile', width: 375, height: 667, icon: '📱' },
  { name: 'Tablet', width: 768, height: 1024, icon: '📱' },
  { name: 'Desktop', width: 1440, height: 900, icon: '🖥️' },
  { name: 'Large', width: 1920, height: 1080, icon: '🖥️' }
]

interface EnhancedPreviewProps {
  children: React.ReactNode
  className?: string
  componentName?: string
  showControls?: boolean
  initialViewport?: string
}

export default function EnhancedPreview({
  children,
  className,
  componentName = 'Component',
  showControls = true,
  initialViewport = 'Desktop'
}: EnhancedPreviewProps) {
  const [selectedViewport, setSelectedViewport] = useState(initialViewport)
  const [zoom, setZoom] = useState(100)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showGrid, setShowGrid] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [themeState, setThemeState] = useState<ThemeState>(themeManager.getState())
  
  const previewRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 테마 상태 구독
  useEffect(() => {
    const unsubscribe = themeManager.subscribe(setThemeState)
    return unsubscribe
  }, [])

  // 현재 뷰포트 정보
  const currentViewport = VIEWPORT_SIZES.find(v => v.name === selectedViewport) || VIEWPORT_SIZES[2]

  // 풀스크린 토글
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      containerRef.current?.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }

  // 풀스크린 이벤트 리스너
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // 줌 조정
  const handleZoomChange = (newZoom: number) => {
    setZoom(Math.max(25, Math.min(200, newZoom)))
  }

  // 스크린샷 기능
  const takeScreenshot = async () => {
    if (!previewRef.current) return

    try {
      const html2canvas = await import('html2canvas')
      const canvas = await html2canvas.default(previewRef.current, {
        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
        scale: 2
      })
      
      const link = document.createElement('a')
      link.download = `${componentName}-preview-${Date.now()}.png`
      link.href = canvas.toDataURL()
      link.click()
    } catch (error) {
      console.error('스크린샷 생성 실패:', error)
    }
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        'flex flex-col h-full bg-white',
        isFullscreen && 'fixed inset-0 z-50',
        className
      )}
    >
      {/* 컨트롤 패널 */}
      {showControls && (
        <div className="flex items-center justify-between p-4 border-b bg-gray-50 flex-wrap gap-4">
          {/* 왼쪽: 뷰포트 선택 */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">뷰포트:</span>
              <select
                value={selectedViewport}
                onChange={(e) => setSelectedViewport(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {VIEWPORT_SIZES.map((viewport) => (
                  <option key={viewport.name} value={viewport.name}>
                    {viewport.icon} {viewport.name} ({viewport.width}×{viewport.height})
                  </option>
                ))}
              </select>
            </div>

            {/* 줌 컨트롤 */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">줌:</span>
              <button
                onClick={() => handleZoomChange(zoom - 25)}
                className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
              >
                -
              </button>
              <span className="text-sm min-w-[3rem] text-center">{zoom}%</span>
              <button
                onClick={() => handleZoomChange(zoom + 25)}
                className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
              >
                +
              </button>
              <button
                onClick={() => setZoom(100)}
                className="px-2 py-1 text-xs bg-blue-500 text-white hover:bg-blue-600 rounded"
              >
                100%
              </button>
            </div>
          </div>

          {/* 오른쪽: 기타 컨트롤 */}
          <div className="flex items-center gap-2">
            {/* 다크모드 토글 */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={cn(
                'px-3 py-1 text-sm rounded-md transition-colors',
                isDarkMode 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              )}
              title="다크모드 토글"
            >
              {isDarkMode ? '🌙' : '☀️'}
            </button>

            {/* 그리드 토글 */}
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={cn(
                'px-3 py-1 text-sm rounded-md transition-colors',
                showGrid 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              )}
              title="그리드 표시"
            >
              📐
            </button>

            {/* 스크린샷 */}
            <button
              onClick={takeScreenshot}
              className="px-3 py-1 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              title="스크린샷"
            >
              📸
            </button>

            {/* 풀스크린 */}
            <button
              onClick={toggleFullscreen}
              className="px-3 py-1 text-sm bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
              title="풀스크린"
            >
              {isFullscreen ? '📄' : '📺'}
            </button>
          </div>
        </div>
      )}

      {/* 상태 표시 */}
      <div className="px-4 py-2 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={cn(
                'w-2 h-2 rounded-full',
                themeState.isValid ? 'bg-green-500' : 'bg-red-500'
              )}></div>
              <span className="text-sm text-gray-600">
                {themeState.isValid ? '테마 적용됨' : '테마 오류'}
              </span>
            </div>
            
            {themeState.isTransitioning && (
              <div className="flex items-center gap-1 text-sm text-blue-600">
                <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span>업데이트 중</span>
              </div>
            )}
          </div>

          <div className="text-xs text-gray-500">
            {currentViewport.width}×{currentViewport.height} @ {zoom}%
            {isDarkMode && ' • 다크모드'}
          </div>
        </div>
      </div>

      {/* 미리보기 영역 */}
      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        <div 
          className="mx-auto"
          style={{
            width: `${currentViewport.width * (zoom / 100)}px`,
            height: `${currentViewport.height * (zoom / 100)}px`,
            maxWidth: '100%'
          }}
        >
          <div
            ref={previewRef}
            className={cn(
              'w-full h-full relative overflow-auto border rounded-lg shadow-lg',
              isDarkMode ? 'bg-gray-900' : 'bg-white',
              showGrid && 'bg-grid-pattern'
            )}
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top left',
              width: `${currentViewport.width}px`,
              height: `${currentViewport.height}px`
            }}
          >
            {/* 그리드 오버레이 */}
            {showGrid && (
              <div 
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, #3b82f6 1px, transparent 1px),
                    linear-gradient(to bottom, #3b82f6 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px'
                }}
              />
            )}

            {/* 다크모드 적용 */}
            <div className={cn(
              'w-full h-full p-4',
              isDarkMode && 'dark'
            )}>
              <ThemeErrorBoundary
                onThemeError={(error) => {
                  console.error('Theme preview error:', error)
                }}
              >
                {children}
              </ThemeErrorBoundary>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 정보 */}
      {showControls && (
        <div className="px-4 py-2 border-t bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div>
              컴포넌트: <span className="font-medium">{componentName}</span>
            </div>
            <div>
              실제 크기: {currentViewport.width}×{currentViewport.height}px
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// 컴팩트 미리보기 컴포넌트
interface CompactPreviewProps {
  children: React.ReactNode
  className?: string
  title?: string
}

export function CompactPreview({ children, className, title }: CompactPreviewProps) {
  const [themeState, setThemeState] = useState<ThemeState>(themeManager.getState())

  useEffect(() => {
    const unsubscribe = themeManager.subscribe(setThemeState)
    return unsubscribe
  }, [])

  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      {title && (
        <div className="px-3 py-2 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-2 h-2 rounded-full',
              themeState.isValid ? 'bg-green-500' : 'bg-red-500'
            )}></div>
            <span className="text-sm font-medium">{title}</span>
            {themeState.isTransitioning && (
              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
        </div>
      )}
      <div className="p-4 bg-white">
        <ThemeErrorBoundary>
          {children}
        </ThemeErrorBoundary>
      </div>
    </div>
  )
}

// 그리드 패턴을 위한 CSS 클래스 추가
const gridStyles = `
  .bg-grid-pattern {
    background-image: 
      linear-gradient(to right, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
    background-size: 20px 20px;
  }
`

// 스타일을 head에 추가
if (typeof window !== 'undefined') {
  const styleElement = document.getElementById('enhanced-preview-styles')
  if (!styleElement) {
    const style = document.createElement('style')
    style.id = 'enhanced-preview-styles'
    style.textContent = gridStyles
    document.head.appendChild(style)
  }
}