import { ComponentTemplate } from '@/types/database'

// 향상된 버튼 템플릿 - 접근성과 상태 처리 강화
export const ENHANCED_BUTTON_TEMPLATE = `import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  children: React.ReactNode
  loading?: boolean
  fullWidth?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  loadingText?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    children, 
    loading = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    loadingText,
    disabled, 
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading
    
    const baseClasses = cn(
      // Base styles
      'inline-flex items-center justify-center font-medium transition-all duration-200',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      // Hover and active states
      'hover:scale-[0.98] active:scale-[0.96]',
      // Full width
      fullWidth && 'w-full',
      // Loading state
      loading && 'cursor-wait'
    )
    
    const variantClasses = {
      primary: cn(
        'bg-[hsl(var(--color-primary-500))] text-white shadow-sm',
        'hover:bg-[hsl(var(--color-primary-600))]',
        'focus-visible:ring-[hsl(var(--color-primary-500))]',
        'active:bg-[hsl(var(--color-primary-700))]'
      ),
      secondary: cn(
        'bg-[hsl(var(--color-secondary-100))] text-[hsl(var(--color-secondary-900))] shadow-sm',
        'hover:bg-[hsl(var(--color-secondary-200))]',
        'focus-visible:ring-[hsl(var(--color-secondary-500))]'
      ),
      outline: cn(
        'border-2 border-[hsl(var(--color-primary-500))] text-[hsl(var(--color-primary-500))] bg-transparent',
        'hover:bg-[hsl(var(--color-primary-50))]',
        'focus-visible:ring-[hsl(var(--color-primary-500))]',
        'active:bg-[hsl(var(--color-primary-100))]'
      ),
      ghost: cn(
        'text-[hsl(var(--color-primary-500))] bg-transparent',
        'hover:bg-[hsl(var(--color-primary-50))]',
        'focus-visible:ring-[hsl(var(--color-primary-500))]'
      ),
      destructive: cn(
        'bg-red-500 text-white shadow-sm',
        'hover:bg-red-600',
        'focus-visible:ring-red-500',
        'active:bg-red-700'
      )
    }
    
    const sizeClasses = {
      xs: 'h-7 px-2 text-xs rounded-md gap-1',
      sm: 'h-8 px-3 text-sm rounded-md gap-1.5',
      md: 'h-10 px-4 text-base rounded-lg gap-2',
      lg: 'h-12 px-6 text-lg rounded-lg gap-2.5',
      xl: 'h-14 px-8 text-xl rounded-xl gap-3'
    }

    const LoadingSpinner = () => (
      <svg 
        className="animate-spin h-4 w-4" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    )

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        disabled={isDisabled}
        aria-busy={loading}
        aria-describedby={loading ? 'loading-description' : undefined}
        {...props}
      >
        {loading && <LoadingSpinner />}
        {!loading && leftIcon && (
          <span className="flex-shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        
        <span className="truncate">
          {loading && loadingText ? loadingText : children}
        </span>
        
        {!loading && rightIcon && (
          <span className="flex-shrink-0" aria-hidden="true">
            {rightIcon}
          </span>
        )}
        
        {loading && (
          <span id="loading-description" className="sr-only">
            Loading, please wait
          </span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button`

