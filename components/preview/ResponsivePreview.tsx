'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { ThemeErrorBoundary } from '@/components/ui/ErrorBoundary'
import { themeManager, ThemeState } from '@/lib/theme-manager'

interface Device {
  name: string
  width: number
  height: number
  icon: string
  category: 'mobile' | 'tablet' | 'desktop'
}

const DEVICES: Device[] = [
  // Mobile
  { name: 'iPhone SE', width: 375, height: 667, icon: '📱', category: 'mobile' },
  { name: 'iPhone 12', width: 390, height: 844, icon: '📱', category: 'mobile' },
  { name: 'iPhone 14 Pro', width: 393, height: 852, icon: '📱', category: 'mobile' },
  { name: 'Galaxy S21', width: 384, height: 854, icon: '📱', category: 'mobile' },
  
  // Tablet
  { name: 'iPad', width: 768, height: 1024, icon: '📱', category: 'tablet' },
  { name: 'iPad Pro', width: 1024, height: 1366, icon: '📱', category: 'tablet' },
  { name: 'Galaxy Tab', width: 800, height: 1280, icon: '📱', category: 'tablet' },
  
  // Desktop
  { name: 'Laptop', width: 1366, height: 768, icon: '💻', category: 'desktop' },
  { name: 'Desktop', width: 1920, height: 1080, icon: '🖥️', category: 'desktop' },
  { name: 'Large Display', width: 2560, height: 1440, icon: '🖥️', category: 'desktop' }
]

interface ResponsivePreviewProps {
  children: React.ReactNode
  className?: string
  showMultiDevice?: boolean
  initialDevice?: string
}

