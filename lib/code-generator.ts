import { ComponentTemplate } from '@/types/database'

export interface CodeGenerationOptions {
  framework: 'react' | 'vue' | 'html'
  language: 'typescript' | 'javascript'
  includeStorybook: boolean
  includeTests: boolean
  cssFramework: 'tailwind' | 'css-modules' | 'styled-components'
}

export interface GeneratedFile {
  path: string
  content: string
  type: 'component' | 'style' | 'type' | 'story' | 'test' | 'config' | 'doc'
}

export class CodeGenerator {
  private theme: any
  private options: CodeGenerationOptions

  constructor(theme: any, options: CodeGenerationOptions) {
    this.theme = theme
    this.options = options
  }

  // 테마를 CSS 변수로 변환
  generateThemeCSS(): string {
    const { colors, typography, spacing, borderRadius, shadows } = this.theme

    let css = ':root {\n'
    
    // 색상 변수
    if (colors && typeof colors === 'object' && colors !== null) {
      Object.entries(colors as Record<string, any>).forEach(([name, colorValue]) => {
        if (typeof colorValue === 'string') {
          // 단일 색상값을 HSL로 변환
          css += `  --color-${name}: ${this.hexToHsl(colorValue as string)};\n`
        } else if (typeof colorValue === 'object') {
          // 색상 팔레트 (예: primary-50, primary-100, ...)
          Object.entries(colorValue).forEach(([shade, value]) => {
            css += `  --color-${name}-${shade}: ${this.hexToHsl(value as string)};\n`
          })
        }
      })
    }

    // 타이포그래피 변수
    if (typography && typeof typography === 'object' && typography !== null) {
      if ((typography as any).fontFamily) {
        css += `  --font-family: ${(typography as any).fontFamily};\n`
      }
      if ((typography as any).fontSize) {
        Object.entries((typography as any).fontSize).forEach(([size, value]) => {
          css += `  --font-size-${size}: ${value};\n`
        })
      }
      if ((typography as any).fontWeight) {
        Object.entries((typography as any).fontWeight).forEach(([weight, value]) => {
          css += `  --font-weight-${weight}: ${value};\n`
        })
      }
      if ((typography as any).lineHeight) {
        Object.entries((typography as any).lineHeight).forEach(([height, value]) => {
          css += `  --line-height-${height}: ${value};\n`
        })
      }
    }

    // 간격 변수
    if (spacing && typeof spacing === 'object' && spacing !== null) {
      Object.entries(spacing as Record<string, any>).forEach(([size, value]) => {
        css += `  --spacing-${size}: ${value};\n`
      })
    }

    // 보더 반경 변수
    if (borderRadius && typeof borderRadius === 'object' && borderRadius !== null) {
      Object.entries(borderRadius as Record<string, any>).forEach(([size, value]) => {
        css += `  --border-radius-${size}: ${value};\n`
      })
    }

    // 그림자 변수
    if (shadows && typeof shadows === 'object' && shadows !== null) {
      Object.entries(shadows as Record<string, any>).forEach(([size, value]) => {
        css += `  --shadow-${size}: ${value};\n`
      })
    }

    css += '}\n'
    return css
  }

