import { ComponentTemplate } from '@/types/database'

// ===== DATA DISPLAY COMPONENTS =====

export const TABLE_TEMPLATE = `import React from 'react'
import { cn } from '@/lib/utils'

interface TableProps {
  data: Array<Record<string, any>>
  columns: Array<{
    key: string
    title: string
    width?: string
    render?: (value: any, record: Record<string, any>) => React.ReactNode
  }>
  variant?: 'default' | 'striped' | 'bordered'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ data, columns, variant = 'default', size = 'md', className, ...props }, ref) => {
    const variantClasses = {
      default: 'border-collapse',
      striped: 'border-collapse [&_tbody_tr:nth-child(odd)]:bg-[hsl(var(--color-secondary-50))]',
      bordered: 'border-collapse border border-[hsl(var(--color-secondary-300))]'
    }

    const sizeClasses = {
      sm: '[&_td]:px-2 [&_td]:py-1 [&_th]:px-2 [&_th]:py-1 text-sm',
      md: '[&_td]:px-4 [&_td]:py-2 [&_th]:px-4 [&_th]:py-3 text-base',
      lg: '[&_td]:px-6 [&_td]:py-3 [&_th]:px-6 [&_th]:py-4 text-lg'
    }

    return (
      <div className="overflow-x-auto">
        <table
          ref={ref}
          className={cn(
            'w-full',
            variantClasses[variant],
            sizeClasses[size],
            className
          )}
          {...props}
        >
          <thead className="bg-[hsl(var(--color-secondary-100))]">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'text-left font-semibold text-[hsl(var(--color-secondary-900))]',
                    'border-b border-[hsl(var(--color-secondary-300))]',
                    column.width && \`w-[\${column.width}]\`
                  )}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((record, index) => (
              <tr key={index} className="hover:bg-[hsl(var(--color-secondary-50))] transition-colors">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="border-b border-[hsl(var(--color-secondary-200))] text-[hsl(var(--color-secondary-700))]"
                  >
                    {column.render ? column.render(record[column.key], record) : record[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
)

Table.displayName = 'Table'

export default Table`

export const BADGE_TEMPLATE = `import React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg'
  rounded?: boolean
  className?: string
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ children, variant = 'default', size = 'md', rounded = false, className, ...props }, ref) => {
    const variantClasses = {
      default: 'bg-[hsl(var(--color-secondary-100))] text-[hsl(var(--color-secondary-800))]',
      primary: 'bg-[hsl(var(--color-primary-100))] text-[hsl(var(--color-primary-800))]',
      secondary: 'bg-[hsl(var(--color-secondary-100))] text-[hsl(var(--color-secondary-800))]',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800'
    }

    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base'
    }

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center font-medium',
          variantClasses[variant],
          sizeClasses[size],
          rounded ? 'rounded-full' : 'rounded-md',
          className
        )}
        {...props}
      >
        {children}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

export default Badge`

export const AVATAR_TEMPLATE = `import React from 'react'
import { cn } from '@/lib/utils'

interface AvatarProps {
  src?: string
  alt?: string
  fallback?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'circle' | 'square'
  className?: string
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt, fallback, size = 'md', variant = 'circle', className, ...props }, ref) => {
    const [imageLoaded, setImageLoaded] = React.useState(false)
    const [imageError, setImageError] = React.useState(false)

    const sizeClasses = {
      xs: 'h-6 w-6 text-xs',
      sm: 'h-8 w-8 text-sm',
      md: 'h-10 w-10 text-base',
      lg: 'h-12 w-12 text-lg',
      xl: 'h-16 w-16 text-xl'
    }

    const variantClasses = {
      circle: 'rounded-full',
      square: 'rounded-lg'
    }

    const showFallback = !src || imageError || !imageLoaded

    return (
      <div
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center overflow-hidden',
          'bg-[hsl(var(--color-secondary-100))] text-[hsl(var(--color-secondary-600))]',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {src && !imageError && (
          <img
            src={src}
            alt={alt || 'Avatar'}
            className={cn(
              'h-full w-full object-cover transition-opacity',
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}
        
        {showFallback && (
          <span className="font-medium">
            {fallback || (alt ? alt.charAt(0).toUpperCase() : '?')}
          </span>
        )}
      </div>
    )
  }
)

Avatar.displayName = 'Avatar'

export default Avatar`

