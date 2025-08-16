'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { GeneratedComponent, ThemeData } from '@/types/database'
import { CSSVariablesGenerator } from '@/lib/css-variables-generator'

interface ComponentCanvasProps {
  components: GeneratedComponent[]
  theme: ThemeData
  className?: string
}

interface ComponentVariant {
  name: string
  props: Record<string, any>
  description?: string
}

const ComponentCanvas: React.FC<ComponentCanvasProps> = ({ components, theme, className }) => {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)
  const [cssVariables, setCssVariables] = useState<string>('')

  // CSS 변수 생성
  const cssVarsGenerator = useMemo(() => new CSSVariablesGenerator(theme), [theme])
  
  useEffect(() => {
    const { cssContent } = cssVarsGenerator.generateCSSVariables()
    setCssVariables(cssContent)
  }, [cssVarsGenerator])

  // 컴포넌트별 변형 정의
  const getComponentVariants = (componentName: string): ComponentVariant[] => {
    const baseVariants: Record<string, ComponentVariant[]> = {
      'Button': [
        { name: 'Primary', props: { variant: 'primary', children: 'Primary Button' } },
        { name: 'Secondary', props: { variant: 'secondary', children: 'Secondary Button' } },
        { name: 'Outline', props: { variant: 'outline', children: 'Outline Button' } },
        { name: 'Ghost', props: { variant: 'ghost', children: 'Ghost Button' } },
        { name: 'Loading', props: { variant: 'primary', loading: true, children: 'Loading...' } },
        { name: 'Disabled', props: { variant: 'primary', disabled: true, children: 'Disabled' } },
        { name: 'Small', props: { variant: 'primary', size: 'sm', children: 'Small' } },
        { name: 'Large', props: { variant: 'primary', size: 'lg', children: 'Large' } }
      ],
      'Enhanced Button': [
        { name: 'Primary', props: { variant: 'primary', children: 'Primary Button' } },
        { name: 'Secondary', props: { variant: 'secondary', children: 'Secondary Button' } },
        { name: 'Outline', props: { variant: 'outline', children: 'Outline Button' } },
        { name: 'Ghost', props: { variant: 'ghost', children: 'Ghost Button' } },
        { name: 'Destructive', props: { variant: 'destructive', children: 'Delete' } },
        { name: 'Loading', props: { variant: 'primary', loading: true, children: 'Loading...' } },
        { name: 'With Icons', props: { variant: 'primary', leftIcon: '🚀', children: 'Launch' } },
        { name: 'Full Width', props: { variant: 'primary', fullWidth: true, children: 'Full Width' } }
      ],
      'Input': [
        { name: 'Default', props: { placeholder: 'Enter text...', label: 'Default Input' } },
        { name: 'Filled', props: { variant: 'filled', placeholder: 'Enter text...', label: 'Filled Input' } },
        { name: 'Flushed', props: { variant: 'flushed', placeholder: 'Enter text...', label: 'Flushed Input' } },
        { name: 'With Error', props: { placeholder: 'Enter text...', label: 'Input with Error', error: 'This field is required' } },
        { name: 'With Helper', props: { placeholder: 'Enter text...', label: 'Input with Helper', helper: 'This is a helpful message' } },
        { name: 'Email', props: { type: 'email', placeholder: 'user@example.com', label: 'Email Address' } },
        { name: 'Password', props: { type: 'password', placeholder: '••••••••', label: 'Password' } },
        { name: 'Disabled', props: { placeholder: 'Disabled input', label: 'Disabled Input', disabled: true } }
      ],
      'Enhanced Input': [
        { name: 'Default', props: { placeholder: 'Enter text...', label: 'Default Input' } },
        { name: 'With Icons', props: { placeholder: 'Search...', label: 'Search Input', leftIcon: '🔍' } },
        { name: 'Clearable', props: { placeholder: 'Clearable input', label: 'Clearable Input', clearable: true, defaultValue: 'Clear me' } },
        { name: 'With Error', props: { placeholder: 'Enter text...', label: 'Input with Error', error: 'This field is required' } },
        { name: 'Required', props: { placeholder: 'Enter text...', label: 'Required Input', required: true } }
      ],
      'Card': [
        { name: 'Basic', props: { children: 'Basic card content' } },
        { name: 'Outlined', props: { variant: 'outlined', children: 'Outlined card content' } },
        { name: 'Elevated', props: { variant: 'elevated', children: 'Elevated card content' } }
      ],
      'Modal': [
        { name: 'Basic', props: { isOpen: false, title: 'Basic Modal', children: 'Modal content goes here' } },
        { name: 'With Description', props: { isOpen: false, title: 'Modal Title', description: 'This is a modal description', children: 'Modal content' } }
      ],
      'Enhanced Modal': [
        { name: 'Basic', props: { isOpen: false, title: 'Enhanced Modal', children: 'Enhanced modal content' } },
        { name: 'Large', props: { isOpen: false, title: 'Large Modal', size: 'lg', children: 'Large modal content' } },
        { name: 'No Close Button', props: { isOpen: false, title: 'No Close', showCloseButton: false, children: 'Modal without close button' } }
      ]
    }

    return baseVariants[componentName] || [
      { name: 'Default', props: { children: 'Component content' } }
    ]
  }

  // 컴포넌트 렌더링 함수
  const renderComponent = (component: GeneratedComponent, variant: ComponentVariant) => {
    try {
      // 실제 환경에서는 동적 컴포넌트 렌더링을 위해 
      // React.createElement나 Function constructor를 사용해야 합니다.
      // 여기서는 시각적 표현만 제공합니다.
      
      const componentName = component.component_name
      const isModal = componentName.toLowerCase().includes('modal')
      
      if (isModal) {
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
            <div className="text-gray-600 mb-2">🪟 {componentName}</div>
            <div className="text-sm text-gray-500">{variant.name} variant</div>
            <div className="text-xs text-gray-400 mt-2">
              Click to preview modal
            </div>
          </div>
        )
      }

      return (
        <div className="space-y-2">
          <ComponentPreview 
            componentName={componentName}
            variant={variant}
            theme={theme}
          />
        </div>
      )
    } catch (error) {
      console.error('Error rendering component:', error)
      return (
        <div className="border border-red-300 rounded-lg p-4 bg-red-50 text-red-700">
          <div className="font-medium">Error rendering {component.component_name}</div>
          <div className="text-sm mt-1">Variant: {variant.name}</div>
        </div>
      )
    }
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* CSS 변수 스타일 주입 */}
      <style dangerouslySetInnerHTML={{ __html: cssVariables }} />
      
      {/* 컴포넌트별 섹션 */}
      {components.map((component) => {
        const variants = getComponentVariants(component.component_name)
        
        return (
          <div key={component.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                {component.component_name}
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {variants.length} variants
                </span>
                <button
                  onClick={() => setSelectedComponent(
                    selectedComponent === component.id ? null : component.id
                  )}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {selectedComponent === component.id ? 'Hide Code' : 'View Code'}
                </button>
              </div>
            </div>

            {/* 컴포넌트 변형 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {variants.map((variant, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow"
                >
                  <div className="text-sm font-medium text-gray-700">
                    {variant.name}
                  </div>
                  
                  <div className="flex items-center justify-center min-h-[80px] bg-gray-50 rounded border">
                    {renderComponent(component, variant)}
                  </div>
                  
                  {variant.description && (
                    <div className="text-xs text-gray-500">
                      {variant.description}
                    </div>
                  )}
                  
                  {/* Props 표시 */}
                  <details className="text-xs">
                    <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                      Props
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                      {JSON.stringify(variant.props, null, 2)}
                    </pre>
                  </details>
                </div>
              ))}
            </div>

            {/* 컴포넌트 코드 표시 */}
            {selectedComponent === component.id && (
              <div className="border border-gray-300 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between p-4 border-b border-gray-300">
                  <h4 className="font-medium text-gray-900">Generated Code</h4>
                  <button
                    onClick={() => navigator.clipboard.writeText(component.component_code)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Copy Code
                  </button>
                </div>
                <pre className="p-4 text-sm overflow-x-auto">
                  <code>{component.component_code}</code>
                </pre>
              </div>
            )}
          </div>
        )
      })}

      {components.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">🎨</div>
          <p>No components to preview. Generate some components first!</p>
        </div>
      )}
    </div>
  )
}

