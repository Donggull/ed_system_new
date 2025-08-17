import { ComponentTemplate } from '@/types/database'

// ===== ADDITIONAL FEEDBACK COMPONENTS =====

export const NOTIFICATION_TEMPLATE = `import React from 'react'
import { cn } from '@/lib/utils'

interface NotificationProps {
  title: string
  message?: string
  variant?: 'info' | 'success' | 'warning' | 'error'
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  duration?: number
  onClose?: () => void
  actions?: Array<{
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary'
  }>
  className?: string
}

const Notification = React.forwardRef<HTMLDivElement, NotificationProps>(
  ({ 
    title, 
    message, 
    variant = 'info', 
    position = 'top-right',
    duration = 0,
    onClose,
    actions,
    className,
    ...props 
  }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true)

    React.useEffect(() => {
      if (duration > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false)
          onClose?.()
        }, duration)
        return () => clearTimeout(timer)
      }
    }, [duration, onClose])

    const positionClasses = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4'
    }

    const variantClasses = {
      info: 'bg-blue-50 border-blue-200 text-blue-800',
      success: 'bg-green-50 border-green-200 text-green-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      error: 'bg-red-50 border-red-200 text-red-800'
    }

    if (!isVisible) return null

    return (
      <div
        ref={ref}
        className={cn(
          'fixed z-50 max-w-sm w-full border rounded-lg shadow-lg p-4',
          'animate-in slide-in-from-top-2 fade-in-0 duration-300',
          positionClasses[position],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-1">
              {title}
            </h4>
            {message && (
              <p className="text-sm opacity-90">
                {message}
              </p>
            )}
            
            {actions && actions.length > 0 && (
              <div className="flex items-center space-x-2 mt-3">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className={cn(
                      'px-3 py-1 text-xs font-medium rounded transition-colors',
                      action.variant === 'primary'
                        ? 'bg-current text-white'
                        : 'bg-white bg-opacity-20 hover:bg-opacity-30'
                    )}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {onClose && (
            <button
              onClick={() => {
                setIsVisible(false)
                onClose()
              }}
              className="ml-3 text-current opacity-60 hover:opacity-100 transition-opacity"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    )
  }
)

Notification.displayName = 'Notification'

export default Notification`

export const BANNER_TEMPLATE = `import React from 'react'
import { cn } from '@/lib/utils'

interface BannerProps {
  children: React.ReactNode
  variant?: 'info' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg'
  dismissible?: boolean
  onDismiss?: () => void
  icon?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

const Banner = React.forwardRef<HTMLDivElement, BannerProps>(
  ({ 
    children, 
    variant = 'info', 
    size = 'md',
    dismissible = false,
    onDismiss,
    icon,
    actions,
    className,
    ...props 
  }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true)

    const handleDismiss = () => {
      setIsVisible(false)
      onDismiss?.()
    }

    const variantClasses = {
      info: 'bg-blue-50 border-blue-200 text-blue-800',
      success: 'bg-green-50 border-green-200 text-green-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      error: 'bg-red-50 border-red-200 text-red-800'
    }

    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-6 py-4 text-lg'
    }

    if (!isVisible) return null

    return (
      <div
        ref={ref}
        className={cn(
          'border-l-4 rounded-r-lg',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {icon && <div className="flex-shrink-0">{icon}</div>}
            <div className="flex-1">{children}</div>
          </div>
          
          <div className="flex items-center space-x-2">
            {actions && <div>{actions}</div>}
            
            {dismissible && (
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }
)

Banner.displayName = 'Banner'

export default Banner`

// ===== ADDITIONAL NAVIGATION COMPONENTS =====

