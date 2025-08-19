'use client'

import React, { useState, useEffect } from 'react'
import { ThemeData } from '@/types/database'
import { DesignToolsService, DesignToken, ContrastResult, LintResult } from '@/lib/tools/design-tools-service'
import { cn } from '@/lib/utils'
import ColorContrastChecker from './ColorContrastChecker'
import DesignTokenConverter from './DesignTokenConverter'
import FigmaIntegration from './FigmaIntegration'
import DesignSystemLinter from './DesignSystemLinter'

interface ToolsHubProps {
  theme: ThemeData
  className?: string
  onToolAction?: (tool: string, action: string, data?: any) => void
}

export default function ToolsHub({ theme, className, onToolAction }: ToolsHubProps) {
  const [activeTab, setActiveTab] = useState<'contrast' | 'tokens' | 'figma' | 'linter'>('contrast')
  const [designTokens, setDesignTokens] = useState<DesignToken[]>([])
  const [contrastResults, setContrastResults] = useState<ContrastResult[]>([])
  const [lintResults, setLintResults] = useState<LintResult[]>([])

  useEffect(() => {
    // 디자인 토큰 생성
    const tokens = DesignToolsService.convertThemeToTokens(theme)
    setDesignTokens(tokens)
  }, [theme])

  const handleContrastCheck = (result: ContrastResult) => {
    setContrastResults(prev => [result, ...prev.slice(0, 4)]) // 최근 5개만 유지
    onToolAction?.('contrast-checker', 'check', result)
  }

  const handleTokenExport = (format: string, content: string) => {
    onToolAction?.('token-converter', 'export', { format, content })
  }

  const handleFigmaSync = (success: boolean) => {
    onToolAction?.('figma-integration', 'sync', { success })
  }

  const handleLintIssueClick = (issue: LintResult) => {
    onToolAction?.('design-linter', 'issue-click', issue)
  }

  const tabs = [
    { 
      id: 'contrast', 
      label: '대비 검사', 
      icon: '🎨',
      description: '색상 접근성 검증'
    },
    { 
      id: 'tokens', 
      label: '토큰 변환', 
      icon: '🔄',
      description: '다양한 형식으로 내보내기'
    },
    { 
      id: 'figma', 
      label: 'Figma 연동', 
      icon: '🎯',
      description: '디자인 도구 동기화'
    },
    { 
      id: 'linter', 
      label: '품질 검사', 
      icon: '🔍',
      description: '디자인 시스템 린팅'
    },
  ] as const

  const getTabStats = (tabId: typeof tabs[number]['id']) => {
    switch (tabId) {
      case 'contrast':
        return contrastResults.length > 0 ? `${contrastResults.length}개 검사` : null
      case 'tokens':
        return `${designTokens.length}개 토큰`
      case 'figma':
        return designTokens.filter(t => t.type === 'color').length > 0 ? '연동 가능' : null
      case 'linter':
        return lintResults.length > 0 ? `${lintResults.length}개 이슈` : null
      default:
        return null
    }
  }

  return (
    <div className={cn('bg-gray-50 rounded-lg', className)}>
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 rounded-t-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">🛠️ 디자인 도구</h2>
            <p className="text-sm text-gray-600 mt-1">
              디자인 시스템 개발을 위한 전문 도구들
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>총 {designTokens.length}개 토큰</span>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <span>{theme.name}</span>
          </div>
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="border-b border-gray-200 bg-white">
        <div className="grid grid-cols-4 gap-1 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'p-3 text-center rounded-md transition-colors',
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              )}
            >
              <div className="text-xl mb-1">{tab.icon}</div>
              <div className="text-sm font-medium">{tab.label}</div>
              <div className="text-xs text-gray-500">{tab.description}</div>
              {getTabStats(tab.id) && (
                <div className="text-xs font-medium text-blue-600 mt-1">
                  {getTabStats(tab.id)}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 컨텐츠 영역 */}
      <div className="p-6">
        {activeTab === 'contrast' && (
          <ColorContrastChecker
            onContrastCheck={handleContrastCheck}
          />
        )}

        {activeTab === 'tokens' && (
          <DesignTokenConverter
            theme={theme}
            onExport={handleTokenExport}
          />
        )}

        {activeTab === 'figma' && (
          <FigmaIntegration
            tokens={designTokens}
            onSync={handleFigmaSync}
          />
        )}

        {activeTab === 'linter' && (
          <DesignSystemLinter
            theme={theme}
            onIssueClick={handleLintIssueClick}
          />
        )}
      </div>

      {/* 하단 요약 */}
      <div className="bg-white border-t border-gray-200 rounded-b-lg p-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4 text-gray-600">
            <span>활성 도구: {tabs.find(t => t.id === activeTab)?.label}</span>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
            <span>마지막 업데이트: {new Date().toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-600 font-medium">도구 활성화됨</span>
          </div>
        </div>
      </div>
    </div>
  )
}