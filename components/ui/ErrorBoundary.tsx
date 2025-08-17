'use client'

import React, { Component, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  className?: string
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })
    
    // 부모 컴포넌트에 오류 알림
    this.props.onError?.(error, errorInfo)
    
    // 개발 환경에서 콘솔에 오류 출력
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }
  }

  retry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className={cn(
          'p-6 border border-red-200 rounded-lg bg-red-50',
          this.props.className
        )}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 text-red-500">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                오류가 발생했습니다
              </h3>
              
              <p className="text-red-700 mb-4">
                컴포넌트 렌더링 중 예상치 못한 오류가 발생했습니다.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-4">
                  <summary className="text-sm font-medium text-red-800 cursor-pointer mb-2">
                    오류 세부 정보 (개발 모드)
                  </summary>
                  <div className="bg-red-100 p-3 rounded border text-sm font-mono text-red-900 overflow-auto max-h-32">
                    <div className="font-bold mb-2">{this.state.error.name}: {this.state.error.message}</div>
                    <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
                    {this.state.errorInfo && (
                      <pre className="whitespace-pre-wrap mt-2 pt-2 border-t border-red-200">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}
              
              <div className="flex gap-2">
                <button
                  onClick={this.retry}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  다시 시도
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  페이지 새로고침
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// 함수형 컴포넌트를 위한 HOC
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

// 테마 관련 오류를 위한 특화된 에러 바운더리
interface ThemeErrorBoundaryProps extends Omit<ErrorBoundaryProps, 'fallback'> {
  onThemeError?: (error: Error) => void
}

export function ThemeErrorBoundary({ 
  children, 
  onThemeError, 
  onError,
  ...props 
}: ThemeErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    onError?.(error, errorInfo)
    onThemeError?.(error)
  }

  const fallback = (
    <div className="p-4 border border-amber-200 rounded-lg bg-amber-50">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-5 h-5 text-amber-600">
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="font-semibold text-amber-800">테마 렌더링 오류</h3>
      </div>
      
      <p className="text-amber-700 text-sm mb-3">
        현재 테마 설정으로 인해 컴포넌트 렌더링에 문제가 발생했습니다. 
        이전 테마로 롤백하거나 기본 테마를 사용해보세요.
      </p>
      
      <div className="flex gap-2">
        <button
          onClick={() => {
            // 테마 매니저를 통한 롤백
            if (typeof window !== 'undefined') {
              const { themeManager } = require('@/lib/theme-manager')
              themeManager.rollback()
            }
          }}
          className="px-3 py-1 bg-amber-600 text-white rounded text-sm hover:bg-amber-700 transition-colors"
        >
          이전 테마로 롤백
        </button>
        <button
          onClick={() => {
            // 기본 테마로 리셋
            if (typeof window !== 'undefined') {
              const { themeManager } = require('@/lib/theme-manager')
              themeManager.resetToDefault()
            }
          }}
          className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
        >
          기본 테마 사용
        </button>
      </div>
    </div>
  )

  return (
    <ErrorBoundary 
      {...props}
      fallback={fallback}
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  )
}