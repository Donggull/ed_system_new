import { useState, useCallback } from 'react'
import { ComponentTemplate } from '@/types/database'
import { CodeGenerator, CodeGenerationOptions, GeneratedFile, createZipFile } from '@/lib/code-generator'

export interface ExportProgress {
  step: string
  progress: number
  total: number
}

export interface ExportResult {
  success: boolean
  files: GeneratedFile[]
  downloadUrl?: string
  error?: string
}

export function useCodeExport() {
  const [isExporting, setIsExporting] = useState(false)
  const [progress, setProgress] = useState<ExportProgress | null>(null)
  const [lastExportResult, setLastExportResult] = useState<ExportResult | null>(null)

  const exportCode = useCallback(async (
    selectedComponents: ComponentTemplate[],
    theme: any,
    options: CodeGenerationOptions,
    projectName: string = 'design-system'
  ): Promise<ExportResult> => {
    setIsExporting(true)
    setProgress({ step: 'Initializing...', progress: 0, total: 100 })

    try {
      // 1. 코드 생성기 초기화
      setProgress({ step: 'Setting up code generator...', progress: 10, total: 100 })
      const generator = new CodeGenerator(theme, options)

      // 2. 컴포넌트 코드 생성
      setProgress({ step: 'Generating component code...', progress: 30, total: 100 })
      const files = generator.generateAll(selectedComponents, projectName)

      // 3. 파일 검증
      setProgress({ step: 'Validating generated files...', progress: 70, total: 100 })
      if (files.length === 0) {
        throw new Error('No files were generated')
      }

      // 4. 완료
      setProgress({ step: 'Export completed!', progress: 100, total: 100 })
      
      const result: ExportResult = {
        success: true,
        files
      }

      setLastExportResult(result)
      return result

    } catch (error) {
      const result: ExportResult = {
        success: false,
        files: [],
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }

      setLastExportResult(result)
      return result

    } finally {
      setIsExporting(false)
      setTimeout(() => setProgress(null), 2000)
    }
  }, [])

  const downloadAsZip = useCallback(async (
    files: GeneratedFile[],
    fileName: string = 'design-system'
  ): Promise<string> => {
    try {
      const zipBlob = await createZipFile(files, fileName)
      const url = URL.createObjectURL(zipBlob)
      
      // 자동 다운로드 트리거
      const link = document.createElement('a')
      link.href = url
      link.download = `${fileName}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      return url
    } catch (error) {
      throw new Error('Failed to create ZIP file')
    }
  }, [])

  const copyToClipboard = useCallback(async (content: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(content)
      return true
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = content
      document.body.appendChild(textArea)
      textArea.select()
      const success = document.execCommand('copy')
      document.body.removeChild(textArea)
      return success
    }
  }, [])

  const exportToGitHub = useCallback(async (
    files: GeneratedFile[],
    repoName: string,
    description: string = 'Generated design system'
  ): Promise<string> => {
    // GitHub API 연동 (실제 구현에서는 GitHub App 또는 Personal Access Token 필요)
    throw new Error('GitHub export is not implemented yet. Please download ZIP and manually upload to GitHub.')
  }, [])

  const exportAsNPMPackage = useCallback(async (
    files: GeneratedFile[],
    packageName: string
  ): Promise<ExportResult> => {
    // NPM 패키지 형태로 구조 조정
    const npmFiles = files.map(file => ({
      ...file,
      path: file.path.startsWith('src/') ? file.path : `src/${file.path}`
    }))

    // package.json 업데이트
    const packageJsonFile = npmFiles.find(f => f.path.includes('package.json'))
    if (packageJsonFile) {
      const packageJson = JSON.parse(packageJsonFile.content)
      packageJson.name = packageName
      packageJson.private = false
      packageJson.publishConfig = {
        access: 'public'
      }
      packageJsonFile.content = JSON.stringify(packageJson, null, 2)
    }

    // .npmignore 추가
    npmFiles.push({
      path: '.npmignore',
      content: `*.test.*
*.stories.*
.storybook/
node_modules/
dist/
build/
coverage/
.env*
*.log`,
      type: 'config'
    })

    return {
      success: true,
      files: npmFiles
    }
  }, [])

  const generateDocumentation = useCallback((
    selectedComponents: ComponentTemplate[],
    projectName: string
  ): GeneratedFile[] => {
    const docs: GeneratedFile[] = []

    // 메인 문서
    docs.push({
      path: 'docs/README.md',
      content: `# ${projectName} Documentation

## Quick Start Guide

This design system provides a collection of reusable components built with modern web technologies.

### Installation

\`\`\`bash
npm install ${projectName.toLowerCase().replace(/\s+/g, '-')}
\`\`\`

### Basic Usage

\`\`\`jsx
import { Button, Card, Input } from '${projectName.toLowerCase().replace(/\s+/g, '-')}'

function App() {
  return (
    <Card>
      <Input placeholder="Enter your name" />
      <Button variant="primary">Submit</Button>
    </Card>
  )
}
\`\`\`

## Components Overview

${selectedComponents.map(comp => `- [${comp.name}](./components/${comp.name}.md)`).join('\n')}

## Design Tokens

- [Color Palette](./design-tokens/colors.md)
- [Typography](./design-tokens/typography.md)
- [Spacing](./design-tokens/spacing.md)
`,
      type: 'doc'
    })

    // 각 컴포넌트별 문서
    selectedComponents.forEach(component => {
      docs.push({
        path: `docs/components/${component.name}.md`,
        content: `# ${component.name}

${component.description || 'Component description'}

## Usage

\`\`\`jsx
import { ${component.name} } from '${projectName.toLowerCase().replace(/\s+/g, '-')}'

function Example() {
  return (
    <${component.name}>
      ${component.name} content
    </${component.name}>
  )
}
\`\`\`

## Props

${Object.entries(component.props_schema || {}).map(([key, prop]: [string, any]) => 
  `### ${key}

- **Type:** \`${prop.type}\`
- **Required:** ${prop.required ? 'Yes' : 'No'}
- **Default:** \`${JSON.stringify(prop.default)}\`
${prop.options ? `- **Options:** ${prop.options.map((opt: string) => `\`${opt}\``).join(', ')}` : ''}

${prop.description || 'Property description'}
`).join('\n')}

## Examples

${Object.entries(component.props_schema || {}).filter(([, prop]: [string, any]) => prop.options).map(([key, prop]: [string, any]) => 
  prop.options.map((option: string) => 
    `### ${option.charAt(0).toUpperCase() + option.slice(1)} ${component.name}

\`\`\`jsx
<${component.name} ${key}="${option}">
  ${option} ${component.name}
</${component.name}>
\`\`\`
`).join('\n')
).join('\n')}
`,
        type: 'doc'
      })
    })

    return docs
  }, [])

  return {
    isExporting,
    progress,
    lastExportResult,
    exportCode,
    downloadAsZip,
    copyToClipboard,
    exportToGitHub,
    exportAsNPMPackage,
    generateDocumentation
  }
}