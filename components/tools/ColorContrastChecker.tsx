'use client'

import React, { useState, useEffect } from 'react'
import { DesignToolsService, ContrastResult } from '@/lib/tools/design-tools-service'
import { cn } from '@/lib/utils'

interface ColorContrastCheckerProps {
  className?: string
  onContrastCheck?: (result: ContrastResult) => void
}

export default function ColorContrastChecker({ className, onContrastCheck }: ColorContrastCheckerProps) {
  const [foregroundColor, setForegroundColor] = useState('#000000')
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [contrastResult, setContrastResult] = useState<ContrastResult | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    checkContrast()
  }, [foregroundColor, backgroundColor])

  const checkContrast = async () => {
    setIsChecking(true)
    try {
      const result = DesignToolsService.checkColorContrast(foregroundColor, backgroundColor)
      setContrastResult(result)
      onContrastCheck?.(result)
    } catch (error) {
      console.error('Contrast check failed:', error)
    } finally {
      setIsChecking(false)
    }
  }

  const getGradeColor = (grade: ContrastResult['grade']) => {
    switch (grade) {
      case 'excellent': return 'text-green-600 bg-green-100'
      case 'good': return 'text-blue-600 bg-blue-100'
      case 'poor': return 'text-yellow-600 bg-yellow-100'
      case 'fail': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getGradeText = (grade: ContrastResult['grade']) => {
    switch (grade) {
      case 'excellent': return '우수'
      case 'good': return '양호'
      case 'poor': return '미흡'
      case 'fail': return '불량'
      default: return '알 수 없음'
    }
  }

  const commonColorPairs = [
    { fg: '#000000', bg: '#ffffff', name: '검정 / 흰색' },
    { fg: '#ffffff', bg: '#000000', name: '흰색 / 검정' },
    { fg: '#333333', bg: '#ffffff', name: '진한 회색 / 흰색' },
    { fg: '#666666', bg: '#ffffff', name: '회색 / 흰색' },
    { fg: '#0066cc', bg: '#ffffff', name: '파랑 / 흰색' },
    { fg: '#cc0000', bg: '#ffffff', name: '빨강 / 흰색' },
  ]

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200 p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">🎨 색상 대비 검사기</h3>
        <span className="text-sm text-gray-500">WCAG 2.1 기준</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 색상 선택 */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              전경색 (텍스트)
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={foregroundColor}
                onChange={(e) => setForegroundColor(e.target.value)}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={foregroundColor}
                onChange={(e) => setForegroundColor(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="#000000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              배경색
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="#ffffff"
              />
            </div>
          </div>

          {/* 빠른 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              빠른 선택
            </label>
            <div className="grid grid-cols-1 gap-2">
              {commonColorPairs.map((pair, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setForegroundColor(pair.fg)
                    setBackgroundColor(pair.bg)
                  }}
                  className="flex items-center justify-between px-3 py-2 text-sm border border-gray-200 rounded hover:border-blue-300 hover:bg-blue-50"
                >
                  <span>{pair.name}</span>
                  <div className="flex items-center space-x-1">
                    <div
                      className="w-4 h-4 border border-gray-300 rounded"
                      style={{ backgroundColor: pair.fg }}
                    />
                    <div
                      className="w-4 h-4 border border-gray-300 rounded"
                      style={{ backgroundColor: pair.bg }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 결과 및 미리보기 */}
        <div className="space-y-4">
          {/* 미리보기 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              미리보기
            </label>
            <div
              className="p-6 border border-gray-300 rounded-lg"
              style={{ 
                backgroundColor: backgroundColor,
                color: foregroundColor 
              }}
            >
              <h4 className="text-lg font-semibold mb-2">제목 텍스트</h4>
              <p className="text-base mb-2">
                이것은 본문 텍스트 예시입니다. 이 텍스트가 배경과 충분한 대비를 가지는지 확인할 수 있습니다.
              </p>
              <p className="text-sm">작은 크기 텍스트 예시</p>
            </div>
          </div>

          {/* 대비 결과 */}
          {contrastResult && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                대비 검사 결과
              </label>
              
              <div className="space-y-3">
                {/* 대비비 */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">대비비</span>
                  <span className="text-lg font-bold text-gray-900">
                    {contrastResult.ratio.toFixed(2)}:1
                  </span>
                </div>

                {/* 등급 */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">등급</span>
                  <span className={cn(
                    'px-3 py-1 rounded-full text-sm font-medium',
                    getGradeColor(contrastResult.grade)
                  )}>
                    {getGradeText(contrastResult.grade)}
                  </span>
                </div>

                {/* WCAG 준수 */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">WCAG AA</span>
                    <span className={cn(
                      'text-sm font-medium',
                      contrastResult.wcagAA ? 'text-green-600' : 'text-red-600'
                    )}>
                      {contrastResult.wcagAA ? '통과' : '실패'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">WCAG AAA</span>
                    <span className={cn(
                      'text-sm font-medium',
                      contrastResult.wcagAAA ? 'text-green-600' : 'text-red-600'
                    )}>
                      {contrastResult.wcagAAA ? '통과' : '실패'}
                    </span>
                  </div>
                </div>

                {/* 기준 설명 */}
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-1">WCAG 기준</h5>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• AA: 4.5:1 이상 (일반 텍스트)</li>
                    <li>• AAA: 7:1 이상 (향상된 대비)</li>
                    <li>• 큰 텍스트(18pt+): AA 3:1, AAA 4.5:1</li>
                  </ul>
                </div>

                {/* 개선 제안 */}
                {contrastResult.suggestions && contrastResult.suggestions.length > 0 && (
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <h5 className="font-medium text-yellow-900 mb-2">개선 제안</h5>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      {contrastResult.suggestions.map((suggestion, index) => (
                        <li key={index}>• {suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {isChecking && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-600">검사 중...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}