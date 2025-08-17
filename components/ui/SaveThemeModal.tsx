'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface SaveThemeModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (themeName: string) => void
  defaultName?: string
  isLoading?: boolean
}

export default function SaveThemeModal({ 
  isOpen, 
  onClose, 
  onSave, 
  defaultName = 'My Theme',
  isLoading = false 
}: SaveThemeModalProps) {
  const [themeName, setThemeName] = useState(defaultName)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setThemeName(defaultName)
      // 모달이 열릴 때 입력 필드에 포커스
      setTimeout(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      }, 100)
    }
  }, [isOpen, defaultName])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (themeName.trim() && !isLoading) {
      onSave(themeName.trim())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 백드롭 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* 모달 */}
      <div 
        className={cn(
          "relative bg-white rounded-2xl shadow-2xl border border-gray-200",
          "w-full max-w-md mx-4 p-6",
          "transform transition-all duration-300 ease-out",
          "scale-100 opacity-100"
        )}
        onKeyDown={handleKeyDown}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              테마 저장
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              테마 이름을 입력하고 저장하세요
            </p>
          </div>
          
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="themeName" className="block text-sm font-medium text-gray-700 mb-2">
              테마 이름
            </label>
            <input
              ref={inputRef}
              id="themeName"
              type="text"
              value={themeName}
              onChange={(e) => setThemeName(e.target.value)}
              disabled={isLoading}
              className={cn(
                "w-full px-4 py-3 border border-gray-300 rounded-xl",
                "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                "transition-all duration-200",
                "disabled:bg-gray-50 disabled:cursor-not-allowed",
                "text-gray-900 placeholder-gray-500"
              )}
              placeholder="예: Modern Blue Theme"
              required
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className={cn(
                "flex-1 px-4 py-3 border border-gray-300 rounded-xl",
                "text-gray-700 font-medium",
                "hover:bg-gray-50 transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              취소
            </button>
            
            <button
              type="submit"
              disabled={!themeName.trim() || isLoading}
              className={cn(
                "flex-1 px-4 py-3 rounded-xl font-medium",
                "bg-gradient-to-r from-blue-500 to-blue-600",
                "text-white shadow-lg",
                "hover:from-blue-600 hover:to-blue-700",
                "disabled:from-gray-300 disabled:to-gray-400",
                "disabled:cursor-not-allowed",
                "transition-all duration-200",
                "flex items-center justify-center gap-2"
              )}
            >
              {isLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    />
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  저장 중...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6a1 1 0 10-2 0v5.586l-1.293-1.293z" />
                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                  </svg>
                  저장
                </>
              )}
            </button>
          </div>
        </form>

        {/* 진행 표시 */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-600">테마를 저장하고 있습니다...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}