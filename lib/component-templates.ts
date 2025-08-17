import { ComponentTemplate } from '@/types/database'
import { enhancedComponentTemplates } from './enhanced-component-templates'
import { additionalComponentTemplates } from './additional-component-templates'
import { extendedComponentTemplates } from './extended-component-templates'
import { chartComponentTemplates } from './chart-component-templates'
import { imageComponentTemplates } from './image-component-templates'

// Basic Component Templates
export const BUTTON_TEMPLATE = `import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
    
    const variantClasses = {
      primary: 'bg-[hsl(var(--color-primary-500))] text-white hover:bg-[hsl(var(--color-primary-600))]',
      secondary: 'bg-[hsl(var(--color-secondary-200))] text-[hsl(var(--color-secondary-900))] hover:bg-[hsl(var(--color-secondary-300))]',
      outline: 'border border-[hsl(var(--color-primary-500))] text-[hsl(var(--color-primary-500))] hover:bg-[hsl(var(--color-primary-50))]',
      ghost: 'text-[hsl(var(--color-primary-500))] hover:bg-[hsl(var(--color-primary-50))]'
    }
    
    const sizeClasses = {
      sm: 'h-8 px-3 text-sm rounded-md',
      md: 'h-10 px-4 text-base rounded-lg',
      lg: 'h-12 px-6 text-lg rounded-lg'
    }

    return (
      <button
        ref={ref}
        className={cn(baseClasses, variantClasses[variant], sizeClasses[size], className)}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button`

export const INPUT_TEMPLATE = `import React from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'filled'
  inputSize?: 'sm' | 'md' | 'lg'
  label?: string
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = 'default', inputSize = 'md', type = 'text', label, error, ...props }, ref) => {
    const baseClasses = 'w-full border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1'
    
    const variantClasses = {
      default: 'border-[hsl(var(--color-secondary-300))] bg-white focus:border-[hsl(var(--color-primary-500))] focus:ring-[hsl(var(--color-primary-500))]',
      filled: 'border-transparent bg-[hsl(var(--color-secondary-100))] focus:bg-white focus:border-[hsl(var(--color-primary-500))] focus:ring-[hsl(var(--color-primary-500))]'
    }
    
    const sizeClasses = {
      sm: 'h-8 px-3 text-sm rounded-md',
      md: 'h-10 px-4 text-base rounded-lg',
      lg: 'h-12 px-5 text-lg rounded-lg'
    }

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-[hsl(var(--color-secondary-700))]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            baseClasses,
            variantClasses[variant],
            sizeClasses[inputSize],
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input`

export const CARD_TEMPLATE = `import React from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  variant?: 'default' | 'outlined' | 'elevated'
  className?: string
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, variant = 'default', className, ...props }, ref) => {
    const variantClasses = {
      default: 'bg-white',
      outlined: 'bg-white border border-[hsl(var(--color-secondary-300))]',
      elevated: 'bg-white shadow-lg'
    }

    return (
      <div
        ref={ref}
        className={cn('rounded-lg p-6', variantClasses[variant], className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export default Card`

export const MODAL_TEMPLATE = `import React from 'react'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({ isOpen, onClose, title, children, className, ...props }, ref) => {
    if (!isOpen) return null

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div 
          className="fixed inset-0 bg-black/50"
          onClick={onClose}
        />
        <div
          ref={ref}
          className={cn(
            'relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4',
            className
          )}
          {...props}
        >
          {title && (
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">{title}</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          )}
          <div className="p-4">
            {children}
          </div>
        </div>
      </div>
    )
  }
)

Modal.displayName = 'Modal'

export default Modal`

export const TYPOGRAPHY_TEMPLATE = `import React from 'react'
import { cn } from '@/lib/utils'

interface TypographyProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'small' | 'code'
  children: React.ReactNode
  className?: string
  as?: keyof JSX.IntrinsicElements
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ variant = 'body', children, className, as, ...props }, ref) => {
    const variantClasses = {
      h1: 'text-4xl font-bold text-gray-900 leading-tight',
      h2: 'text-3xl font-bold text-gray-800 leading-tight',
      h3: 'text-2xl font-semibold text-gray-700 leading-tight',
      h4: 'text-xl font-medium text-gray-700 leading-tight',
      body: 'text-base text-gray-600 leading-relaxed',
      small: 'text-sm text-gray-500 leading-relaxed',
      code: 'font-mono text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded'
    }

    const defaultElement = {
      h1: 'h1',
      h2: 'h2', 
      h3: 'h3',
      h4: 'h4',
      body: 'p',
      small: 'span',
      code: 'code'
    }

    const Component = (as || defaultElement[variant]) as keyof JSX.IntrinsicElements

    return (
      <Component
        ref={ref}
        className={cn(variantClasses[variant], className)}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

Typography.displayName = 'Typography'

export default Typography`

// Basic component templates array
export const basicComponentTemplates: ComponentTemplate[] = [
  {
    id: 'button',
    name: 'Button',
    category: 'essential',
    template_code: BUTTON_TEMPLATE,
    props_schema: {
      variant: {
        type: 'string',
        required: false,
        default: 'primary',
        options: ['primary', 'secondary', 'outline', 'ghost'],
        description: 'Button visual variant'
      },
      size: {
        type: 'string',
        required: false,
        default: 'md',
        options: ['sm', 'md', 'lg'],
        description: 'Button size'
      }
    },
    description: 'Basic button component with variants',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'input',
    name: 'Input',
    category: 'essential',
    template_code: INPUT_TEMPLATE,
    props_schema: {
      variant: {
        type: 'string',
        required: false,
        default: 'default',
        options: ['default', 'filled'],
        description: 'Input visual variant'
      },
      inputSize: {
        type: 'string',
        required: false,
        default: 'md',
        options: ['sm', 'md', 'lg'],
        description: 'Input size'
      }
    },
    description: 'Basic input field component',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'card',
    name: 'Card',
    category: 'essential',
    template_code: CARD_TEMPLATE,
    props_schema: {
      variant: {
        type: 'string',
        required: false,
        default: 'default',
        options: ['default', 'outlined', 'elevated'],
        description: 'Card visual variant'
      }
    },
    description: 'Basic card container component',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'modal',
    name: 'Modal',
    category: 'essential',
    template_code: MODAL_TEMPLATE,
    props_schema: {
      isOpen: {
        type: 'boolean',
        required: true,
        description: 'Modal visibility state'
      }
    },
    description: 'Basic modal dialog component',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'typography',
    name: 'Typography',
    category: 'essential',
    template_code: TYPOGRAPHY_TEMPLATE,
    props_schema: {
      variant: {
        type: 'string',
        required: false,
        default: 'body',
        options: ['h1', 'h2', 'h3', 'h4', 'body', 'small', 'code'],
        description: 'Typography variant'
      }
    },
    description: 'Typography component for text styling',
    is_active: true,
    created_at: new Date().toISOString()
  }
]

// All component templates combined
export const allComponentTemplates: ComponentTemplate[] = [
  ...basicComponentTemplates,
  ...enhancedComponentTemplates,
  ...additionalComponentTemplates,
  ...extendedComponentTemplates,
  ...chartComponentTemplates,
  ...imageComponentTemplates
]

export default allComponentTemplates