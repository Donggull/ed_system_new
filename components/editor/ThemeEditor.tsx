'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { themeManager, createDebouncedThemeUpdater, ThemeState } from '@/lib/theme-manager'
import { DEFAULT_THEME } from '@/lib/theme-parser'

interface ThemeEditorProps {
  className?: string
  onThemeChange?: (theme: any) => void
  onError?: (errors: string[]) => void
}

export default function ThemeEditor({ 
  className, 
  onThemeChange, 
  onError 
}: ThemeEditorProps) {
  const [jsonInput, setJsonInput] = useState('')
  const [themeState, setThemeState] = useState<ThemeState>(themeManager.getState())
  const [isTyping, setIsTyping] = useState(false)
  const [showErrors, setShowErrors] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const debouncedUpdateRef = useRef(createDebouncedThemeUpdater(300))

  // 테마 매니저 상태 구독
  useEffect(() => {
    const unsubscribe = themeManager.subscribe((newState) => {
      setThemeState(newState)
      onThemeChange?.(newState.currentTheme)
      
      if (!newState.isValid) {
        onError?.(newState.errors)
        setShowErrors(true)
      } else {
        setShowErrors(false)
      }
    })

    return unsubscribe
  }, [onThemeChange, onError])

  // 초기 JSON 설정
  useEffect(() => {
    if (!jsonInput) {
      setJsonInput(JSON.stringify(DEFAULT_THEME, null, 2))
    }
  }, [jsonInput])

  // JSON 입력 처리
  const handleInputChange = useCallback((value: string) => {
    setJsonInput(value)
    setIsTyping(true)
    
    // 타이핑 상태를 잠시 후 해제
    const typingTimeout = setTimeout(() => {
      setIsTyping(false)
    }, 100)

    // 디바운싱된 테마 업데이트
    debouncedUpdateRef.current(value, {
      animate: true,
      animationDuration: 200,
      rollbackOnError: false
    })

    return () => clearTimeout(typingTimeout)
  }, [])

  // 롤백 기능
  const handleRollback = useCallback(() => {
    const success = themeManager.rollback({ animate: true })
    if (success && themeManager.getState().previousTheme) {
      setJsonInput(JSON.stringify(themeManager.getState().currentTheme, null, 2))
    }
  }, [])

  // 리셋 기능
  const handleReset = useCallback(() => {
    themeManager.resetToDefault({ animate: true })
    setJsonInput(JSON.stringify(DEFAULT_THEME, null, 2))
  }, [])

  // 예쁘게 포맷팅
  const handleFormat = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonInput)
      const formatted = JSON.stringify(parsed, null, 2)
      setJsonInput(formatted)
    } catch (error) {
      // 파싱 에러는 무시하고 현재 상태 유지
    }
  }, [jsonInput])

  // 텍스트 영역 자동 크기 조정
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 600) + 'px'
    }
  }, [])

  useEffect(() => {
    adjustTextareaHeight()
  }, [jsonInput, adjustTextareaHeight])

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">테마 편집기</h3>
          {themeState.isTransitioning && (
            <div className="flex items-center gap-1 text-sm text-blue-600">
              <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              업데이트 중
            </div>
          )}
          {isTyping && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
              입력 중
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleFormat}
            className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
            title="JSON 포맷팅"
          >
            포맷
          </button>
          <button
            onClick={handleRollback}
            disabled={!themeState.previousTheme}
            className="px-3 py-1 text-sm bg-yellow-200 hover:bg-yellow-300 disabled:bg-gray-100 disabled:text-gray-400 rounded-md transition-colors"
            title="이전 상태로 롤백"
          >
            롤백
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-1 text-sm bg-red-200 hover:bg-red-300 rounded-md transition-colors"
            title="기본 테마로 리셋"
          >
            리셋
          </button>
        </div>
      </div>

      {/* 상태 표시 */}
      <div className="px-4 py-2 border-b">
        <div className="flex items-center gap-2">
          <div className={cn(
            'w-3 h-3 rounded-full',
            themeState.isValid ? 'bg-green-500' : 'bg-red-500'
          )}></div>
          <span className="text-sm font-medium">
            {themeState.isValid ? '유효한 테마' : '오류 발생'}
          </span>
          {themeState.isValid && (
            <span className="text-xs text-gray-500">
              테마명: {themeState.currentTheme.name}
            </span>
          )}
        </div>
      </div>

      {/* 오류 표시 */}
      {showErrors && themeState.errors.length > 0 && (
        <div className="mx-4 mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800 mb-1">오류 발생</h4>
              <ul className="text-sm text-red-700 space-y-1">
                {themeState.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* JSON 에디터 */}
      <div className="flex-1 p-4">
        <div className="relative h-full flex">
          {/* 줄 번호 */}
          <div className="flex-shrink-0 w-12 bg-gray-50 border-r border-gray-200 rounded-l-lg overflow-hidden">
            <div className="h-full p-2 overflow-y-auto">
              <div className="text-xs text-gray-400 font-mono leading-5">
                {jsonInput.split('\n').map((_, index) => (
                  <div key={index} className="text-right pr-2 h-5 flex items-center justify-end">
                    {index + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* 텍스트 에디터 */}
          <textarea
            ref={textareaRef}
            value={jsonInput}
            onChange={(e) => handleInputChange(e.target.value)}
            className={cn(
              'flex-1 h-full min-h-[400px] p-4 border-y border-r rounded-r-lg font-mono text-sm resize-none',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'transition-colors duration-200',
              themeState.isValid 
                ? 'border-gray-300 bg-white' 
                : 'border-red-300 bg-red-50'
            )}
            placeholder="JSON 테마 설정을 입력하세요..."
            spellCheck={false}
            style={{ 
              lineHeight: '1.25rem' // 줄 번호와 맞추기 위해
            }}
          />
        </div>
      </div>

      {/* 하단 도움말 */}
      <div className="px-4 py-3 border-t bg-gray-50">
        <div className="text-xs text-gray-600">
          <p>💡 <strong>팁:</strong> JSON을 수정하면 실시간으로 미리보기에 반영됩니다.</p>
          <p className="mt-1">🎨 지원되는 속성: colors, typography, spacing, borderRadius, shadows</p>
        </div>
      </div>
    </div>
  )
}

// 컴팩트 버전의 테마 에디터
export function CompactThemeEditor({ 
  className, 
  onThemeChange, 
  onError 
}: ThemeEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [themeState, setThemeState] = useState<ThemeState>(themeManager.getState())

  useEffect(() => {
    const unsubscribe = themeManager.subscribe(setThemeState)
    return unsubscribe
  }, [])

  if (!isExpanded) {
    return (
      <div className={cn('p-4 border rounded-lg bg-gray-50', className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-3 h-3 rounded-full',
              themeState.isValid ? 'bg-green-500' : 'bg-red-500'
            )}></div>
            <span className="font-medium">현재 테마: {themeState.currentTheme.name}</span>
          </div>
          <button
            onClick={() => setIsExpanded(true)}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            편집
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('border rounded-lg', className)}>
      <div className="flex items-center justify-between p-3 border-b bg-gray-50">
        <span className="font-medium">테마 편집기</span>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      <div className="h-96">
        <ThemeEditor 
          onThemeChange={onThemeChange} 
          onError={onError}
        />
      </div>
    </div>
  )
}