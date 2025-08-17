'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  variant?: 'default' | 'circular' | 'rectangular' | 'text'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

export default function Skeleton({ 
  className,
  variant = 'default',
  width,
  height,
  animation = 'pulse',
  ...props 
}: SkeletonProps) {
  const baseClasses = cn(
    'bg-gray-200 dark:bg-gray-700',
    {
      'animate-pulse': animation === 'pulse',
      'animate-[wave_1.6s_ease-in-out_infinite]': animation === 'wave',
    }
  )

  const variantClasses = {
    default: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    text: 'rounded h-4'
  }

  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  return (
    <div 
      className={cn(
        baseClasses,
        variantClasses[variant],
        className
      )}
      style={style}
      {...props}
    />
  )
}

// 특화된 스켈레톤 컴포넌트들
export function SkeletonText({ 
  lines = 1, 
  className,
  ...props 
}: { 
  lines?: number 
  className?: string 
} & Omit<SkeletonProps, 'variant'>) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton 
          key={index}
          variant="text"
          className={index === lines - 1 ? 'w-3/4' : 'w-full'}
          {...props}
        />
      ))}
    </div>
  )
}

export function SkeletonCard({ className, ...props }: { className?: string } & Omit<SkeletonProps, 'variant'>) {
  return (
    <div className={cn('p-6 space-y-4', className)}>
      <Skeleton variant="rectangular" height={192} {...props} />
      <div className="space-y-2">
        <Skeleton variant="text" className="w-3/4" {...props} />
        <Skeleton variant="text" className="w-1/2" {...props} />
      </div>
    </div>
  )
}

export function SkeletonAvatar({ 
  size = 40,
  className,
  ...props 
}: { 
  size?: number 
  className?: string 
} & Omit<SkeletonProps, 'variant' | 'width' | 'height'>) {
  return (
    <Skeleton 
      variant="circular"
      width={size}
      height={size}
      className={className}
      {...props}
    />
  )
}

export function SkeletonTable({ 
  rows = 5,
  columns = 4,
  className,
  ...props 
}: { 
  rows?: number
  columns?: number
  className?: string 
} & Omit<SkeletonProps, 'variant'>) {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={`header-${index}`} variant="text" className="h-6" {...props} />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={`cell-${rowIndex}-${colIndex}`} variant="text" {...props} />
          ))}
        </div>
      ))}
    </div>
  )
}