export const PAGINATION_TEMPLATE = `import React from 'react'
import { cn } from '@/lib/utils'

interface PaginationProps {
  current: number
  total: number
  pageSize?: number
  showSizeChanger?: boolean
  showQuickJumper?: boolean
  showTotal?: (total: number, range: [number, number]) => React.ReactNode
  onChange?: (page: number, pageSize?: number) => void
  onShowSizeChange?: (current: number, size: number) => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const Pagination = React.forwardRef<HTMLDivElement, PaginationProps>(
  ({ 
    current, 
    total, 
    pageSize = 10,
    showSizeChanger = false,
    showQuickJumper = false,
    showTotal,
    onChange,
    onShowSizeChange,
    size = 'md',
    className,
    ...props 
  }, ref) => {
    const totalPages = Math.ceil(total / pageSize)
    const [jumpValue, setJumpValue] = React.useState('')

    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg'
    }

    const buttonSizeClasses = {
      sm: 'px-2 py-1 text-sm',
      md: 'px-3 py-2 text-base',
      lg: 'px-4 py-3 text-lg'
    }

    const getVisiblePages = () => {
      const delta = 2
      const range = []
      const rangeWithDots = []

      for (let i = Math.max(2, current - delta); i <= Math.min(totalPages - 1, current + delta); i++) {
        range.push(i)
      }

      if (current - delta > 2) {
        rangeWithDots.push(1, '...')
      } else {
        rangeWithDots.push(1)
      }

      rangeWithDots.push(...range)

      if (current + delta < totalPages - 1) {
        rangeWithDots.push('...', totalPages)
      } else if (totalPages > 1) {
        rangeWithDots.push(totalPages)
      }

      return rangeWithDots
    }

    const handlePageChange = (page: number) => {
      if (page !== current && page >= 1 && page <= totalPages) {
        onChange?.(page, pageSize)
      }
    }

    const handleJump = () => {
      const page = parseInt(jumpValue)
      if (page >= 1 && page <= totalPages) {
        handlePageChange(page)
        setJumpValue('')
      }
    }

    const start = (current - 1) * pageSize + 1
    const end = Math.min(current * pageSize, total)

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-between',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {showTotal && (
          <div className="text-[hsl(var(--color-secondary-600))]">
            {showTotal(total, [start, end])}
          </div>
        )}

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(current - 1)}
            disabled={current <= 1}
            className={cn(
              'border border-[hsl(var(--color-secondary-300))] rounded',
              'hover:border-[hsl(var(--color-primary-500))] hover:text-[hsl(var(--color-primary-500))]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors',
              buttonSizeClasses[size]
            )}
          >
            Previous
          </button>

          {getVisiblePages().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-2">...</span>
              ) : (
                <button
                  onClick={() => handlePageChange(page as number)}
                  className={cn(
                    'border rounded transition-colors',
                    page === current
                      ? 'border-[hsl(var(--color-primary-500))] bg-[hsl(var(--color-primary-500))] text-white'
                      : 'border-[hsl(var(--color-secondary-300))] hover:border-[hsl(var(--color-primary-500))] hover:text-[hsl(var(--color-primary-500))]',
                    buttonSizeClasses[size]
                  )}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}

          <button
            onClick={() => handlePageChange(current + 1)}
            disabled={current >= totalPages}
            className={cn(
              'border border-[hsl(var(--color-secondary-300))] rounded',
              'hover:border-[hsl(var(--color-primary-500))] hover:text-[hsl(var(--color-primary-500))]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors',
              buttonSizeClasses[size]
            )}
          >
            Next
          </button>
        </div>

        {showQuickJumper && (
          <div className="flex items-center space-x-2">
            <span className="text-[hsl(var(--color-secondary-600))]">Go to:</span>
            <input
              type="number"
              value={jumpValue}
              onChange={(e) => setJumpValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleJump()}
              className="w-16 px-2 py-1 border border-[hsl(var(--color-secondary-300))] rounded text-center"
              min={1}
              max={totalPages}
            />
            <button
              onClick={handleJump}
              className="px-3 py-1 bg-[hsl(var(--color-primary-500))] text-white rounded hover:bg-[hsl(var(--color-primary-600))] transition-colors"
            >
              Go
            </button>
          </div>
        )}
      </div>
    )
  }
)

Pagination.displayName = 'Pagination'

export default Pagination`

// ===== INTERACTIVE COMPONENTS =====