// ===== FEEDBACK COMPONENTS =====

export const TOAST_TEMPLATE = `import React from 'react'
import { cn } from '@/lib/utils'

interface ToastProps {
  title?: string
  description?: string
  variant?: 'default' | 'success' | 'warning' | 'error'
  duration?: number
  onClose?: () => void
  className?: string
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ title, description, variant = 'default', duration = 5000, onClose, className, ...props }, ref) => {
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

    const variantClasses = {
      default: 'bg-white border-[hsl(var(--color-secondary-300))]',
      success: 'bg-green-50 border-green-200',
      warning: 'bg-yellow-50 border-yellow-200',
      error: 'bg-red-50 border-red-200'
    }

    const iconClasses = {
      default: 'text-[hsl(var(--color-secondary-500))]',
      success: 'text-green-500',
      warning: 'text-yellow-500',
      error: 'text-red-500'
    }

    const getIcon = () => {
      switch (variant) {
        case 'success':
          return (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )
        case 'warning':
          return (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          )
        case 'error':
          return (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )
        default:
          return (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
      }
    }

    if (!isVisible) return null

    return (
      <div
        ref={ref}
        className={cn(
          'fixed top-4 right-4 z-50 max-w-sm w-full',
          'border rounded-lg shadow-lg p-4',
          'animate-in slide-in-from-top-2 fade-in-0 duration-300',
          variantClasses[variant],
          className
        )}
        {...props}
      >
        <div className="flex items-start space-x-3">
          <div className={cn('flex-shrink-0', iconClasses[variant])}>
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            {title && (
              <h4 className="font-semibold text-sm text-gray-900 mb-1">
                {title}
              </h4>
            )}
            {description && (
              <p className="text-sm text-gray-600">
                {description}
              </p>
            )}
          </div>
          
          {onClose && (
            <button
              onClick={() => {
                setIsVisible(false)
                onClose()
              }}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
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

Toast.displayName = 'Toast'

export default Toast`

// ===== LAYOUT COMPONENTS =====

export const GRID_TEMPLATE = `import React from 'react'
import { cn } from '@/lib/utils'

interface GridProps {
  children: React.ReactNode
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  responsive?: {
    sm?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
    md?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
    lg?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
    xl?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
  }
  className?: string
}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ children, cols = 1, gap = 'md', responsive, className, ...props }, ref) => {
    const colsClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6',
      7: 'grid-cols-7',
      8: 'grid-cols-8',
      9: 'grid-cols-9',
      10: 'grid-cols-10',
      11: 'grid-cols-11',
      12: 'grid-cols-12'
    }

    const gapClasses = {
      none: 'gap-0',
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8'
    }

    const responsiveClasses = responsive ? [
      responsive.sm && \`sm:\${colsClasses[responsive.sm]}\`,
      responsive.md && \`md:\${colsClasses[responsive.md]}\`,
      responsive.lg && \`lg:\${colsClasses[responsive.lg]}\`,
      responsive.xl && \`xl:\${colsClasses[responsive.xl]}\`
    ].filter(Boolean).join(' ') : ''

    return (
      <div
        ref={ref}
        className={cn(
          'grid',
          colsClasses[cols],
          gapClasses[gap],
          responsiveClasses,
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Grid.displayName = 'Grid'

export default Grid`