// 향상된 입력 필드 템플릿
export const ENHANCED_INPUT_TEMPLATE = `import React from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'filled' | 'flushed' | 'outline'
  inputSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  label?: string
  error?: string
  helper?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  clearable?: boolean
  onClear?: () => void
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant = 'default', 
    inputSize = 'md', 
    type = 'text',
    label,
    error,
    helper,
    leftIcon,
    rightIcon,
    clearable = false,
    onClear,
    value,
    disabled,
    required,
    id,
    'aria-describedby': ariaDescribedBy,
    ...props 
  }, ref) => {
    const inputId = id || React.useId()
    const errorId = error ? \`\${inputId}-error\` : undefined
    const helperId = helper ? \`\${inputId}-helper\` : undefined
    const describedBy = [errorId, helperId, ariaDescribedBy].filter(Boolean).join(' ') || undefined

    const baseClasses = cn(
      'w-full transition-all duration-200 font-medium',
      'focus:outline-none focus:ring-2 focus:ring-offset-1',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'placeholder:text-[hsl(var(--color-secondary-400))]'
    )
    
    const variantClasses = {
      default: cn(
        'border-2 border-[hsl(var(--color-secondary-300))] bg-white rounded-lg',
        'hover:border-[hsl(var(--color-secondary-400))]',
        'focus:border-[hsl(var(--color-primary-500))] focus:ring-[hsl(var(--color-primary-500))]',
        error && 'border-red-500 focus:border-red-500 focus:ring-red-500'
      ),
      filled: cn(
        'bg-[hsl(var(--color-secondary-100))] border-2 border-transparent rounded-lg',
        'hover:bg-[hsl(var(--color-secondary-150))]',
        'focus:bg-white focus:border-[hsl(var(--color-primary-500))] focus:ring-[hsl(var(--color-primary-500))]',
        error && 'bg-red-50 focus:border-red-500 focus:ring-red-500'
      ),
      flushed: cn(
        'border-0 border-b-2 border-[hsl(var(--color-secondary-300))] rounded-none bg-transparent',
        'hover:border-[hsl(var(--color-secondary-400))]',
        'focus:border-[hsl(var(--color-primary-500))] focus:ring-0',
        error && 'border-red-500 focus:border-red-500'
      ),
      outline: cn(
        'border-2 border-[hsl(var(--color-primary-300))] bg-transparent rounded-lg',
        'hover:border-[hsl(var(--color-primary-400))]',
        'focus:border-[hsl(var(--color-primary-500))] focus:ring-[hsl(var(--color-primary-500))]',
        error && 'border-red-500 focus:border-red-500 focus:ring-red-500'
      )
    }
    
    const sizeClasses = {
      xs: 'h-7 px-2 text-xs',
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-base',
      lg: 'h-12 px-5 text-lg',
      xl: 'h-14 px-6 text-xl'
    }

    const iconSizeClasses = {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
      xl: 'h-7 w-7'
    }

    const ClearButton = () => (
      <button
        type="button"
        onClick={onClear}
        className={cn(
          'absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full',
          'text-[hsl(var(--color-secondary-400))] hover:text-[hsl(var(--color-secondary-600))]',
          'hover:bg-[hsl(var(--color-secondary-100))] transition-colors',
          'focus:outline-none focus:ring-1 focus:ring-[hsl(var(--color-primary-500))]'
        )}
        aria-label="Clear input"
      >
        <svg className={iconSizeClasses[inputSize]} viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    )

    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium text-[hsl(var(--color-secondary-700))]',
              required && "after:content-['*'] after:ml-0.5 after:text-red-500"
            )}
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className={cn(
              'absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-secondary-400))]',
              iconSizeClasses[inputSize]
            )}>
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            type={type}
            value={value}
            disabled={disabled}
            required={required}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={describedBy}
            className={cn(
              baseClasses,
              variantClasses[variant],
              sizeClasses[inputSize],
              leftIcon && 'pl-10',
              (rightIcon || (clearable && value)) && 'pr-10',
              className
            )}
            {...props}
          />
          
          {clearable && value && !rightIcon && <ClearButton />}
          
          {rightIcon && !clearable && (
            <div className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--color-secondary-400))]',
              iconSizeClasses[inputSize]
            )}>
              {rightIcon}
            </div>
          )}
        </div>
        
        {error && (
          <p id={errorId} className="text-sm text-red-600 flex items-center gap-1" role="alert">
            <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </p>
        )}
        
        {helper && !error && (
          <p id={helperId} className="text-sm text-[hsl(var(--color-secondary-500))]">
            {helper}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input`