// 개별 컴포넌트 미리보기 컴포넌트
const ComponentPreview: React.FC<{
  componentName: string
  variant: ComponentVariant
  theme: ThemeData
}> = ({ componentName, variant, theme }) => {
  const getPreviewElement = () => {
    const { props } = variant
    const baseClasses = "transition-all duration-200"
    
    switch (componentName.toLowerCase()) {
      case 'button':
      case 'enhanced button':
        const buttonVariants = {
          primary: 'bg-blue-600 text-white hover:bg-blue-700',
          secondary: 'bg-gray-600 text-white hover:bg-gray-700',
          outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
          ghost: 'text-blue-600 hover:bg-blue-50',
          destructive: 'bg-red-600 text-white hover:bg-red-700'
        }
        
        const buttonSize = {
          xs: 'px-2 py-1 text-xs',
          sm: 'px-3 py-1.5 text-sm',
          md: 'px-4 py-2 text-base',
          lg: 'px-6 py-3 text-lg',
          xl: 'px-8 py-4 text-xl'
        }
        
        return (
          <button
            className={`
              ${baseClasses} 
              ${buttonVariants[props.variant] || buttonVariants.primary}
              ${buttonSize[props.size] || buttonSize.md}
              ${props.loading ? 'opacity-70 cursor-wait' : ''}
              ${props.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
              ${props.fullWidth ? 'w-full' : ''}
              rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2
            `}
            disabled={props.disabled || props.loading}
          >
            {props.loading && (
              <span className="inline-block animate-spin mr-2">⏳</span>
            )}
            {props.leftIcon && <span className="mr-2">{props.leftIcon}</span>}
            {props.children}
            {props.rightIcon && <span className="ml-2">{props.rightIcon}</span>}
          </button>
        )

      case 'input':
      case 'enhanced input':
        const inputVariants = {
          default: 'border-2 border-gray-300 focus:border-blue-500',
          filled: 'bg-gray-100 border-2 border-transparent focus:bg-white focus:border-blue-500',
          flushed: 'border-0 border-b-2 border-gray-300 rounded-none focus:border-blue-500',
          outline: 'border-2 border-blue-300 focus:border-blue-500'
        }

        return (
          <div className="w-full space-y-1">
            {props.label && (
              <label className="block text-sm font-medium text-gray-700">
                {props.label}
                {props.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
            <div className="relative">
              {props.leftIcon && (
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  {props.leftIcon}
                </div>
              )}
              <input
                type={props.type || 'text'}
                placeholder={props.placeholder}
                disabled={props.disabled}
                className={`
                  ${baseClasses}
                  ${inputVariants[props.variant] || inputVariants.default}
                  ${props.leftIcon ? 'pl-10' : 'pl-3'}
                  ${props.clearable ? 'pr-10' : 'pr-3'}
                  w-full py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                  ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                defaultValue={props.defaultValue}
              />
              {props.clearable && props.defaultValue && (
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              )}
            </div>
            {props.error && (
              <p className="text-sm text-red-600 flex items-center">
                <span className="mr-1">⚠️</span>
                {props.error}
              </p>
            )}
            {props.helper && !props.error && (
              <p className="text-sm text-gray-500">{props.helper}</p>
            )}
          </div>
        )

      case 'card':
        const cardVariants = {
          default: 'bg-white',
          outlined: 'bg-white border-2 border-gray-200',
          elevated: 'bg-white shadow-lg'
        }

        return (
          <div className={`
            ${baseClasses}
            ${cardVariants[props.variant] || cardVariants.default}
            p-4 rounded-lg min-h-[100px] flex items-center justify-center
          `}>
            {props.children}
          </div>
        )

      default:
        return (
          <div className="p-4 border border-gray-300 rounded bg-white min-h-[60px] flex items-center justify-center text-gray-600">
            {componentName} Preview
          </div>
        )
    }
  }

  return getPreviewElement()
}

export default ComponentCanvas