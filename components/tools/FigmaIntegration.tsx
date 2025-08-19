'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { DesignToolsService, FigmaPluginConfig, DesignToken } from '@/lib/tools/design-tools-service'
import { cn } from '@/lib/utils'

interface FigmaIntegrationProps {
  tokens: DesignToken[]
  className?: string
  onSync?: (success: boolean) => void
}

export default function FigmaIntegration({ tokens, className, onSync }: FigmaIntegrationProps) {
  const [config, setConfig] = useState<FigmaPluginConfig>({
    isConnected: false
  })
  const [apiKey, setApiKey] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [pluginCode, setPluginCode] = useState('')
  const [showPluginCode, setShowPluginCode] = useState(false)

  useEffect(() => {
    // 저장된 설정 불러오기
    const savedConfig = localStorage.getItem('figma-config')
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig)
        setConfig(parsed)
        setApiKey(parsed.apiKey || '')
      } catch (error) {
        console.error('Failed to load Figma config:', error)
      }
    }
  }, [])

  useEffect(() => {
    // 플러그인 코드 생성
    if (tokens.length > 0) {
      const code = DesignToolsService.generateFigmaPluginCode(tokens)
      setPluginCode(code)
    }
  }, [tokens])

  const handleConnect = async () => {
    if (!apiKey.trim()) {
      alert('API 키를 입력해주세요.')
      return
    }

    setIsConnecting(true)
    try {
      const newConfig = await DesignToolsService.connectToFigma(apiKey)
      setConfig(newConfig)
      
      // 설정 저장
      localStorage.setItem('figma-config', JSON.stringify(newConfig))
      
      if (newConfig.isConnected) {
        alert('Figma에 성공적으로 연결되었습니다!')
      } else {
        alert('Figma 연결에 실패했습니다. API 키를 확인해주세요.')
      }
    } catch (error) {
      console.error('Figma connection failed:', error)
      alert('연결 중 오류가 발생했습니다.')
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    setConfig({ isConnected: false })
    setApiKey('')
    localStorage.removeItem('figma-config')
    alert('Figma 연결이 해제되었습니다.')
  }

  const handleSync = async () => {
    if (!config.isConnected) {
      alert('먼저 Figma에 연결해주세요.')
      return
    }

    setIsSyncing(true)
    setSyncStatus('idle')
    
    try {
      const success = await DesignToolsService.syncToFigma(config, tokens)
      setSyncStatus(success ? 'success' : 'error')
      onSync?.(success)
      
      if (success) {
        alert('디자인 토큰이 Figma에 성공적으로 동기화되었습니다!')
      } else {
        alert('동기화에 실패했습니다.')
      }
    } catch (error) {
      console.error('Figma sync failed:', error)
      setSyncStatus('error')
      onSync?.(false)
      alert('동기화 중 오류가 발생했습니다.')
    } finally {
      setIsSyncing(false)
    }
  }

  const copyPluginCode = async () => {
    try {
      await navigator.clipboard.writeText(pluginCode)
      alert('플러그인 코드가 클립보드에 복사되었습니다!')
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  const downloadPluginCode = () => {
    const blob = new Blob([pluginCode], { type: 'text/javascript' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'figma-design-tokens-plugin.js'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200', className)}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900">🎨 Figma 연동</h3>
            <div className={cn(
              'w-2 h-2 rounded-full',
              config.isConnected ? 'bg-green-400' : 'bg-gray-300'
            )} />
            <span className="text-sm text-gray-500">
              {config.isConnected ? '연결됨' : '연결 안됨'}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 연결 설정 */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Figma 연결 설정</h4>
          
          {!config.isConnected ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Figma Personal Access Token
                </label>
                <div className="flex space-x-2">
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="figd_..."
                  />
                  <button
                    onClick={handleConnect}
                    disabled={isConnecting || !apiKey.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isConnecting ? '연결 중...' : '연결'}
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Figma → Account settings → Personal access tokens에서 토큰을 생성하세요.
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h5 className="font-medium text-blue-900 mb-2">토큰 생성 방법</h5>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Figma에 로그인한 후 Settings으로 이동</li>
                  <li>Personal access tokens 섹션에서 &ldquo;Generate new token&rdquo; 클릭</li>
                  <li>토큰 이름을 입력하고 적절한 권한 선택</li>
                  <li>생성된 토큰을 복사하여 여기에 입력</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-green-800 font-medium">Figma에 연결됨</span>
              </div>
              <button
                onClick={handleDisconnect}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-700"
              >
                연결 해제
              </button>
            </div>
          )}
        </div>

        {/* 동기화 */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">토큰 동기화</h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">디자인 토큰 → Figma Styles</div>
                <div className="text-sm text-gray-600">
                  {tokens.length}개의 토큰을 Figma 스타일로 변환하여 동기화합니다.
                </div>
              </div>
              <button
                onClick={handleSync}
                disabled={!config.isConnected || isSyncing || tokens.length === 0}
                className={cn(
                  'px-4 py-2 rounded-md font-medium transition-colors',
                  syncStatus === 'success' ? 'bg-green-100 text-green-700' :
                  syncStatus === 'error' ? 'bg-red-100 text-red-700' :
                  'bg-blue-600 text-white hover:bg-blue-700',
                  (!config.isConnected || isSyncing || tokens.length === 0) && 'opacity-50 cursor-not-allowed'
                )}
              >
                {isSyncing ? '동기화 중...' : 
                 syncStatus === 'success' ? '동기화 완료' :
                 syncStatus === 'error' ? '동기화 실패' : '동기화'}
              </button>
            </div>

            {/* 동기화될 토큰 미리보기 */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h5 className="font-medium text-gray-900 mb-2">동기화될 토큰</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex justify-between">
                  <span>색상 토큰:</span>
                  <span className="font-medium">
                    {tokens.filter(t => t.type === 'color').length}개
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>타이포그래피:</span>
                  <span className="font-medium">
                    {tokens.filter(t => t.type === 'typography').length}개
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>간격/기타:</span>
                  <span className="font-medium">
                    {tokens.filter(t => !['color', 'typography'].includes(t.type)).length}개
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 플러그인 코드 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Figma 플러그인 코드</h4>
            <button
              onClick={() => setShowPluginCode(!showPluginCode)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {showPluginCode ? '숨기기' : '보기'}
            </button>
          </div>

          {showPluginCode && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                아래 코드를 Figma 플러그인으로 실행하여 수동으로 디자인 토큰을 적용할 수 있습니다.
              </p>
              
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-64 text-sm">
                  <code>{pluginCode}</code>
                </pre>
                <div className="absolute top-2 right-2 flex space-x-2">
                  <button
                    onClick={copyPluginCode}
                    className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
                  >
                    복사
                  </button>
                  <button
                    onClick={downloadPluginCode}
                    className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
                  >
                    다운로드
                  </button>
                </div>
              </div>

              <div className="p-3 bg-yellow-50 rounded-lg">
                <h5 className="font-medium text-yellow-900 mb-1">사용 방법</h5>
                <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
                  <li>Figma에서 Plugins → Development → New Plugin 선택</li>
                  <li>위 코드를 플러그인 파일에 붙여넣기</li>
                  <li>플러그인을 실행하여 디자인 토큰 적용</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* 도움말 */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h5 className="font-medium text-blue-900 mb-2">Figma 연동 기능</h5>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 색상 토큰을 Figma Color Styles로 변환</li>
            <li>• 타이포그래피 토큰을 Text Styles로 적용</li>
            <li>• 디자인 시스템 일관성 유지</li>
            <li>• 실시간 동기화로 항상 최신 상태 유지</li>
          </ul>
        </div>
      </div>
    </div>
  )
}