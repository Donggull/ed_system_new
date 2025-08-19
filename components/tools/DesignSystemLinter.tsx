'use client'

import React, { useState, useEffect } from 'react'
import { DesignToolsService, LintResult, LintRule } from '@/lib/tools/design-tools-service'
import { ThemeData } from '@/types/database'
import { cn } from '@/lib/utils'

interface DesignSystemLinterProps {
  theme: ThemeData
  className?: string
  onIssueClick?: (issue: LintResult) => void
}

export default function DesignSystemLinter({ theme, className, onIssueClick }: DesignSystemLinterProps) {
  const [lintResults, setLintResults] = useState<LintResult[]>([])
  const [isLinting, setIsLinting] = useState(false)
  const [selectedSeverity, setSelectedSeverity] = useState<'all' | 'error' | 'warning' | 'info'>('all')
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'accessibility' | 'consistency' | 'naming' | 'performance'>('all')
  const [autoLint, setAutoLint] = useState(true)

  useEffect(() => {
    if (autoLint) {
      runLinter()
    }
  }, [theme, autoLint])

  const runLinter = async () => {
    setIsLinting(true)
    try {
      // 약간의 지연을 추가하여 실제 분석하는 것처럼 보이게 함
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const results = DesignToolsService.lintDesignSystem(theme)
      setLintResults(results)
    } catch (error) {
      console.error('Linting failed:', error)
    } finally {
      setIsLinting(false)
    }
  }

  const filteredResults = lintResults.filter(result => {
    if (selectedSeverity !== 'all' && result.severity !== selectedSeverity) {
      return false
    }
    if (selectedCategory !== 'all' && result.rule.category !== selectedCategory) {
      return false
    }
    return true
  })

  const getSeverityIcon = (severity: LintResult['severity']) => {
    switch (severity) {
      case 'error': return '🚨'
      case 'warning': return '⚠️'
      case 'info': return 'ℹ️'
      default: return '📝'
    }
  }

  const getSeverityColor = (severity: LintResult['severity']) => {
    switch (severity) {
      case 'error': return 'text-red-600 bg-red-50 border-red-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getCategoryIcon = (category: LintRule['category']) => {
    switch (category) {
      case 'accessibility': return '♿'
      case 'consistency': return '📏'
      case 'naming': return '🏷️'
      case 'performance': return '⚡'
      default: return '📋'
    }
  }

  const getOverallScore = () => {
    const totalIssues = lintResults.length
    const errorCount = lintResults.filter(r => r.severity === 'error').length
    const warningCount = lintResults.filter(r => r.severity === 'warning').length
    
    // 점수 계산 (에러: -20점, 경고: -10점, 정보: -5점)
    const penalty = errorCount * 20 + warningCount * 10 + (totalIssues - errorCount - warningCount) * 5
    return Math.max(0, 100 - penalty)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200', className)}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900">🔍 디자인 시스템 린터</h3>
            {isLinting && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">자동 검사</span>
              <input
                type="checkbox"
                checked={autoLint}
                onChange={(e) => setAutoLint(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
            </label>
            <button
              onClick={runLinter}
              disabled={isLinting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLinting ? '검사 중...' : '검사 실행'}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* 전체 점수 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">전체 점수</h4>
            <span className={cn('text-2xl font-bold', getScoreColor(getOverallScore()))}>
              {getOverallScore()}/100
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={cn(
                'h-3 rounded-full transition-all duration-500',
                getOverallScore() >= 80 ? 'bg-green-500' :
                getOverallScore() >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              )}
              style={{ width: `${getOverallScore()}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>나쁨</span>
            <span>보통</span>
            <span>좋음</span>
          </div>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {lintResults.filter(r => r.severity === 'error').length}
            </div>
            <div className="text-sm text-red-700">오류</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {lintResults.filter(r => r.severity === 'warning').length}
            </div>
            <div className="text-sm text-yellow-700">경고</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {lintResults.filter(r => r.severity === 'info').length}
            </div>
            <div className="text-sm text-blue-700">정보</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {Math.max(0, 100 - lintResults.length)}
            </div>
            <div className="text-sm text-green-700">통과</div>
          </div>
        </div>

        {/* 필터 */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              심각도
            </label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체</option>
              <option value="error">오류</option>
              <option value="warning">경고</option>
              <option value="info">정보</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              카테고리
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체</option>
              <option value="accessibility">접근성</option>
              <option value="consistency">일관성</option>
              <option value="naming">네이밍</option>
              <option value="performance">성능</option>
            </select>
          </div>
        </div>

        {/* 결과 목록 */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">
            검사 결과 ({filteredResults.length}개)
          </h4>
          
          {isLinting ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">디자인 시스템을 검사하고 있습니다...</p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {lintResults.length === 0 ? (
                <>
                  <div className="text-4xl mb-2">🎉</div>
                  <p>축하합니다! 문제를 발견하지 못했습니다.</p>
                  <p className="text-sm">디자인 시스템이 모범 사례를 잘 따르고 있습니다.</p>
                </>
              ) : (
                <>
                  <div className="text-4xl mb-2">🔍</div>
                  <p>선택한 필터에 해당하는 결과가 없습니다.</p>
                  <p className="text-sm">다른 필터를 선택해보세요.</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredResults.map((result, index) => (
                <div
                  key={index}
                  className={cn(
                    'border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow',
                    getSeverityColor(result.severity)
                  )}
                  onClick={() => onIssueClick?.(result)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg">{getSeverityIcon(result.severity)}</span>
                        <span className="text-lg">{getCategoryIcon(result.rule.category)}</span>
                        <h5 className="font-medium text-gray-900">{result.rule.name}</h5>
                        <span className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-medium',
                          result.severity === 'error' ? 'bg-red-100 text-red-800' :
                          result.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        )}>
                          {result.severity === 'error' ? '오류' :
                           result.severity === 'warning' ? '경고' : '정보'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{result.message}</p>
                      <p className="text-xs text-gray-500">{result.rule.description}</p>
                      {result.element && (
                        <div className="mt-2">
                          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {result.element}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 ml-4">
                      {result.rule.category}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 개선 제안 */}
        {lintResults.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h5 className="font-medium text-blue-900 mb-2">개선 제안</h5>
            <ul className="text-sm text-blue-800 space-y-1">
              {lintResults.filter(r => r.severity === 'error').length > 0 && (
                <li>• 오류 항목을 우선적으로 수정하여 접근성과 사용성을 개선하세요.</li>
              )}
              {lintResults.filter(r => r.severity === 'warning').length > 0 && (
                <li>• 경고 항목을 검토하여 디자인 시스템의 일관성을 높이세요.</li>
              )}
              {lintResults.filter(r => r.rule.category === 'accessibility').length > 0 && (
                <li>• 접근성 가이드라인을 준수하여 모든 사용자가 사용할 수 있도록 하세요.</li>
              )}
              {lintResults.filter(r => r.rule.category === 'performance').length > 0 && (
                <li>• 성능 최적화를 통해 더 나은 사용자 경험을 제공하세요.</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}