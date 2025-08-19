'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { DesignToolsService, DesignToken } from '@/lib/tools/design-tools-service'
import { ThemeData } from '@/types/database'
import { cn } from '@/lib/utils'

interface DesignTokenConverterProps {
  theme: ThemeData
  className?: string
  onExport?: (format: string, content: string) => void
}

export default function DesignTokenConverter({ theme, className, onExport }: DesignTokenConverterProps) {
  const [tokens, setTokens] = useState<DesignToken[]>([])
  const [selectedFormat, setSelectedFormat] = useState<'json' | 'css' | 'scss' | 'js'>('json')
  const [filteredTokens, setFilteredTokens] = useState<DesignToken[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [generatedCode, setGeneratedCode] = useState('')

  useEffect(() => {
    const designTokens = DesignToolsService.convertThemeToTokens(theme)
    setTokens(designTokens)
    setFilteredTokens(designTokens)
  }, [theme])

  useEffect(() => {
    let filtered = tokens

    // 카테고리 필터
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(token => token.category === selectedCategory)
    }

    // 검색 필터
    if (searchTerm) {
      filtered = filtered.filter(token => 
        token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredTokens(filtered)
  }, [tokens, selectedCategory, searchTerm])

  const generateJavaScript = useCallback((tokens: DesignToken[]): string => {
    const grouped = tokens.reduce((acc, token) => {
      if (!acc[token.category]) {
        acc[token.category] = {}
      }
      acc[token.category][token.name] = token.value
      return acc
    }, {} as Record<string, any>)

    return `// Design Tokens
export const tokens = ${JSON.stringify(grouped, null, 2)}

// Token getter utility
export const getToken = (path) => {
  return path.split('.').reduce((obj, key) => obj?.[key], tokens)
}

// CSS variable generator
export const getCSSVar = (tokenName) => {
  return \`var(--\${tokenName})\`
}`
  }, [])

  const generateCode = useCallback(() => {
    let code = ''
    
    switch (selectedFormat) {
      case 'json':
        code = DesignToolsService.exportTokensAsJSON(filteredTokens)
        break
      case 'css':
        code = DesignToolsService.exportTokensAsCSS(filteredTokens)
        break
      case 'scss':
        code = DesignToolsService.exportTokensAsSCSS(filteredTokens)
        break
      case 'js':
        code = generateJavaScript(filteredTokens)
        break
    }
    
    setGeneratedCode(code)
  }, [filteredTokens, selectedFormat, generateJavaScript])

  useEffect(() => {
    generateCode()
  }, [generateCode])

  const handleExport = () => {
    onExport?.(selectedFormat, generatedCode)
    
    // 파일 다운로드
    const filename = `design-tokens.${selectedFormat === 'js' ? 'js' : selectedFormat}`
    const blob = new Blob([generatedCode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode)
      alert('클립보드에 복사되었습니다!')
    } catch (error) {
      console.error('복사 실패:', error)
    }
  }

  const categories = ['all', ...new Set(tokens.map(token => token.category))]
  const formats = [
    { value: 'json', label: 'JSON', description: '표준 JSON 형식' },
    { value: 'css', label: 'CSS Variables', description: 'CSS 커스텀 속성' },
    { value: 'scss', label: 'SCSS Variables', description: 'Sass 변수' },
    { value: 'js', label: 'JavaScript', description: 'JS 객체 및 유틸리티' },
  ]

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200', className)}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">🔄 디자인 토큰 변환기</h3>
          <span className="text-sm text-gray-500">{filteredTokens.length}개 토큰</span>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 토큰 목록 및 필터 */}
          <div className="space-y-4">
            {/* 필터 */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  검색
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="토큰 이름 또는 값 검색..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  카테고리
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? '전체' : category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 토큰 목록 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">토큰 목록</h4>
              <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredTokens.map((token, index) => (
                  <div key={index} className="p-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-sm text-gray-900 truncate">
                          {token.name}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm text-gray-600">{token.value}</span>
                          {token.type === 'color' && (
                            <div
                              className="w-4 h-4 border border-gray-300 rounded"
                              style={{ backgroundColor: token.value }}
                            />
                          )}
                        </div>
                        {token.description && (
                          <div className="text-xs text-gray-500 mt-1">
                            {token.description}
                          </div>
                        )}
                      </div>
                      <span className={cn(
                        'px-2 py-0.5 text-xs font-medium rounded-full ml-2',
                        token.type === 'color' ? 'bg-red-100 text-red-700' :
                        token.type === 'spacing' ? 'bg-blue-100 text-blue-700' :
                        token.type === 'typography' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      )}>
                        {token.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 변환 결과 */}
          <div className="space-y-4">
            {/* 형식 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                출력 형식
              </label>
              <div className="grid grid-cols-2 gap-2">
                {formats.map(format => (
                  <button
                    key={format.value}
                    onClick={() => setSelectedFormat(format.value as any)}
                    className={cn(
                      'p-3 text-left border rounded-lg transition-colors',
                      selectedFormat === format.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div className="font-medium text-sm">{format.label}</div>
                    <div className="text-xs text-gray-500">{format.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 생성된 코드 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  생성된 코드
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={copyToClipboard}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    복사
                  </button>
                  <button
                    onClick={handleExport}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    다운로드
                  </button>
                </div>
              </div>
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-96 text-sm">
                  <code>{generatedCode}</code>
                </pre>
              </div>
            </div>

            {/* 사용법 예시 */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h5 className="font-medium text-blue-900 mb-2">사용법 예시</h5>
              <div className="text-sm text-blue-800 space-y-1">
                {selectedFormat === 'css' && (
                  <>
                    <div>CSS에서: <code className="bg-blue-100 px-1 rounded">color: var(--color-primary-500);</code></div>
                    <div>HTML에서: <code className="bg-blue-100 px-1 rounded">style=&ldquo;color: var(--color-primary-500)&rdquo;</code></div>
                  </>
                )}
                {selectedFormat === 'scss' && (
                  <>
                    <div>SCSS에서: <code className="bg-blue-100 px-1 rounded">color: $color-primary-500;</code></div>
                    <div>믹스인: <code className="bg-blue-100 px-1 rounded">@include font-size($font-size-lg);</code></div>
                  </>
                )}
                {selectedFormat === 'js' && (
                  <>
                    <div>Import: <code className="bg-blue-100 px-1 rounded">import {`{ tokens }`} from &ldquo;./tokens&rdquo;</code></div>
                    <div>사용: <code className="bg-blue-100 px-1 rounded">tokens.colors[&lsquo;color-primary-500&rsquo;]</code></div>
                  </>
                )}
                {selectedFormat === 'json' && (
                  <>
                    <div>JSON 파일로 저장하여 다른 도구에서 활용</div>
                    <div>Style Dictionary, Figma Tokens 등과 호환</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}