export const ACCORDION_TEMPLATE = `import React from 'react'
import { cn } from '@/lib/utils'

interface AccordionItem {
  key: string
  title: React.ReactNode
  content: React.ReactNode
  disabled?: boolean
}

interface AccordionProps {
  items: AccordionItem[]
  defaultActiveKeys?: string[]
  activeKeys?: string[]
  onChange?: (keys: string[]) => void
  multiple?: boolean
  variant?: 'default' | 'bordered' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ 
    items, 
    defaultActiveKeys = [], 
    activeKeys: controlledActiveKeys,
    onChange,
    multiple = false,
    variant = 'default',
    size = 'md',
    className,
    ...props 
  }, ref) => {
    const [internalActiveKeys, setInternalActiveKeys] = React.useState<string[]>(
      controlledActiveKeys || defaultActiveKeys
    )

    const activeKeys = controlledActiveKeys || internalActiveKeys

    const handleToggle = (key: string) => {
      let newActiveKeys: string[]

      if (multiple) {
        newActiveKeys = activeKeys.includes(key)
          ? activeKeys.filter(k => k !== key)
          : [...activeKeys, key]
      } else {
        newActiveKeys = activeKeys.includes(key) ? [] : [key]
      }

      if (!controlledActiveKeys) {
        setInternalActiveKeys(newActiveKeys)
      }
      onChange?.(newActiveKeys)
    }

    const variantClasses = {
      default: 'border border-[hsl(var(--color-secondary-300))] rounded-lg',
      bordered: 'border-2 border-[hsl(var(--color-secondary-300))] rounded-lg',
      ghost: ''
    }

    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg'
    }

    const headerSizeClasses = {
      sm: 'px-3 py-2',
      md: 'px-4 py-3',
      lg: 'px-6 py-4'
    }

    const contentSizeClasses = {
      sm: 'px-3 pb-2',
      md: 'px-4 pb-3',
      lg: 'px-6 pb-4'
    }

    return (
      <div
        ref={ref}
        className={cn(
          'space-y-2',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {items.map((item, index) => {
          const isActive = activeKeys.includes(item.key)
          const isDisabled = item.disabled

          return (
            <div
              key={item.key}
              className={cn(
                variantClasses[variant],
                variant !== 'ghost' && index === 0 && 'rounded-t-lg',
                variant !== 'ghost' && index === items.length - 1 && 'rounded-b-lg',
                variant === 'ghost' && 'border-b border-[hsl(var(--color-secondary-200))] last:border-b-0'
              )}
            >
              <button
                onClick={() => !isDisabled && handleToggle(item.key)}
                disabled={isDisabled}
                className={cn(
                  'w-full flex items-center justify-between text-left',
                  'hover:bg-[hsl(var(--color-secondary-50))] transition-colors',
                  'focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary-500))] focus:ring-inset',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  headerSizeClasses[size],
                  variant !== 'ghost' && index === 0 && 'rounded-t-lg',
                  variant !== 'ghost' && !isActive && index === items.length - 1 && 'rounded-b-lg'
                )}
              >
                <div className="font-medium text-[hsl(var(--color-secondary-900))]">
                  {item.title}
                </div>
                <svg
                  className={cn(
                    'h-5 w-5 text-[hsl(var(--color-secondary-500))] transition-transform duration-200',
                    isActive && 'rotate-180'
                  )}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isActive && (
                <div
                  className={cn(
                    'border-t border-[hsl(var(--color-secondary-200))]',
                    'text-[hsl(var(--color-secondary-700))]',
                    'animate-in slide-in-from-top-1 duration-200',
                    contentSizeClasses[size]
                  )}
                >
                  {item.content}
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }
)

Accordion.displayName = 'Accordion'

export default Accordion`

// ===== MEDIA COMPONENTS =====

export const CAROUSEL_TEMPLATE = `import React from 'react'
import { cn } from '@/lib/utils'

interface CarouselProps {
  children: React.ReactNode[]
  autoplay?: boolean
  autoplayDelay?: number
  showArrows?: boolean
  showDots?: boolean
  infinite?: boolean
  className?: string
}

const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  ({ 
    children, 
    autoplay = false,
    autoplayDelay = 3000,
    showArrows = true,
    showDots = true,
    infinite = true,
    className,
    ...props 
  }, ref) => {
    const [currentIndex, setCurrentIndex] = React.useState(0)
    const [isPlaying, setIsPlaying] = React.useState(autoplay)

    const totalSlides = children.length

    React.useEffect(() => {
      if (!isPlaying || totalSlides <= 1) return

      const interval = setInterval(() => {
        setCurrentIndex(prev => infinite ? (prev + 1) % totalSlides : Math.min(prev + 1, totalSlides - 1))
      }, autoplayDelay)

      return () => clearInterval(interval)
    }, [isPlaying, autoplayDelay, totalSlides, infinite])

    const goToSlide = (index: number) => {
      setCurrentIndex(index)
    }

    const goToPrevious = () => {
      setCurrentIndex(prev => 
        infinite 
          ? (prev - 1 + totalSlides) % totalSlides 
          : Math.max(prev - 1, 0)
      )
    }

    const goToNext = () => {
      setCurrentIndex(prev => 
        infinite 
          ? (prev + 1) % totalSlides 
          : Math.min(prev + 1, totalSlides - 1)
      )
    }

    const canGoPrevious = infinite || currentIndex > 0
    const canGoNext = infinite || currentIndex < totalSlides - 1

    return (
      <div
        ref={ref}
        className={cn('relative group', className)}
        onMouseEnter={() => setIsPlaying(false)}
        onMouseLeave={() => setIsPlaying(autoplay)}
        {...props}
      >
        {/* Slides Container */}
        <div className="relative overflow-hidden rounded-lg">
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: \`translateX(-\${currentIndex * 100}%)\` }}
          >
            {children.map((child, index) => (
              <div key={index} className="w-full flex-shrink-0">
                {child}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        {showArrows && totalSlides > 1 && (
          <>
            <button
              onClick={goToPrevious}
              disabled={!canGoPrevious}
              className={cn(
                'absolute left-2 top-1/2 -translate-y-1/2 z-10',
                'bg-white bg-opacity-80 hover:bg-opacity-100',
                'rounded-full p-2 shadow-md transition-all',
                'opacity-0 group-hover:opacity-100',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={goToNext}
              disabled={!canGoNext}
              className={cn(
                'absolute right-2 top-1/2 -translate-y-1/2 z-10',
                'bg-white bg-opacity-80 hover:bg-opacity-100',
                'rounded-full p-2 shadow-md transition-all',
                'opacity-0 group-hover:opacity-100',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Dot Indicators */}
        {showDots && totalSlides > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {children.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-200',
                  index === currentIndex
                    ? 'bg-white scale-125'
                    : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                )}
              />
            ))}
          </div>
        )}

        {/* Slide Counter */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
          {currentIndex + 1} / {totalSlides}
        </div>
      </div>
    )
  }
)

Carousel.displayName = 'Carousel'

export default Carousel`

