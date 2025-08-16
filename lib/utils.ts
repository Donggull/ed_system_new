import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 파일명을 안전하게 생성하는 함수
 */
export function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * 컴포넌트명을 PascalCase로 변환하는 함수
 */
export function toPascalCase(str: string): string {
  return str
    .replace(/[-_\s]+/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase())
    .replace(/\s/g, '')
}

/**
 * ZIP 파일을 생성하기 위한 파일 구조 타입
 */
export interface FileStructure {
  name: string
  content: string
  path?: string
}

/**
 * 컴포넌트 파일들을 ZIP 구조로 변환하는 함수
 */
export function createComponentFileStructure(
  componentName: string,
  componentCode: string,
  themeName: string
): FileStructure[] {
  const fileName = sanitizeFileName(componentName)
  const componentDisplayName = toPascalCase(componentName)
  
  return [
    {
      name: `${componentDisplayName}.tsx`,
      content: componentCode,
      path: `components/ui/${fileName}`
    },
    {
      name: `${componentDisplayName}.stories.tsx`,
      content: generateStorybookStory(componentDisplayName, componentCode),
      path: `stories/${fileName}`
    },
    {
      name: `index.ts`,
      content: `export { default as ${componentDisplayName} } from './${componentDisplayName}'`,
      path: `components/ui/${fileName}`
    }
  ]
}

/**
 * Storybook 스토리를 생성하는 함수
 */
export function generateStorybookStory(componentName: string, componentCode: string): string {
  const propsInterface = extractPropsInterface(componentCode)
  const defaultArgs = generateDefaultArgs(propsInterface)
  
  return `import type { Meta, StoryObj } from '@storybook/react'
import ${componentName} from './${componentName}'

const meta: Meta<typeof ${componentName}> = {
  title: 'Components/${componentName}',
  component: ${componentName},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    ${generateArgTypes(propsInterface)}
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    ${defaultArgs}
  },
}

export const Playground: Story = {
  args: {
    ${defaultArgs}
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground for ${componentName} component',
      },
    },
  },
}`
}

/**
 * 컴포넌트 코드에서 Props 인터페이스를 추출하는 함수
 */
function extractPropsInterface(componentCode: string): Record<string, any> {
  const interfaceMatch = componentCode.match(/interface\s+\w*Props[^{]*\{([^}]+)\}/s)
  if (!interfaceMatch) return {}
  
  const propsText = interfaceMatch[1]
  const props: Record<string, any> = {}
  
  const propMatches = propsText.matchAll(/(\w+)(\?)?:\s*([^;]+);?/g)
  for (const match of propMatches) {
    const [, propName, optional, propType] = match
    props[propName] = {
      type: propType.trim(),
      optional: !!optional
    }
  }
  
  return props
}

/**
 * Props를 기반으로 기본 args를 생성하는 함수
 */
function generateDefaultArgs(props: Record<string, any>): string {
  const args: string[] = []
  
  Object.entries(props).forEach(([propName, propInfo]) => {
    const { type, optional } = propInfo
    
    if (type.includes('React.ReactNode') || type.includes('children')) {
      args.push(`${propName}: '${propName.charAt(0).toUpperCase() + propName.slice(1)} Content'`)
    } else if (type.includes('string')) {
      if (propName.includes('variant')) {
        args.push(`${propName}: 'primary'`)
      } else if (propName.includes('size')) {
        args.push(`${propName}: 'md'`)
      } else {
        args.push(`${propName}: 'Sample ${propName}'`)
      }
    } else if (type.includes('boolean')) {
      args.push(`${propName}: false`)
    } else if (type.includes('number')) {
      args.push(`${propName}: 0`)
    }
  })
  
  return args.join(',\n    ')
}

/**
 * Storybook argTypes를 생성하는 함수
 */
function generateArgTypes(props: Record<string, any>): string {
  const argTypes: string[] = []
  
  Object.entries(props).forEach(([propName, propInfo]) => {
    const { type } = propInfo
    
    if (type.includes("'primary'") || type.includes("'secondary'")) {
      const options = extractStringLiteralTypes(type)
      argTypes.push(`${propName}: {
      control: { type: 'select' },
      options: [${options.map(opt => `'${opt}'`).join(', ')}],
    }`)
    } else if (type.includes('boolean')) {
      argTypes.push(`${propName}: {
      control: { type: 'boolean' },
    }`)
    } else if (type.includes('number')) {
      argTypes.push(`${propName}: {
      control: { type: 'number' },
    }`)
    } else if (type.includes('string') && !type.includes('React.ReactNode')) {
      argTypes.push(`${propName}: {
      control: { type: 'text' },
    }`)
    }
  })
  
  return argTypes.join(',\n    ')
}