export const DIVIDER_TEMPLATE = `import React from 'react'
import { cn } from '@/lib/utils'

interface DividerProps {
  orientation?: 'horizontal' | 'vertical'
  variant?: 'solid' | 'dashed' | 'dotted'
  thickness?: 'thin' | 'medium' | 'thick'
  color?: 'light' | 'medium' | 'dark'
  className?: string
  children?: React.ReactNode
}

const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  ({ 
    orientation = 'horizontal', 
    variant = 'solid', 
    thickness = 'thin',
    color = 'medium',
    className, 
    children,
    ...props 
  }, ref) => {
    const baseClasses = 'flex items-center'
    
    const orientationClasses = {
      horizontal: 'w-full',
      vertical: 'h-full flex-col'
    }

    const variantClasses = {
      solid: 'border-solid',
      dashed: 'border-dashed',
      dotted: 'border-dotted'
    }

    const thicknessClasses = {
      thin: orientation === 'horizontal' ? 'border-t' : 'border-l',
      medium: orientation === 'horizontal' ? 'border-t-2' : 'border-l-2',
      thick: orientation === 'horizontal' ? 'border-t-4' : 'border-l-4'
    }

    const colorClasses = {
      light: 'border-[hsl(var(--color-secondary-200))]',
      medium: 'border-[hsl(var(--color-secondary-300))]',
      dark: 'border-[hsl(var(--color-secondary-500))]'
    }

    const lineClasses = cn(
      'flex-1',
      variantClasses[variant],
      thicknessClasses[thickness],
      colorClasses[color]
    )

    if (!children) {
      return (
        <div
          ref={ref}
          className={cn(
            lineClasses,
            orientationClasses[orientation],
            className
          )}
          {...props}
        />
      )
    }

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          orientationClasses[orientation],
          className
        )}
        {...props}
      >
        <div className={lineClasses} />
        <div className={cn(
          'px-3 text-sm text-[hsl(var(--color-secondary-500))] font-medium',
          orientation === 'vertical' && 'py-3 px-0'
        )}>
          {children}
        </div>
        <div className={lineClasses} />
      </div>
    )
  }
)

Divider.displayName = 'Divider'

export default Divider`

// ===== NAVIGATION COMPONENTS =====

export const TABS_TEMPLATE = `import React from 'react'
import { cn } from '@/lib/utils'

interface Tab {
  key: string
  label: string
  content: React.ReactNode
  disabled?: boolean
  icon?: React.ReactNode
}

interface TabsProps {
  tabs: Tab[]
  defaultActiveKey?: string
  activeKey?: string
  onChange?: (key: string) => void
  variant?: 'default' | 'pills' | 'underline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ 
    tabs, 
    defaultActiveKey, 
    activeKey: controlledActiveKey, 
    onChange, 
    variant = 'default',
    size = 'md',
    className,
    ...props 
  }, ref) => {
    const [internalActiveKey, setInternalActiveKey] = React.useState(
      controlledActiveKey || defaultActiveKey || tabs[0]?.key
    )

    const activeKey = controlledActiveKey || internalActiveKey

    const handleTabChange = (key: string) => {
      if (!controlledActiveKey) {
        setInternalActiveKey(key)
      }
      onChange?.(key)
    }

    const variantClasses = {
      default: {
        container: 'border-b border-[hsl(var(--color-secondary-300))]',
        tab: 'border-b-2 border-transparent hover:border-[hsl(var(--color-secondary-300))]',
        active: 'border-[hsl(var(--color-primary-500))] text-[hsl(var(--color-primary-600))]',
        inactive: 'text-[hsl(var(--color-secondary-600))] hover:text-[hsl(var(--color-secondary-900))]'
      },
      pills: {
        container: '',
        tab: 'rounded-lg hover:bg-[hsl(var(--color-secondary-100))]',
        active: 'bg-[hsl(var(--color-primary-500))] text-white',
        inactive: 'text-[hsl(var(--color-secondary-600))] hover:text-[hsl(var(--color-secondary-900))]'
      },
      underline: {
        container: '',
        tab: 'border-b-2 border-transparent hover:border-[hsl(var(--color-secondary-300))]',
        active: 'border-[hsl(var(--color-primary-500))] text-[hsl(var(--color-primary-600))]',
        inactive: 'text-[hsl(var(--color-secondary-600))] hover:text-[hsl(var(--color-secondary-900))]'
      }
    }

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    }

    const activeTab = tabs.find(tab => tab.key === activeKey)

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        <div className={cn('flex space-x-1', variantClasses[variant].container)}>
          {tabs.map((tab) => {
            const isActive = tab.key === activeKey
            const isDisabled = tab.disabled

            return (
              <button
                key={tab.key}
                onClick={() => !isDisabled && handleTabChange(tab.key)}
                disabled={isDisabled}
                className={cn(
                  'flex items-center space-x-2 font-medium transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary-500))] focus:ring-offset-2',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  sizeClasses[size],
                  variantClasses[variant].tab,
                  isActive 
                    ? variantClasses[variant].active 
                    : variantClasses[variant].inactive
                )}
              >
                {tab.icon && (
                  <span className="flex-shrink-0">{tab.icon}</span>
                )}
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        <div className="mt-4">
          {activeTab?.content}
        </div>
      </div>
    )
  }
)

Tabs.displayName = 'Tabs'

export default Tabs`