// 향상된 모달 템플릿
export const ENHANCED_MODAL_TEMPLATE = `import React, { useEffect } from 'react'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  className?: string
  showCloseButton?: boolean
  preventBodyScroll?: boolean
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({ 
    isOpen, 
    onClose, 
    title, 
    description, 
    children, 
    size = 'md',
    closeOnOverlayClick = true,
    closeOnEscape = true,
    showCloseButton = true,
    preventBodyScroll = true,
    className,
    ...props 
  }, ref) => {
    const titleId = React.useId()
    const descriptionId = React.useId()

    const sizeClasses = {
      xs: 'max-w-xs',
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      full: 'max-w-full mx-4'
    }

    // Body scroll 관리
    useEffect(() => {
      if (!isOpen || !preventBodyScroll) return

      const originalStyle = window.getComputedStyle(document.body).overflow
      document.body.style.overflow = 'hidden'

      return () => {
        document.body.style.overflow = originalStyle
      }
    }, [isOpen, preventBodyScroll])

    // 키보드 이벤트 처리
    useEffect(() => {
      if (!isOpen) return

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && closeOnEscape) {
          onClose()
        }
      }

      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose, closeOnEscape])

    // Focus trap 구현
    useEffect(() => {
      if (!isOpen) return

      const modal = document.querySelector('[data-modal="true"]')
      if (!modal) return

      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement?.focus()
            e.preventDefault()
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement?.focus()
            e.preventDefault()
          }
        }
      }

      // 첫 번째 요소에 포커스
      firstElement?.focus()

      document.addEventListener('keydown', handleTabKey)
      return () => document.removeEventListener('keydown', handleTabKey)
    }, [isOpen])

    if (!isOpen) return null

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={closeOnOverlayClick ? onClose : undefined}
          aria-hidden="true"
        />
        
        {/* Modal */}
        <div
          ref={ref}
          data-modal="true"
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-describedby={description ? descriptionId : undefined}
          className={cn(
            'relative w-full bg-white rounded-xl shadow-2xl',
            'max-h-[90vh] overflow-hidden',
            'animate-in fade-in-0 zoom-in-95 duration-200',
            sizeClasses[size],
            className
          )}
          {...props}
        >
          {/* Header */}
          {(title || description || showCloseButton) && (
            <div className="flex items-start justify-between p-6 border-b border-[hsl(var(--color-secondary-200))]">
              <div className="flex-1">
                {title && (
                  <h2 id={titleId} className="text-xl font-semibold text-[hsl(var(--color-secondary-900))]">
                    {title}
                  </h2>
                )}
                {description && (
                  <p id={descriptionId} className="mt-1 text-sm text-[hsl(var(--color-secondary-600))]">
                    {description}
                  </p>
                )}
              </div>
              
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className={cn(
                    'ml-4 p-2 rounded-lg text-[hsl(var(--color-secondary-400))]',
                    'hover:text-[hsl(var(--color-secondary-600))] hover:bg-[hsl(var(--color-secondary-100))]',
                    'focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary-500))]',
                    'transition-colors'
                  )}
                  aria-label="Close modal"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
          
          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {children}
          </div>
        </div>
      </div>
    )
  }
)

Modal.displayName = 'Modal'

export default Modal`

export const enhancedComponentTemplates: ComponentTemplate[] = [
  {
    id: 'enhanced-button',
    name: 'Enhanced Button',
    category: 'essential',
    template_code: ENHANCED_BUTTON_TEMPLATE,
    props_schema: {
      variant: {
        type: 'string',
        required: false,
        default: 'primary',
        options: ['primary', 'secondary', 'outline', 'ghost', 'destructive'],
        description: 'Button visual variant'
      },
      size: {
        type: 'string',
        required: false,
        default: 'md',
        options: ['xs', 'sm', 'md', 'lg', 'xl'],
        description: 'Button size'
      },
      loading: {
        type: 'boolean',
        required: false,
        default: false,
        description: 'Show loading state with spinner'
      },
      fullWidth: {
        type: 'boolean',
        required: false,
        default: false,
        description: 'Make button full width'
      }
    },
    description: 'Enhanced button with accessibility, loading states, and icon support',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'enhanced-input',
    name: 'Enhanced Input',
    category: 'essential',
    template_code: ENHANCED_INPUT_TEMPLATE,
    props_schema: {
      variant: {
        type: 'string',
        required: false,
        default: 'default',
        options: ['default', 'filled', 'flushed', 'outline'],
        description: 'Input visual variant'
      },
      clearable: {
        type: 'boolean',
        required: false,
        default: false,
        description: 'Show clear button when input has value'
      }
    },
    description: 'Enhanced input with icons, clear functionality, and improved accessibility',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'enhanced-modal',
    name: 'Enhanced Modal',
    category: 'essential',
    template_code: ENHANCED_MODAL_TEMPLATE,
    props_schema: {
      size: {
        type: 'string',
        required: false,
        default: 'md',
        options: ['xs', 'sm', 'md', 'lg', 'xl', 'full'],
        description: 'Modal size'
      },
      closeOnOverlayClick: {
        type: 'boolean',
        required: false,
        default: true,
        description: 'Close modal when clicking outside'
      },
      preventBodyScroll: {
        type: 'boolean',
        required: false,
        default: true,
        description: 'Prevent body scrolling when modal is open'
      }
    },
    description: 'Enhanced modal with focus trap, keyboard navigation, and accessibility features',
    is_active: true,
    created_at: new Date().toISOString()
  }
]