  // HEX를 HSL로 변환
  private hexToHsl(hex: string): string {
    // 간단한 HEX to HSL 변환 (실제로는 더 정교한 변환 필요)
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return hex

    const r = parseInt(result[1], 16) / 255
    const g = parseInt(result[2], 16) / 255
    const b = parseInt(result[3], 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (max === min) {
      h = s = 0 // achromatic
    } else {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
  }

  // React 컴포넌트 생성
  generateReactComponent(template: ComponentTemplate): string {
    const { language } = this.options
    const isTS = language === 'typescript'
    const ext = isTS ? 'tsx' : 'jsx'

    let component = template.template_code

    // TypeScript 타입 정의 추가
    if (isTS && template.props_schema) {
      const propsInterface = this.generatePropsInterface(template)
      component = component.replace(
        'interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>',
        propsInterface
      )
    }

    return component
  }

  // Vue 컴포넌트 생성
  generateVueComponent(template: ComponentTemplate): string {
    const componentName = template.name
    const props = template.props_schema || {}

    return `<template>
  <div class="${componentName.toLowerCase()}">
    <!-- Vue implementation for ${componentName} -->
    <slot />
  </div>
</template>

<script${this.options.language === 'typescript' ? ' lang="ts"' : ''}>
import { defineComponent } from 'vue'

export default defineComponent({
  name: '${componentName}',
  props: {
    ${Object.entries(props).map(([key, prop]: [string, any]) => 
      `${key}: {\n      type: ${this.getVueType(prop.type)},\n      default: ${JSON.stringify(prop.default)}\n    }`
    ).join(',\n    ')}
  }
})
</script>

<style scoped>
.${componentName.toLowerCase()} {
  /* Component styles using CSS variables */
}
</style>`
  }

  // HTML + CSS 컴포넌트 생성
  generateHTMLComponent(template: ComponentTemplate): { html: string, css: string } {
    const componentName = template.name.toLowerCase()
    
    const html = `<!-- ${template.name} Component -->
<div class="${componentName}">
  <div class="${componentName}__content">
    ${template.description || 'Component content'}
  </div>
</div>`

    const css = `.${componentName} {
  /* Base styles using CSS variables */
  font-family: var(--font-family);
  border-radius: var(--border-radius-md);
}

.${componentName}__content {
  padding: var(--spacing-md);
  color: hsl(var(--color-primary-500));
}`

    return { html, css }
  }

  // TypeScript 인터페이스 생성
  private generatePropsInterface(template: ComponentTemplate): string {
    const props = template.props_schema || {}
    const interfaceName = `${template.name}Props`
    
    let propsInterface = `interface ${interfaceName} {\n`
    
    Object.entries(props).forEach(([key, prop]: [string, any]) => {
      const optional = prop.required ? '' : '?'
      const type = this.getTSType(prop.type)
      propsInterface += `  ${key}${optional}: ${type}\n`
    })
    
    propsInterface += '}'
    return propsInterface
  }

  // TypeScript 타입 매핑
  private getTSType(type: string): string {
    const typeMap: Record<string, string> = {
      'string': 'string',
      'number': 'number',
      'boolean': 'boolean',
      'array': 'any[]',
      'object': 'Record<string, any>'
    }
    return typeMap[type] || 'any'
  }

  // Vue 타입 매핑
  private getVueType(type: string): string {
    const typeMap: Record<string, string> = {
      'string': 'String',
      'number': 'Number',
      'boolean': 'Boolean',
      'array': 'Array',
      'object': 'Object'
    }
    return typeMap[type] || 'String'
  }

  // Storybook 스토리 생성
  generateStorybook(template: ComponentTemplate): string {
    const componentName = template.name
    const props = template.props_schema || {}

    return `import type { Meta, StoryObj } from '@storybook/react'
import { ${componentName} } from './${componentName}'

const meta: Meta<typeof ${componentName}> = {
  title: 'Components/${componentName}',
  component: ${componentName},
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '${template.description || `${componentName} component from the design system.`}'
      }
    }
  },
  argTypes: {
    ${Object.entries(props).map(([key, prop]: [string, any]) => {
      const argType = prop.options ? 
        `{\n      control: { type: 'select' },\n      options: ${JSON.stringify(prop.options)}\n    }` :
        `{\n      control: { type: '${this.getStorybookControlType(prop.type)}' }\n    }`
      return `${key}: ${argType}`
    }).join(',\n    ')}
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    ${Object.entries(props).map(([key, prop]: [string, any]) => 
      `${key}: ${JSON.stringify(prop.default)}`
    ).join(',\n    ')}
  }
}

${Object.entries(props).filter(([, prop]: [string, any]) => prop.options).map(([key, prop]: [string, any]) => 
  prop.options.map((option: string) => 
    `export const ${option.charAt(0).toUpperCase() + option.slice(1)}: Story = {
  args: {
    ...Default.args,
    ${key}: '${option}'
  }
}`
  ).join('\n\n')
).join('\n\n')}`
  }

  // Storybook 컨트롤 타입 매핑
  private getStorybookControlType(type: string): string {
    const typeMap: Record<string, string> = {
      'string': 'text',
      'number': 'number',
      'boolean': 'boolean'
    }
    return typeMap[type] || 'text'
  }

  // 컴포넌트 테스트 생성
  generateTest(template: ComponentTemplate): string {
    const componentName = template.name

    return `import { render, screen } from '@testing-library/react'
import { ${componentName} } from './${componentName}'

describe('${componentName}', () => {
  it('renders without crashing', () => {
    render(<${componentName}>${componentName}</${componentName}>)
    expect(screen.getByText('${componentName}')).toBeInTheDocument()
  })

  ${Object.entries(template.props_schema || {}).map(([key, prop]: [string, any]) => 
    prop.options ? prop.options.map((option: string) => 
      `it('renders with ${key} ${option}', () => {
    render(<${componentName} ${key}="${option}">${componentName}</${componentName}>)
    expect(screen.getByText('${componentName}')).toHaveClass('${option}')
  })`
    ).join('\n\n  ') : ''
  ).join('\n\n  ')}
})`
  }

  // package.json 생성
  generatePackageJson(projectName: string): string {
    return JSON.stringify({
      name: projectName.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      description: 'Generated design system components',
      main: 'index.js',
      scripts: {
        build: 'tsc',
        test: 'jest',
        storybook: 'start-storybook -p 6006',
        'build-storybook': 'build-storybook'
      },
      dependencies: {
        react: '^18.0.0',
        'react-dom': '^18.0.0'
      },
      devDependencies: {
        '@types/react': '^18.0.0',
        '@types/react-dom': '^18.0.0',
        typescript: '^5.0.0',
        '@storybook/react': '^7.0.0',
        '@testing-library/react': '^14.0.0',
        jest: '^29.0.0'
      },
      peerDependencies: {
        react: '>=16.8.0',
        'react-dom': '>=16.8.0'
      }
    }, null, 2)
  }

  // README.md 생성
  generateReadme(projectName: string, components: ComponentTemplate[]): string {
    return `# ${projectName}

Generated design system with ${components.length} components.

## Installation

\`\`\`bash
npm install ${projectName.toLowerCase().replace(/\s+/g, '-')}
\`\`\`

## Usage

\`\`\`jsx
import { ${components.map(c => c.name).join(', ')} } from '${projectName.toLowerCase().replace(/\s+/g, '-')}'

function App() {
  return (
    <div>
      ${components.slice(0, 3).map(c => `<${c.name}>${c.name}</${c.name}>`).join('\n      ')}
    </div>
  )
}
\`\`\`

## Components

${components.map(component => `### ${component.name}

${component.description || 'Component description'}

**Props:**

${Object.entries(component.props_schema || {}).map(([key, prop]: [string, any]) => 
  `- \`${key}\` (${prop.type}${prop.required ? ', required' : ', optional'}): ${prop.description || 'Property description'}`
).join('\n')}

`).join('\n')}

## Design Tokens

This design system uses CSS custom properties for theming:

\`\`\`css
:root {
  --color-primary-500: 220 100% 50%;
  --font-family: Inter, system-ui, sans-serif;
  --spacing-md: 1rem;
  --border-radius-md: 0.375rem;
}
\`\`\`

## Development

\`\`\`bash
# Run Storybook
npm run storybook

# Run tests
npm test

# Build package
npm run build
\`\`\`

---

Generated with [Claude Code Design System Generator](https://github.com/Donggull/ed_system_new)
`
  }

  // 전체 코드 생성
  generateAll(selectedComponents: ComponentTemplate[], projectName: string): GeneratedFile[] {
    const files: GeneratedFile[] = []

    // 테마 CSS 파일
    files.push({
      path: 'src/theme.css',
      content: this.generateThemeCSS(),
      type: 'style'
    })

    // 각 컴포넌트 생성
    selectedComponents.forEach(template => {
      const componentName = template.name

      // React 컴포넌트
      if (this.options.framework === 'react') {
        const ext = this.options.language === 'typescript' ? 'tsx' : 'jsx'
        files.push({
          path: `src/components/${componentName}/${componentName}.${ext}`,
          content: this.generateReactComponent(template),
          type: 'component'
        })

        // 인덱스 파일
        files.push({
          path: `src/components/${componentName}/index.ts`,
          content: `export { default } from './${componentName}'\nexport * from './${componentName}'`,
          type: 'component'
        })
      }

      // Vue 컴포넌트
      if (this.options.framework === 'vue') {
        files.push({
          path: `src/components/${componentName}/${componentName}.vue`,
          content: this.generateVueComponent(template),
          type: 'component'
        })
      }

      // HTML + CSS
      if (this.options.framework === 'html') {
        const { html, css } = this.generateHTMLComponent(template)
        files.push({
          path: `src/components/${componentName}/${componentName}.html`,
          content: html,
          type: 'component'
        })
        files.push({
          path: `src/components/${componentName}/${componentName}.css`,
          content: css,
          type: 'style'
        })
      }

      // Storybook 스토리
      if (this.options.includeStorybook) {
        files.push({
          path: `src/components/${componentName}/${componentName}.stories.${this.options.language === 'typescript' ? 'ts' : 'js'}`,
          content: this.generateStorybook(template),
          type: 'story'
        })
      }

      // 테스트 파일
      if (this.options.includeTests) {
        files.push({
          path: `src/components/${componentName}/${componentName}.test.${this.options.language === 'typescript' ? 'tsx' : 'jsx'}`,
          content: this.generateTest(template),
          type: 'test'
        })
      }
    })

    // 메인 인덱스 파일
    const mainIndex = selectedComponents.map(c => 
      `export { default as ${c.name} } from './components/${c.name}'`
    ).join('\n')
    
    files.push({
      path: 'src/index.ts',
      content: mainIndex,
      type: 'component'
    })

    // package.json
    files.push({
      path: 'package.json',
      content: this.generatePackageJson(projectName),
      type: 'config'
    })

    // README.md
    files.push({
      path: 'README.md',
      content: this.generateReadme(projectName, selectedComponents),
      type: 'doc'
    })

    // TypeScript 설정
    if (this.options.language === 'typescript') {
      files.push({
        path: 'tsconfig.json',
        content: JSON.stringify({
          compilerOptions: {
            target: 'es5',
            lib: ['dom', 'dom.iterable', 'es6'],
            allowJs: true,
            skipLibCheck: true,
            esModuleInterop: true,
            allowSyntheticDefaultImports: true,
            strict: true,
            forceConsistentCasingInFileNames: true,
            moduleResolution: 'node',
            resolveJsonModule: true,
            isolatedModules: true,
            noEmit: true,
            jsx: 'react-jsx'
          },
          include: ['src']
        }, null, 2),
        type: 'config'
      })
    }

    return files
  }
}

// ZIP 파일 생성을 위한 유틸리티
export async function createZipFile(files: GeneratedFile[], fileName: string): Promise<Blob> {
  try {
    // 동적 import로 JSZip 로드 (클라이언트 사이드에서만 실행)
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()

    // 각 파일을 ZIP에 추가
    files.forEach(file => {
      zip.file(file.path, file.content)
    })

    // ZIP 파일 생성
    const zipBlob = await zip.generateAsync({ 
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6
      }
    })

    return zipBlob
  } catch (error) {
    console.error('Failed to create ZIP file:', error)
    // Fallback: 텍스트 파일로 생성
    const zipContent = files.map(file => 
      `=== ${file.path} ===\n${file.content}\n\n`
    ).join('\n')
    
    return new Blob([zipContent], { type: 'text/plain' })
  }
}