/**
 * 문자열 리터럴 타입에서 옵션들을 추출하는 함수
 */
function extractStringLiteralTypes(typeString: string): string[] {
  const matches = typeString.match(/'([^']+)'/g)
  return matches ? matches.map(match => match.slice(1, -1)) : []
}

/**
 * 테마 데이터를 TailwindCSS 설정으로 변환하는 함수
 */
export function generateTailwindConfig(themeName: string, themeData: any): string {
  return `/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        ${generateColorConfig(themeData.colors)}
      },
      borderRadius: {
        ${generateBorderRadiusConfig(themeData.borderRadius)}
      },
      fontSize: {
        ${generateFontSizeConfig(themeData.typography?.fontSize)}
      },
      fontFamily: {
        ${generateFontFamilyConfig(themeData.typography?.fontFamily)}
      },
      spacing: {
        ${generateSpacingConfig(themeData.spacing)}
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}`
}

function generateColorConfig(colors: any): string {
  if (!colors) return ''
  
  const colorEntries = Object.entries(colors).map(([colorName, palette]) => {
    if (typeof palette === 'object' && palette !== null) {
      const shades = Object.entries(palette as Record<string, string>)
        .map(([shade, value]) => `"${shade}": "${value}"`)
        .join(',\n          ')
      return `${colorName}: {\n          ${shades}\n        }`
    }
    return `${colorName}: "${palette}"`
  })
  
  return colorEntries.join(',\n        ')
}

function generateBorderRadiusConfig(borderRadius: any): string {
  if (!borderRadius) return ''
  
  return Object.entries(borderRadius)
    .map(([key, value]) => `"${key}": "${value}"`)
    .join(',\n        ')
}

function generateFontSizeConfig(fontSize: any): string {
  if (!fontSize) return ''
  
  return Object.entries(fontSize)
    .map(([key, value]) => `"${key}": "${value}"`)
    .join(',\n        ')
}

function generateFontFamilyConfig(fontFamily: any): string {
  if (!fontFamily) return ''
  
  return Object.entries(fontFamily)
    .map(([key, value]) => `"${key}": [${(value as string[]).map(font => `"${font}"`).join(', ')}]`)
    .join(',\n        ')
}

function generateSpacingConfig(spacing: any): string {
  if (!spacing) return ''
  
  return Object.entries(spacing)
    .map(([key, value]) => `"${key}": "${value}"`)
    .join(',\n        ')
}

/**
 * 패키지 json을 생성하는 함수
 */
export function generatePackageJson(projectName: string, themeName: string): string {
  const packageName = sanitizeFileName(`${projectName}-${themeName}`)
  
  return JSON.stringify({
    name: packageName,
    version: "1.0.0",
    description: `Design system components generated from ${themeName} theme`,
    main: "index.js",
    scripts: {
      "build": "tsc",
      "storybook": "storybook dev -p 6006",
      "build-storybook": "storybook build"
    },
    dependencies: {
      "react": "^18.2.0",
      "@types/react": "^18.2.0",
      "clsx": "^2.0.0",
      "tailwind-merge": "^1.14.0"
    },
    devDependencies: {
      "typescript": "^5.0.0",
      "tailwindcss": "^3.3.0",
      "@storybook/react": "^7.0.0",
      "@storybook/addon-essentials": "^7.0.0"
    },
    keywords: ["design-system", "react", "tailwindcss", "components"],
    author: "Design System Generator",
    license: "MIT"
  }, null, 2)
}

/**
 * README.md를 생성하는 함수
 */
export function generateReadme(projectName: string, themeName: string, componentNames: string[]): string {
  return `# ${projectName} - ${themeName} Design System

This design system was automatically generated using the Design System Generator.

## Components

${componentNames.map(name => `- ${toPascalCase(name)}`).join('\n')}

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

\`\`\`tsx
import { Button, Input, Card } from './components/ui'

function App() {
  return (
    <div>
      <Button variant="primary">Click me</Button>
      <Input placeholder="Enter text" />
      <Card>
        <Card.Header>
          <h2>Card Title</h2>
        </Card.Header>
        <Card.Content>
          <p>Card content goes here</p>
        </Card.Content>
      </Card>
    </div>
  )
}
\`\`\`

## Storybook

Run Storybook to see all components:

\`\`\`bash
npm run storybook
\`\`\`

## Theme

This design system uses the following theme configuration:

- **Primary Color**: Based on your theme's primary color palette
- **Typography**: Custom font families and sizes
- **Spacing**: Consistent spacing scale
- **Border Radius**: Unified border radius values

## Customization

You can customize the theme by modifying the \`tailwind.config.js\` file.

---

Generated with [Design System Generator](https://your-app-url.com)
`
}