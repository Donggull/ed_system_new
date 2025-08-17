'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface LoadingProps {
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars'
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'secondary' | 'white' | 'gray'
  text?: string
  className?: string
}

export default function Loading({ 
  variant = 'spinner', 
  size = 'md', 
  color = 'primary',
  text,
  className 
}: LoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  const colorClasses = {
    primary: 'text-[hsl(var(--color-primary-500))]',
    secondary: 'text-[hsl(var(--color-secondary-500))]',
    white: 'text-white',
    gray: 'text-gray-500'
  }

  const renderSpinner = () => (
    <svg 
      className={cn('animate-spin', sizeClasses[size], colorClasses[color])} 
      fill="none" 
      viewBox="0 0 24 24"
    >
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
  )

  const renderDots = () => {
    const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : 'w-3 h-3'
    return (
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              'rounded-full bg-current animate-pulse',
              dotSize,
              colorClasses[color]
            )}
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: '1.4s'
            }}
          />
        ))}
      </div>
    )
  }

  const renderPulse = () => {
    const pulseSize = size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-8 h-8' : 'w-12 h-12'
    return (
      <div className={cn('rounded-full bg-current animate-pulse', pulseSize, colorClasses[color])} />
    )
  }

  const renderBars = () => {
    const barHeight = size === 'sm' ? 'h-3' : size === 'md' ? 'h-6' : 'h-8'
    const barWidth = size === 'sm' ? 'w-0.5' : size === 'md' ? 'w-1' : 'w-1.5'
    
    return (
      <div className="flex items-end space-x-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              'bg-current animate-pulse',
              barWidth,
              barHeight,
              colorClasses[color]
            )}
            style={{
              animationDelay: `${i * 0.15}s`,
              animationDuration: '1.2s'
            }}
          />
        ))}
      </div>
    )
  }

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return renderDots()
      case 'pulse':
        return renderPulse()
      case 'bars':
        return renderBars()
      default:
        return renderSpinner()
    }
  }

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      {renderLoader()}
      {text && (
        <p className={cn('text-sm font-medium', colorClasses[color])}>
          {text}
        </p>
      )}
    </div>
  )
}

// 전체 화면 로딩 컴포넌트
export function LoadingScreen({ 
  text = '로딩 중...',
  variant = 'spinner',
  size = 'lg'
}: Pick<LoadingProps, 'text' | 'variant' | 'size'>) {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <Loading variant={variant} size={size} text={text} />
    </div>
  )
}

// 인라인 로딩 컴포넌트
export function LoadingInline({ 
  text,
  variant = 'dots',
  size = 'sm',
  className
}: LoadingProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Loading variant={variant} size={size} />
      {text && <span className="text-sm text-gray-600">{text}</span>}
    </div>
  )
}