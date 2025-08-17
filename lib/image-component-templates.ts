import { ComponentTemplate } from '@/types/database'

// ===== IMAGE-BASED COMPONENTS =====

export const PROFILE_CARD_TEMPLATE = `import React, { useState } from 'react'
import { cn } from '@/lib/utils'

interface ProfileCardProps {
  name: string
  title: string
  avatar?: string
  coverImage?: string
  bio?: string
  stats?: Array<{ label: string; value: string | number }>
  variant?: 'default' | 'compact' | 'detailed'
  className?: string
}

const ProfileCard = React.forwardRef<HTMLDivElement, ProfileCardProps>(
  ({ name, title, avatar, coverImage, bio, stats = [], variant = 'default', className, ...props }, ref) => {
    const [imageError, setImageError] = useState(false)
    const [coverError, setCoverError] = useState(false)
    
    const defaultAvatar = \`https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face\`
    const defaultCover = \`https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=200&fit=crop\`
    
    const avatarSrc = imageError ? \`https://picsum.photos/seed/\${name}/400/400\` : (avatar || defaultAvatar)
    const coverSrc = coverError ? \`https://picsum.photos/seed/\${name}-cover/800/200\` : (coverImage || defaultCover)

    if (variant === 'compact') {
      return (
        <div
          ref={ref}
          className={cn(
            'bg-white rounded-xl border border-[hsl(var(--color-secondary-200))] p-4 hover:shadow-md transition-shadow',
            className
          )}
          {...props}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={avatarSrc}
                alt={name}
                className="w-12 h-12 rounded-full object-cover"
                onError={() => setImageError(true)}
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{name}</h3>
              <p className="text-sm text-gray-600 truncate">{title}</p>
            </div>
          </div>
        </div>
      )
    }

    if (variant === 'detailed') {
      return (
        <div
          ref={ref}
          className={cn(
            'bg-white rounded-xl border border-[hsl(var(--color-secondary-200))] overflow-hidden hover:shadow-lg transition-shadow',
            className
          )}
          {...props}
        >
          {/* Cover Image */}
          <div className="relative h-32 bg-gradient-to-r from-[hsl(var(--color-primary-500))] to-[hsl(var(--color-primary-600))]">
            <img
              src={coverSrc}
              alt="Cover"
              className="w-full h-full object-cover"
              onError={() => setCoverError(true)}
            />
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
          
          {/* Profile Info */}
          <div className="relative px-6 pb-6">
            {/* Avatar */}
            <div className="flex justify-center -mt-8 mb-4">
              <div className="relative">
                <img
                  src={avatarSrc}
                  alt={name}
                  className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                  onError={() => setImageError(true)}
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
            </div>
            
            {/* Name & Title */}
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">{name}</h3>
              <p className="text-gray-600">{title}</p>
            </div>
            
            {/* Bio */}
            {bio && (
              <p className="text-sm text-gray-600 text-center mb-4 leading-relaxed">{bio}</p>
            )}
            
            {/* Stats */}
            {stats.length > 0 && (
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                    <div className="text-xs text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )
    }

    // Default variant
    return (
      <div
        ref={ref}
        className={cn(
          'bg-white rounded-xl border border-[hsl(var(--color-secondary-200))] p-6 hover:shadow-md transition-shadow',
          className
        )}
        {...props}
      >
        <div className="flex items-start gap-4">
          <div className="relative">
            <img
              src={avatarSrc}
              alt={name}
              className="w-16 h-16 rounded-full object-cover"
              onError={() => setImageError(true)}
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
            <p className="text-gray-600 mb-2">{title}</p>
            {bio && <p className="text-sm text-gray-600">{bio}</p>}
          </div>
        </div>
        
        {stats.length > 0 && (
          <div className="flex justify-around pt-4 mt-4 border-t border-gray-100">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-lg font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
)

ProfileCard.displayName = 'ProfileCard'

export default ProfileCard`

