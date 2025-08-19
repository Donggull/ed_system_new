'use client'

import React, { useState, useEffect } from 'react'
import { AIRecommendationService, AccessibilityReport, SimilarDesignSystem } from '@/lib/ai-recommendations'
import { ThemeData, ColorPalette } from '@/types/database'
import { cn } from '@/lib/utils'

interface AIRecommendationsProps {
  currentTheme: ThemeData
  onThemeUpdate: (theme: Partial<ThemeData>) => void
  className?: string
}

export default function AIRecommendations({ currentTheme, onThemeUpdate, className }: AIRecommendationsProps) {
  const [activeTab, setActiveTab] = useState<'colors' | 'themes' | 'accessibility' | 'similar'>('colors')
  const [colorRecommendations, setColorRecommendations] = useState<ColorPalette[]>([])
  const [trendingThemes, setTrendingThemes] = useState<ThemeData[]>([])
  const [accessibilityReport, setAccessibilityReport] = useState<AccessibilityReport | null>(null)
  const [similarSystems, setSimilarSystems] = useState<SimilarDesignSystem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadRecommendations()
  }, [currentTheme])

  const loadRecommendations = async () => {
    setIsLoading(true)
    try {
      // 색상 조합 추천
      const primaryColor = currentTheme.colors.primary['500']
      const colorRecs = AIRecommendationService.recommendColorCombinations(primaryColor)
      setColorRecommendations(colorRecs)

      // 트렌드 테마 추천
      const trending = AIRecommendationService.getTrendingThemes()
      setTrendingThemes(trending)

      // 접근성 분석
      const accessibility = AIRecommendationService.analyzeAccessibility(currentTheme)
      setAccessibilityReport(accessibility)

      // 유사 시스템 추천
      const similar = AIRecommendationService.findSimilarDesignSystems(currentTheme)
      setSimilarSystems(similar)
    } catch (error) {
      console.error('Failed to load AI recommendations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const applyColorRecommendation = (palette: ColorPalette, type: 'primary' | 'secondary') => {
    onThemeUpdate({
      colors: {
        ...currentTheme.colors,
        [type]: palette
      }
    })
  }

  const applyTrendingTheme = (theme: ThemeData) => {
    onThemeUpdate(theme)
  }

  const renderColorRecommendations = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">🎨 색상 조합 추천</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {colorRecommendations.map((palette, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-gray-900">
                {index === 0 ? '보색 조합' : index === 1 ? '유사색 조합' : '삼색 조합'}
              </h4>
              <div className="flex space-x-1">
                <button
                  onClick={() => applyColorRecommendation(palette, 'primary')}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Primary로 적용
                </button>
                <button
                  onClick={() => applyColorRecommendation(palette, 'secondary')}
                  className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                >
                  Secondary로 적용
                </button>
              </div>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {Object.entries(palette).slice(1, 6).map(([shade, color]) => (
                <div
                  key={shade}
                  className="aspect-square rounded"
                  style={{ backgroundColor: color }}
                  title={`${shade}: ${color}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderTrendingThemes = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">🔥 트렌드 테마</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {trendingThemes.map((theme, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-medium text-gray-900">{theme.name}</h4>
              <button
                onClick={() => applyTrendingTheme(theme)}
                className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
              >
                적용하기
              </button>
            </div>
            <div className="flex space-x-2 mb-3">
              <div className="flex space-x-1">
                <span className="text-xs text-gray-500">Primary:</span>
                {Object.entries(theme.colors.primary).slice(4, 7).map(([shade, color]) => (
                  <div
                    key={shade}
                    className="w-4 h-4 rounded-full border border-gray-200"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex space-x-1">
                <span className="text-xs text-gray-500">Secondary:</span>
                {Object.entries(theme.colors.secondary).slice(4, 7).map(([shade, color]) => (
                  <div
                    key={shade}
                    className="w-4 h-4 rounded-full border border-gray-200"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-600">
              {theme.typography.fontFamily.sans[0]} 폰트 · {Object.keys(theme.spacing).length}개 간격 설정
            </p>
          </div>
        ))}
      </div>
    </div>
  )

  const renderAccessibilityReport = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">♿ 접근성 분석</h3>
      {accessibilityReport && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">접근성 점수</h4>
            <div className={cn(
              'px-3 py-1 rounded-full text-sm font-medium',
              accessibilityReport.score >= 80 ? 'bg-green-100 text-green-800' :
              accessibilityReport.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            )}>
              {accessibilityReport.score}/100
            </div>
          </div>
          
          {accessibilityReport.issues.length > 0 && (
            <div className="mb-4">
              <h5 className="font-medium text-gray-900 mb-2">발견된 문제</h5>
              <div className="space-y-2">
                {accessibilityReport.issues.map((issue, index) => (
                  <div key={index} className={cn(
                    'p-3 rounded-md text-sm',
                    issue.severity === 'high' ? 'bg-red-50 text-red-800' :
                    issue.severity === 'medium' ? 'bg-yellow-50 text-yellow-800' :
                    'bg-blue-50 text-blue-800'
                  )}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {issue.severity === 'high' ? '🚨' : issue.severity === 'medium' ? '⚠️' : 'ℹ️'} 
                        {issue.message}
                      </span>
                      <span className="text-xs opacity-75">{issue.element}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {accessibilityReport.suggestions.length > 0 && (
            <div>
              <h5 className="font-medium text-gray-900 mb-2">개선 제안</h5>
              <div className="space-y-2">
                {accessibilityReport.suggestions.map((suggestion, index) => (
                  <div key={index} className="p-3 bg-green-50 text-green-800 rounded-md text-sm">
                    <span className="font-medium">💡 {suggestion.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )

  const renderSimilarSystems = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">🔍 유사한 디자인 시스템</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {similarSystems.map((system) => (
          <div key={system.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium text-gray-900">{system.name}</h4>
                <p className="text-sm text-gray-600">{system.description}</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">유사도</div>
                <div className="text-lg font-bold text-blue-600">{Math.round(system.similarity * 100)}%</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mb-3">
              {system.tags.map((tag) => (
                <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                  {tag}
                </span>
              ))}
            </div>
            <button className="w-full py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 text-sm font-medium">
              자세히 보기
            </button>
          </div>
        ))}
      </div>
    </div>
  )

  const tabs = [
    { id: 'colors', label: '색상 추천', icon: '🎨' },
    { id: 'themes', label: '트렌드 테마', icon: '🔥' },
    { id: 'accessibility', label: '접근성', icon: '♿' },
    { id: 'similar', label: '유사 시스템', icon: '🔍' },
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
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">AI 추천 분석 중...</span>
          </div>
        ) : (
          <>
            {activeTab === 'colors' && renderColorRecommendations()}
            {activeTab === 'themes' && renderTrendingThemes()}
            {activeTab === 'accessibility' && renderAccessibilityReport()}
            {activeTab === 'similar' && renderSimilarSystems()}
          </>
        )}
      </div>
    </div>
  )
}