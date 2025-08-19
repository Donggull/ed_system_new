'use client'

import React, { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import { PerformanceOptimizationService } from '@/lib/performance/optimization-service'
import { cn } from '@/lib/utils'

interface LazyImageLoaderProps {
  src: string
  alt: string
  className?: string
  width?: number
  height?: number
  placeholder?: string
  onLoad?: () => void
  onError?: () => void
}

export default function LazyImageLoader({
  src,
  alt,
  className,
  width,
  height,
  placeholder,
  onLoad,
  onError
}: LazyImageLoaderProps) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(false)
  const [observer, setObserver] = useState<IntersectionObserver | null>(null)

  useEffect(() => {
    // 레이지 로딩 Observer 초기화
    const lazyObserver = PerformanceOptimizationService.initializeLazyLoading()
    setObserver(lazyObserver)

    return () => {
      lazyObserver.disconnect()
    }
  }, [])

  useEffect(() => {
    const imgElement = imgRef.current
    if (!imgElement || !observer) return

    // 이미지 레이지 로딩 설정
    PerformanceOptimizationService.setupLazyImage(imgElement, src)
    observer.observe(imgElement)

    // 로드 완료 시 옵저버 해제
    const handleLoad = () => {
      setIsLoaded(true)
      onLoad?.()
      observer.unobserve(imgElement)
    }

    const handleError = () => {
      setIsError(true)
      onError?.()
      observer.unobserve(imgElement)
    }

    imgElement.addEventListener('load', handleLoad)
    imgElement.addEventListener('error', handleError)

    return () => {
      imgElement.removeEventListener('load', handleLoad)
      imgElement.removeEventListener('error', handleError)
      observer.unobserve(imgElement)
    }
  }, [src, observer, onLoad, onError])

  const defaultPlaceholder = `data:image/svg+xml;base64,${btoa(`
    <svg width="${width || 400}" height="${height || 300}" viewBox="0 0 ${width || 400} ${height || 300}" xmlns="http://www.w3.org/2000/svg">
      <rect fill="#f0f0f0" width="100%" height="100%"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999" font-family="Arial, sans-serif" font-size="14">
        Loading...
      </text>
    </svg>
  `)}`

  if (isError) {
    return (
      <div 
        className={cn(
          'flex items-center justify-center bg-gray-100 border border-gray-200 rounded',
          className
        )}
        style={{ width, height }}
      >
        <div className="text-center text-gray-500">
          <div className="text-2xl mb-2">⚠️</div>
          <div className="text-sm">이미지를 불러올 수 없습니다</div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <Image
        ref={imgRef}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          !isLoaded && 'opacity-0',
          className
        )}
        width={width || 400}
        height={height || 300}
        src={placeholder || defaultPlaceholder}
        loading="lazy"
      />
      
      {/* 로딩 스피너 오버레이 */}
      {!isLoaded && !isError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  )
}