export const PRODUCT_CARD_TEMPLATE = `import React, { useState } from 'react'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  title: string
  price: string | number
  originalPrice?: string | number
  image?: string
  category?: string
  rating?: number
  reviews?: number
  discount?: string
  inStock?: boolean
  variant?: 'default' | 'compact' | 'featured'
  className?: string
}

const ProductCard = React.forwardRef<HTMLDivElement, ProductCardProps>(
  ({ 
    title, 
    price, 
    originalPrice, 
    image, 
    category, 
    rating = 0, 
    reviews = 0, 
    discount, 
    inStock = true, 
    variant = 'default', 
    className, 
    ...props 
  }, ref) => {
    const [imageError, setImageError] = useState(false)
    
    const defaultImage = \`https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop\`
    const imageSrc = imageError ? \`https://picsum.photos/seed/\${title}/400/300\` : (image || defaultImage)
    
    const renderStars = (rating: number) => {
      return Array.from({ length: 5 }).map((_, index) => (
        <svg
          key={index}
          className={cn(
            'w-4 h-4',
            index < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'
          )}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))
    }

    if (variant === 'compact') {
      return (
        <div
          ref={ref}
          className={cn(
            'bg-white rounded-lg border border-[hsl(var(--color-secondary-200))] overflow-hidden hover:shadow-md transition-shadow',
            className
          )}
          {...props}
        >
          <div className="flex">
            <div className="relative w-24 h-24 flex-shrink-0">
              <img
                src={imageSrc}
                alt={title}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
              {discount && (
                <div className="absolute top-1 left-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded">
                  {discount}
                </div>
              )}
            </div>
            <div className="p-3 flex-1">
              <h3 className="font-medium text-gray-900 text-sm line-clamp-2">{title}</h3>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-lg font-bold text-[hsl(var(--color-primary-600))]">{price}</span>
                {originalPrice && (
                  <span className="text-sm text-gray-500 line-through">{originalPrice}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )
    }

    if (variant === 'featured') {
      return (
        <div
          ref={ref}
          className={cn(
            'bg-white rounded-xl border border-[hsl(var(--color-secondary-200))] overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02]',
            className
          )}
          {...props}
        >
          <div className="relative">
            <div className="relative h-64 bg-gray-100">
              <img
                src={imageSrc}
                alt={title}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
              {discount && (
                <div className="absolute top-3 left-3 bg-red-500 text-white text-sm px-2 py-1 rounded-lg font-medium">
                  {discount}
                </div>
              )}
              {!inStock && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium">품절</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-6">
            {category && (
              <span className="text-xs text-[hsl(var(--color-primary-600))] font-medium uppercase tracking-wide">
                {category}
              </span>
            )}
            <h3 className="text-xl font-bold text-gray-900 mt-2 mb-3">{title}</h3>
            
            {rating > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center">
                  {renderStars(rating)}
                </div>
                <span className="text-sm text-gray-600">({reviews})</span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-[hsl(var(--color-primary-600))]">{price}</span>
                {originalPrice && (
                  <span className="text-lg text-gray-500 line-through">{originalPrice}</span>
                )}
              </div>
              <button className="bg-[hsl(var(--color-primary-500))] text-white px-4 py-2 rounded-lg hover:bg-[hsl(var(--color-primary-600))] transition-colors">
                구매하기
              </button>
            </div>
          </div>
        </div>
      )
    }

    // Default variant
    return (
      <div
        ref={ref}
        className={cn(
          'bg-white rounded-lg border border-[hsl(var(--color-secondary-200))] overflow-hidden hover:shadow-md transition-shadow',
          className
        )}
        {...props}
      >
        <div className="relative">
          <div className="relative h-48 bg-gray-100">
            <img
              src={imageSrc}
              alt={title}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
            {discount && (
              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                {discount}
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4">
          {category && (
            <span className="text-xs text-[hsl(var(--color-primary-600))] font-medium">
              {category}
            </span>
          )}
          <h3 className="font-semibold text-gray-900 mt-1 mb-2">{title}</h3>
          
          {rating > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex items-center">
                {renderStars(rating)}
              </div>
              <span className="text-sm text-gray-600">({reviews})</span>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-[hsl(var(--color-primary-600))]">{price}</span>
              {originalPrice && (
                <span className="text-sm text-gray-500 line-through">{originalPrice}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }
)

ProductCard.displayName = 'ProductCard'

export default ProductCard`

