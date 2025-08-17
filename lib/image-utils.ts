// 이미지 플레이스홀더 및 처리 유틸리티
import React from 'react'

export interface ImagePlaceholderOptions {
  width: number
  height: number
  category?: string
  seed?: string | number
  blur?: boolean
  grayscale?: boolean
}

export interface ImageSource {
  src: string
  alt: string
  fallback: string
}

/**
 * Unsplash 플레이스홀더 이미지 URL 생성
 */
export function getUnsplashImage({
  width,
  height,
  category = '',
  seed,
  blur = false,
  grayscale = false
}: ImagePlaceholderOptions): string {
  const baseUrl = 'https://images.unsplash.com'
  const params = new URLSearchParams()
  
  if (blur) params.append('blur', '1')
  if (grayscale) params.append('grayscale', '1')
  if (seed) params.append('sig', String(seed))
  
  const queryString = params.toString()
  const categoryPath = category ? `/${category}` : ''
  
  return `${baseUrl}${categoryPath}/${width}x${height}${queryString ? `?${queryString}` : ''}`
}

/**
 * Picsum 플레이스홀더 이미지 URL 생성 (백업)
 */
export function getPicsumImage({
  width,
  height,
  seed,
  blur = false,
  grayscale = false
}: ImagePlaceholderOptions): string {
  const baseUrl = 'https://picsum.photos'
  const params = new URLSearchParams()
  
  if (blur) params.append('blur', '2')
  if (grayscale) params.append('grayscale', '1')
  
  const queryString = params.toString()
  const seedPath = seed ? `/seed/${seed}` : ''
  
  return `${baseUrl}${seedPath}/${width}/${height}${queryString ? `?${queryString}` : ''}`
}

/**
 * 이미지 소스 생성 (메인 + 폴백)
 */
export function createImageSource({
  width,
  height,
  category = '',
  seed,
  alt = 'Placeholder image'
}: ImagePlaceholderOptions & { alt?: string }): ImageSource {
  const mainSrc = getUnsplashImage({ width, height, category, seed })
  const fallbackSrc = getPicsumImage({ width, height, seed })
  
  return {
    src: mainSrc,
    alt,
    fallback: fallbackSrc
  }
}

/**
 * 카테고리별 이미지 소스 생성
 */
export const ImageCategories = {
  // 프로필/사람
  people: (size: number = 400, seed?: string | number) => 
    createImageSource({ 
      width: size, 
      height: size, 
      category: 'people', 
      seed, 
      alt: 'Profile photo' 
    }),
  
  // 제품/오브젝트
  products: (width: number = 300, height: number = 200, seed?: string | number) =>
    createImageSource({ 
      width, 
      height, 
      category: 'technology', 
      seed, 
      alt: 'Product image' 
    }),
  
  // 풍경/배경
  landscape: (width: number = 800, height: number = 400, seed?: string | number) =>
    createImageSource({ 
      width, 
      height, 
      category: 'nature', 
      seed, 
      alt: 'Landscape photo' 
    }),
  
  // 음식
  food: (width: number = 300, height: number = 200, seed?: string | number) =>
    createImageSource({ 
      width, 
      height, 
      category: 'food', 
      seed, 
      alt: 'Food photo' 
    }),
  
  // 비즈니스/오피스
  business: (width: number = 400, height: number = 300, seed?: string | number) =>
    createImageSource({ 
      width, 
      height, 
      category: 'business', 
      seed, 
      alt: 'Business photo' 
    }),
  
  // 기술/IT
  technology: (width: number = 400, height: number = 300, seed?: string | number) =>
    createImageSource({ 
      width, 
      height, 
      category: 'technology', 
      seed, 
      alt: 'Technology photo' 
    })
}

/**
 * 색상 기반 그래디언트 플레이스홀더 생성
 */
export function createGradientPlaceholder(
  width: number, 
  height: number, 
  colors: string[] = ['#3B82F6', '#8B5CF6']
): string {
  const canvas = typeof window !== 'undefined' ? document.createElement('canvas') : null
  if (!canvas) {
    // 서버사이드에서는 단순한 그래디언트 CSS 반환
    return `linear-gradient(135deg, ${colors.join(', ')})`
  }
  
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  
  if (!ctx) return ''
  
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  colors.forEach((color, index) => {
    gradient.addColorStop(index / (colors.length - 1), color)
  })
  
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  
  return canvas.toDataURL()
}

/**
 * 이미지 로딩 상태 관리
 */
export function useImageLoad(src: string, fallback: string) {
  const [isLoading, setIsLoading] = React.useState(true)
  const [hasError, setHasError] = React.useState(false)
  const [currentSrc, setCurrentSrc] = React.useState(src)
  
  React.useEffect(() => {
    if (typeof window === 'undefined') {
      setIsLoading(false)
      return
    }
    
    setIsLoading(true)
    setHasError(false)
    
    const img = new Image()
    
    img.onload = () => {
      setIsLoading(false)
      setHasError(false)
    }
    
    img.onerror = () => {
      setIsLoading(false)
      setHasError(true)
      setCurrentSrc(fallback)
    }
    
    img.src = src
    
    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [src, fallback])
  
  return { src: currentSrc, isLoading, hasError }
}