// 확장된 컴포넌트 템플릿 배열
export const extendedComponentTemplates: ComponentTemplate[] = [
  // Feedback
  {
    id: 'notification',
    name: 'Notification',
    category: 'optional',
    template_code: NOTIFICATION_TEMPLATE,
    props_schema: {
      variant: {
        type: 'string',
        required: false,
        default: 'info',
        options: ['info', 'success', 'warning', 'error'],
        description: 'Notification type'
      },
      position: {
        type: 'string',
        required: false,
        default: 'top-right',
        options: ['top-right', 'top-left', 'bottom-right', 'bottom-left'],
        description: 'Notification position'
      }
    },
    description: 'Rich notification with actions and positioning',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'banner',
    name: 'Banner',
    category: 'optional',
    template_code: BANNER_TEMPLATE,
    props_schema: {
      variant: {
        type: 'string',
        required: false,
        default: 'info',
        options: ['info', 'success', 'warning', 'error'],
        description: 'Banner variant'
      },
      dismissible: {
        type: 'boolean',
        required: false,
        default: false,
        description: 'Allow banner dismissal'
      }
    },
    description: 'Full-width banner for important announcements',
    is_active: true,
    created_at: new Date().toISOString()
  },

  // Navigation
  {
    id: 'pagination',
    name: 'Pagination',
    category: 'optional',
    template_code: PAGINATION_TEMPLATE,
    props_schema: {
      pageSize: {
        type: 'number',
        required: false,
        default: 10,
        description: 'Number of items per page'
      },
      showSizeChanger: {
        type: 'boolean',
        required: false,
        default: false,
        description: 'Show page size selector'
      },
      showQuickJumper: {
        type: 'boolean',
        required: false,
        default: false,
        description: 'Show quick page jumper'
      }
    },
    description: 'Pagination component for data navigation',
    is_active: true,
    created_at: new Date().toISOString()
  },

  // Interactive
  {
    id: 'accordion',
    name: 'Accordion',
    category: 'optional',
    template_code: ACCORDION_TEMPLATE,
    props_schema: {
      multiple: {
        type: 'boolean',
        required: false,
        default: false,
        description: 'Allow multiple panels to be open'
      },
      variant: {
        type: 'string',
        required: false,
        default: 'default',
        options: ['default', 'bordered', 'ghost'],
        description: 'Accordion visual style'
      }
    },
    description: 'Collapsible content panels',
    is_active: true,
    created_at: new Date().toISOString()
  },

  // Media
  {
    id: 'carousel',
    name: 'Carousel',
    category: 'optional',
    template_code: CAROUSEL_TEMPLATE,
    props_schema: {
      autoplay: {
        type: 'boolean',
        required: false,
        default: false,
        description: 'Auto-advance slides'
      },
      autoplayDelay: {
        type: 'number',
        required: false,
        default: 3000,
        description: 'Autoplay delay in milliseconds'
      },
      infinite: {
        type: 'boolean',
        required: false,
        default: true,
        description: 'Infinite scrolling'
      }
    },
    description: 'Image and content carousel with navigation',
    is_active: true,
    created_at: new Date().toISOString()
  }
]`