export const BLOG_CARD_TEMPLATE = `import React, { useState } from 'react'
import { cn } from '@/lib/utils'

interface BlogCardProps {
  title: string
  excerpt: string
  image?: string
  author: {
    name: string
    avatar?: string
  }
  publishDate: string
  readTime?: string
  category?: string
  tags?: string[]
  variant?: 'default' | 'horizontal' | 'minimal'
  className?: string
}

const BlogCard = React.forwardRef<HTMLDivElement, BlogCardProps>(
  ({ 
    title, 
    excerpt, 
    image, 
    author, 
    publishDate, 
    readTime, 
    category, 
    tags = [], 
    variant = 'default', 
    className, 
    ...props 
  }, ref) => {
    const [imageError, setImageError] = useState(false)
    const [avatarError, setAvatarError] = useState(false)
    
    const defaultImage = \`https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&h=400&fit=crop\`
    const defaultAvatar = \`https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face\`
    
    const imageSrc = imageError ? \`https://picsum.photos/seed/\${title}/600/400\` : (image || defaultImage)
    const avatarSrc = avatarError ? \`https://picsum.photos/seed/\${author.name}/100/100\` : (author.avatar || defaultAvatar)

    if (variant === 'horizontal') {
      return (
        <article
          ref={ref}
          className={cn(
            'bg-white rounded-lg border border-[hsl(var(--color-secondary-200))] overflow-hidden hover:shadow-md transition-shadow',
            className
          )}
          {...props}
        >
          <div className="flex">
            <div className="relative w-48 h-32 flex-shrink-0">
              <img
                src={imageSrc}
                alt={title}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
              {category && (
                <div className="absolute top-2 left-2 bg-[hsl(var(--color-primary-500))] text-white text-xs px-2 py-1 rounded">
                  {category}
                </div>
              )}
            </div>
            <div className="p-4 flex-1">
              <h3 className="font-bold text-gray-900 text-lg line-clamp-2 mb-2">{title}</h3>
              <p className="text-gray-600 text-sm line-clamp-2 mb-3">{excerpt}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <img
                    src={avatarSrc}
                    alt={author.name}
                    className="w-6 h-6 rounded-full object-cover"
                    onError={() => setAvatarError(true)}
                  />
                  <span>{author.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{publishDate}</span>
                  {readTime && <span>• {readTime}</span>}
                </div>
              </div>
            </div>
          </div>
        </article>
      )
    }

    if (variant === 'minimal') {
      return (
        <article
          ref={ref}
          className={cn(
            'bg-white rounded-lg border border-[hsl(var(--color-secondary-200))] p-6 hover:shadow-md transition-shadow',
            className
          )}
          {...props}
        >
          {category && (
            <span className="text-xs text-[hsl(var(--color-primary-600))] font-medium uppercase tracking-wide">
              {category}
            </span>
          )}
          <h3 className="font-bold text-gray-900 text-xl mt-2 mb-3">{title}</h3>
          <p className="text-gray-600 mb-4 leading-relaxed">{excerpt}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={avatarSrc}
                alt={author.name}
                className="w-8 h-8 rounded-full object-cover"
                onError={() => setAvatarError(true)}
              />
              <div>
                <div className="text-sm font-medium text-gray-900">{author.name}</div>
                <div className="text-xs text-gray-500">{publishDate}</div>
              </div>
            </div>
            {readTime && (
              <span className="text-sm text-gray-500">{readTime}</span>
            )}
          </div>
        </article>
      )
    }

    // Default variant
    return (
      <article
        ref={ref}
        className={cn(
          'bg-white rounded-lg border border-[hsl(var(--color-secondary-200))] overflow-hidden hover:shadow-md transition-shadow',
          className
        )}
        {...props}
      >
        <div className="relative">
          <div className="relative h-48 bg-gray-100">
            <img
              src={imageSrc}
              alt={title}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
            {category && (
              <div className="absolute top-3 left-3 bg-[hsl(var(--color-primary-500))] text-white text-sm px-3 py-1 rounded-full">
                {category}
              </div>
            )}
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
          <p className="text-gray-600 mb-4 leading-relaxed">{excerpt}</p>
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="text-xs bg-[hsl(var(--color-secondary-100))] text-[hsl(var(--color-secondary-700))] px-2 py-1 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={avatarSrc}
                alt={author.name}
                className="w-10 h-10 rounded-full object-cover"
                onError={() => setAvatarError(true)}
              />
              <div>
                <div className="text-sm font-medium text-gray-900">{author.name}</div>
                <div className="text-xs text-gray-500">{publishDate}</div>
              </div>
            </div>
            {readTime && (
              <span className="text-sm text-gray-500">{readTime}</span>
            )}
          </div>
        </div>
      </article>
    )
  }
)

BlogCard.displayName = 'BlogCard'

export default BlogCard`