export default function ResponsivePreview({
  children,
  className,
  showMultiDevice: initialShowMultiDevice = false,
  initialDevice = 'Desktop'
}: ResponsivePreviewProps) {
  const [selectedDevice, setSelectedDevice] = useState(initialDevice)
  const [selectedDevices, setSelectedDevices] = useState<string[]>(['iPhone 12', 'iPad', 'Desktop'])
  const [showMultiDevice, setShowMultiDevice] = useState(initialShowMultiDevice)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')
  const [themeState, setThemeState] = useState<ThemeState>(themeManager.getState())

  // 테마 상태 구독
  useEffect(() => {
    const unsubscribe = themeManager.subscribe(setThemeState)
    return unsubscribe
  }, [])

  // 현재 디바이스 정보
  const currentDevice = DEVICES.find(d => d.name === selectedDevice) || DEVICES[8]

  // 방향에 따른 크기 조정
  const getDeviceSize = (device: Device) => {
    if (orientation === 'landscape' && device.category !== 'desktop') {
      return { width: device.height, height: device.width }
    }
    return { width: device.width, height: device.height }
  }

  // 디바이스 카테고리별 필터링
  const getDevicesByCategory = (category: Device['category']) => {
    return DEVICES.filter(d => d.category === category)
  }

  // 다중 디바이스 토글
  const toggleDeviceSelection = (deviceName: string) => {
    setSelectedDevices(prev => 
      prev.includes(deviceName)
        ? prev.filter(d => d !== deviceName)
        : [...prev, deviceName].slice(0, 6) // 최대 6개 디바이스
    )
  }

  // 단일 디바이스 미리보기
  const SingleDevicePreview = ({ device }: { device: Device }) => {
    const size = getDeviceSize(device)
    const scale = Math.min(0.8, Math.min(400 / size.width, 300 / size.height))

    return (
      <div className="flex flex-col items-center p-4">
        <div className="mb-2 text-sm font-medium text-gray-700">
          {device.icon} {device.name}
        </div>
        <div 
          className="border-2 border-gray-300 rounded-lg overflow-hidden shadow-lg"
          style={{
            width: `${size.width * scale}px`,
            height: `${size.height * scale}px`
          }}
        >
          <div
            className={cn(
              'w-full h-full overflow-auto',
              isDarkMode ? 'bg-gray-900' : 'bg-white'
            )}
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              width: `${size.width}px`,
              height: `${size.height}px`
            }}
          >
            <div className={cn('p-4', isDarkMode && 'dark')}>
              <ThemeErrorBoundary>
                {children}
              </ThemeErrorBoundary>
            </div>
          </div>
        </div>
        <div className="mt-1 text-xs text-gray-500">
          {size.width}×{size.height}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* 컨트롤 패널 */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex flex-wrap items-center gap-4">
          {/* 디바이스 선택 */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">디바이스:</span>
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={showMultiDevice}
            >
              <optgroup label="📱 모바일">
                {getDevicesByCategory('mobile').map((device) => (
                  <option key={device.name} value={device.name}>
                    {device.name} ({device.width}×{device.height})
                  </option>
                ))}
              </optgroup>
              <optgroup label="📱 태블릿">
                {getDevicesByCategory('tablet').map((device) => (
                  <option key={device.name} value={device.name}>
                    {device.name} ({device.width}×{device.height})
                  </option>
                ))}
              </optgroup>
              <optgroup label="💻 데스크톱">
                {getDevicesByCategory('desktop').map((device) => (
                  <option key={device.name} value={device.name}>
                    {device.name} ({device.width}×{device.height})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* 방향 전환 */}
          {currentDevice.category !== 'desktop' && !showMultiDevice && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">방향:</span>
              <button
                onClick={() => setOrientation(orientation === 'portrait' ? 'landscape' : 'portrait')}
                className={cn(
                  'px-3 py-1 text-sm border rounded-md transition-colors',
                  orientation === 'portrait'
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                )}
              >
                {orientation === 'portrait' ? '📱 세로' : '📱 가로'}
              </button>
            </div>
          )}

          {/* 다중 디바이스 모드 */}
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showMultiDevice}
                onChange={(e) => setShowMultiDevice(e.target.checked)}
                className="rounded"
              />
              <span className="font-medium text-gray-700">다중 디바이스 보기</span>
            </label>
          </div>

          {/* 다크모드 */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={cn(
              'px-3 py-1 text-sm rounded-md transition-colors',
              isDarkMode 
                ? 'bg-gray-800 text-white' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            )}
          >
            {isDarkMode ? '🌙 다크' : '☀️ 라이트'}
          </button>
        </div>

        {/* 다중 디바이스 선택 */}
        {showMultiDevice && (
          <div className="mt-4">
            <div className="text-sm font-medium text-gray-700 mb-2">표시할 디바이스 선택 (최대 6개):</div>
            <div className="flex flex-wrap gap-2">
              {DEVICES.map((device) => (
                <button
                  key={device.name}
                  onClick={() => toggleDeviceSelection(device.name)}
                  className={cn(
                    'px-3 py-1 text-sm border rounded-md transition-colors',
                    selectedDevices.includes(device.name)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                  )}
                >
                  {device.icon} {device.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 상태 표시 */}
      <div className="px-4 py-2 border-b bg-gray-50">
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
      </div>

      {/* 미리보기 영역 */}
      <div className="flex-1 overflow-auto bg-gray-100">
        {showMultiDevice ? (
          /* 다중 디바이스 뷰 */
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedDevices.map((deviceName) => {
                const device = DEVICES.find(d => d.name === deviceName)
                return device ? (
                  <SingleDevicePreview key={device.name} device={device} />
                ) : null
              })}
            </div>
          </div>
        ) : (
          /* 단일 디바이스 뷰 */
          <div className="flex items-center justify-center min-h-full p-8">
            <SingleDevicePreview device={currentDevice} />
          </div>
        )}
      </div>

      {/* 하단 정보 */}
      <div className="px-4 py-2 border-t bg-gray-50">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div>
            {showMultiDevice 
              ? `${selectedDevices.length}개 디바이스 표시 중`
              : `${currentDevice.name} - ${getDeviceSize(currentDevice).width}×${getDeviceSize(currentDevice).height}px`
            }
          </div>
          <div>
            {isDarkMode && '다크모드 • '}
            실시간 테마 미리보기
          </div>
        </div>
      </div>
    </div>
  )
}

// 반응형 브레이크포인트 표시 컴포넌트
export function BreakpointIndicator() {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updateSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  const getBreakpoint = (width: number) => {
    if (width < 640) return { name: 'SM', color: 'bg-red-500', range: '< 640px' }
    if (width < 768) return { name: 'MD', color: 'bg-yellow-500', range: '640px - 768px' }
    if (width < 1024) return { name: 'LG', color: 'bg-green-500', range: '768px - 1024px' }
    if (width < 1280) return { name: 'XL', color: 'bg-blue-500', range: '1024px - 1280px' }
    return { name: '2XL', color: 'bg-purple-500', range: '≥ 1280px' }
  }

  const breakpoint = getBreakpoint(windowSize.width)

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-3 text-sm z-50">
      <div className="flex items-center gap-2">
        <div className={cn('w-3 h-3 rounded-full', breakpoint.color)}></div>
        <div>
          <div className="font-medium">{breakpoint.name}</div>
          <div className="text-gray-500 text-xs">{breakpoint.range}</div>
        </div>
      </div>
      <div className="text-xs text-gray-400 mt-1">
        {windowSize.width}×{windowSize.height}
      </div>
    </div>
  )
}