// Additional component templates array
export const additionalComponentTemplates: ComponentTemplate[] = [
  // Data Display
  {
    id: 'table',
    name: 'Table',
    category: 'optional',
    template_code: TABLE_TEMPLATE,
    props_schema: {
      variant: {
        type: 'string',
        required: false,
        default: 'default',
        options: ['default', 'striped', 'bordered'],
        description: 'Table visual variant'
      },
      size: {
        type: 'string',
        required: false,
        default: 'md',
        options: ['sm', 'md', 'lg'],
        description: 'Table size'
      }
    },
    description: 'Data table with sorting and pagination support',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'badge',
    name: 'Badge',
    category: 'optional',
    template_code: BADGE_TEMPLATE,
    props_schema: {
      variant: {
        type: 'string',
        required: false,
        default: 'default',
        options: ['default', 'primary', 'secondary', 'success', 'warning', 'error'],
        description: 'Badge color variant'
      },
      size: {
        type: 'string',
        required: false,
        default: 'md',
        options: ['sm', 'md', 'lg'],
        description: 'Badge size'
      },
      rounded: {
        type: 'boolean',
        required: false,
        default: false,
        description: 'Rounded badge style'
      }
    },
    description: 'Status badge for displaying small pieces of information',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'avatar',
    name: 'Avatar',
    category: 'optional',
    template_code: AVATAR_TEMPLATE,
    props_schema: {
      size: {
        type: 'string',
        required: false,
        default: 'md',
        options: ['xs', 'sm', 'md', 'lg', 'xl'],
        description: 'Avatar size'
      },
      variant: {
        type: 'string',
        required: false,
        default: 'circle',
        options: ['circle', 'square'],
        description: 'Avatar shape'
      }
    },
    description: 'User avatar with fallback support',
    is_active: true,
    created_at: new Date().toISOString()
  },

  // Feedback
  {
    id: 'toast',
    name: 'Toast',
    category: 'optional',
    template_code: TOAST_TEMPLATE,
    props_schema: {
      variant: {
        type: 'string',
        required: false,
        default: 'default',
        options: ['default', 'success', 'warning', 'error'],
        description: 'Toast notification type'
      },
      duration: {
        type: 'number',
        required: false,
        default: 5000,
        description: 'Auto-close duration in milliseconds'
      }
    },
    description: 'Toast notification for user feedback',
    is_active: true,
    created_at: new Date().toISOString()
  },

  // Layout
  {
    id: 'grid',
    name: 'Grid',
    category: 'optional',
    template_code: GRID_TEMPLATE,
    props_schema: {
      cols: {
        type: 'number',
        required: false,
        default: 1,
        options: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        description: 'Number of grid columns'
      },
      gap: {
        type: 'string',
        required: false,
        default: 'md',
        options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
        description: 'Grid gap size'
      }
    },
    description: 'Responsive grid layout system',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'divider',
    name: 'Divider',
    category: 'optional',
    template_code: DIVIDER_TEMPLATE,
    props_schema: {
      orientation: {
        type: 'string',
        required: false,
        default: 'horizontal',
        options: ['horizontal', 'vertical'],
        description: 'Divider orientation'
      },
      variant: {
        type: 'string',
        required: false,
        default: 'solid',
        options: ['solid', 'dashed', 'dotted'],
        description: 'Divider line style'
      }
    },
    description: 'Visual divider for content separation',
    is_active: true,
    created_at: new Date().toISOString()
  },

  // Navigation
  {
    id: 'tabs',
    name: 'Tabs',
    category: 'optional',
    template_code: TABS_TEMPLATE,
    props_schema: {
      variant: {
        type: 'string',
        required: false,
        default: 'default',
        options: ['default', 'pills', 'underline'],
        description: 'Tabs visual style'
      },
      size: {
        type: 'string',
        required: false,
        default: 'md',
        options: ['sm', 'md', 'lg'],
        description: 'Tabs size'
      }
    },
    description: 'Tabbed navigation component',
    is_active: true,
    created_at: new Date().toISOString()
  }
]