export const GALLERY_TEMPLATE = `import React, { useState } from 'react'
import { cn } from '@/lib/utils'

interface GalleryImage {
  src: string
  alt: string
  title?: string
  description?: string
}

interface GalleryProps {
  images: GalleryImage[]
  variant?: 'grid' | 'masonry' | 'carousel'
  columns?: number
  gap?: 'sm' | 'md' | 'lg'
  showModal?: boolean
  className?: string
}

const Gallery = React.forwardRef<HTMLDivElement, GalleryProps>(
  ({ images, variant = 'grid', columns = 3, gap = 'md', showModal = true, className, ...props }, ref) => {
    const [selectedImage, setSelectedImage] = useState<number | null>(null)
    const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())
    
    const handleImageError = (index: number) => {
      setImageErrors(prev => new Set([...prev, index]))
    }
    
    const getImageSrc = (image: GalleryImage, index: number) => {
      if (imageErrors.has(index)) {
        return \`https://picsum.photos/seed/gallery-\${index}/600/400\`
      }
      return image.src || \`https://images.unsplash.com/photo-150724352\${index}0-abcdef?w=600&h=400&fit=crop\`
    }

    const gapClasses = {
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6'
    }

    if (variant === 'masonry') {
      return (
        <div
          ref={ref}
          className={cn('columns-1 md:columns-2 lg:columns-3 xl:columns-4', gapClasses[gap], className)}
          {...props}
        >
          {images.map((image, index) => (
            <div
              key={index}
              className="break-inside-avoid mb-4 group cursor-pointer"
              onClick={() => showModal && setSelectedImage(index)}
            >
              <div className="relative overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={getImageSrc(image, index)}
                  alt={image.alt}
                  className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={() => handleImageError(index)}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                {image.title && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <h3 className="text-white font-medium">{image.title}</h3>
                    {image.description && (
                      <p className="text-white/80 text-sm">{image.description}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (variant === 'carousel') {
      return (
        <div ref={ref} className={cn('relative', className)} {...props}>
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory">
            {images.map((image, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-80 snap-start cursor-pointer"
                onClick={() => showModal && setSelectedImage(index)}
              >
                <div className="relative overflow-hidden rounded-lg bg-gray-100 h-60">
                  <img
                    src={getImageSrc(image, index)}
                    alt={image.alt}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={() => handleImageError(index)}
                  />
                  {image.title && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <h3 className="text-white font-medium">{image.title}</h3>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    // Grid variant (default)
    return (
      <div ref={ref} className={cn(className)} {...props}>
        <div
          className={cn(
            'grid',
            \`grid-cols-1 md:grid-cols-\${Math.min(columns, 4)} gap-\${gap === 'sm' ? '2' : gap === 'md' ? '4' : '6'}\`
          )}
        >
          {images.map((image, index) => (
            <div
              key={index}
              className="group cursor-pointer"
              onClick={() => showModal && setSelectedImage(index)}
            >
              <div className="relative overflow-hidden rounded-lg bg-gray-100 aspect-square">
                <img
                  src={getImageSrc(image, index)}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={() => handleImageError(index)}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                {image.title && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <h3 className="text-white font-medium text-sm">{image.title}</h3>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && selectedImage !== null && (
          <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl max-h-full">
              <img
                src={getImageSrc(images[selectedImage], selectedImage)}
                alt={images[selectedImage].alt}
                className="max-w-full max-h-full object-contain"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              {images[selectedImage].title && (
                <div className="absolute bottom-4 left-4 right-4 bg-black/60 text-white p-4 rounded">
                  <h3 className="font-medium">{images[selectedImage].title}</h3>
                  {images[selectedImage].description && (
                    <p className="text-sm opacity-80">{images[selectedImage].description}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }
)

Gallery.displayName = 'Gallery'

export default Gallery`

// 컴포넌트 템플릿 배열
export const imageComponentTemplates: ComponentTemplate[] = [
  {
    id: 'profile-card',
    name: 'Profile Card',
    category: 'optional',
    template_code: PROFILE_CARD_TEMPLATE,
    props_schema: {
      variant: {
        type: 'string',
        required: false,
        default: 'default',
        options: ['default', 'compact', 'detailed'],
        description: 'Profile card layout variant'
      },
      name: {
        type: 'string',
        required: true,
        description: 'Person name'
      },
      title: {
        type: 'string',
        required: true,
        description: 'Job title or role'
      }
    },
    description: 'Profile card component with avatar, cover image, and user information',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'product-card',
    name: 'Product Card',
    category: 'optional',
    template_code: PRODUCT_CARD_TEMPLATE,
    props_schema: {
      variant: {
        type: 'string',
        required: false,
        default: 'default',
        options: ['default', 'compact', 'featured'],
        description: 'Product card layout variant'
      },
      title: {
        type: 'string',
        required: true,
        description: 'Product title'
      },
      price: {
        type: 'string',
        required: true,
        description: 'Product price'
      }
    },
    description: 'E-commerce product card with image, pricing, and rating',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'blog-card',
    name: 'Blog Card',
    category: 'optional',
    template_code: BLOG_CARD_TEMPLATE,
    props_schema: {
      variant: {
        type: 'string',
        required: false,
        default: 'default',
        options: ['default', 'horizontal', 'minimal'],
        description: 'Blog card layout variant'
      },
      title: {
        type: 'string',
        required: true,
        description: 'Article title'
      },
      excerpt: {
        type: 'string',
        required: true,
        description: 'Article excerpt'
      }
    },
    description: 'Blog post card with featured image, author info, and metadata',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'gallery',
    name: 'Gallery',
    category: 'optional',
    template_code: GALLERY_TEMPLATE,
    props_schema: {
      variant: {
        type: 'string',
        required: false,
        default: 'grid',
        options: ['grid', 'masonry', 'carousel'],
        description: 'Gallery layout variant'
      },
      columns: {
        type: 'number',
        required: false,
        default: 3,
        description: 'Number of columns for grid layout'
      }
    },
    description: 'Image gallery with grid, masonry, and carousel layouts',
    is_active: true,
    created_at: new Date().toISOString()
  }
]