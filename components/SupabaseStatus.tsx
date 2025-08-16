'use client'

import { useEffect, useState } from 'react'
import { testSupabaseConnection, getProjectInfo } from '@/lib/supabase/test-connection'

interface ConnectionStatus {
  success: boolean
  error?: string
  message?: string
  details?: any
}

interface ProjectInfo {
  themes: number
  componentTemplates: number
  projects: number
}

export default function SupabaseStatus() {
  const [status, setStatus] = useState<ConnectionStatus | null>(null)
  const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const connectionResult = await testSupabaseConnection()
        setStatus(connectionResult)

        if (connectionResult.success) {
          const info = await getProjectInfo()
          setProjectInfo(info)
        }
      } catch (error) {
        setStatus({
          success: false,
          error: 'Failed to test connection',
          details: error instanceof Error ? error.message : 'Unknown error'
        })
      } finally {
        setLoading(false)
      }
    }

    checkConnection()
  }, [])

  if (loading) {
    return (
      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-600">Supabase 연결 확인 중...</span>
        </div>
      </div>
    )
  }

  if (!status) {
    return null
  }

  return (
    <div className={`p-3 rounded-lg border ${
      status.success 
        ? 'bg-green-50 border-green-200' 
        : 'bg-red-50 border-red-200'
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${
          status.success ? 'bg-green-500' : 'bg-red-500'
        }`}></div>
        <span className={`text-sm font-medium ${
          status.success ? 'text-green-700' : 'text-red-700'
        }`}>
          {status.success ? '✅ Supabase 연결됨' : '❌ Supabase 연결 실패'}
        </span>
      </div>
      
      {status.success && projectInfo && (
        <div className="text-xs text-green-600 space-y-1">
          <div>📊 테마: {projectInfo.themes}개</div>
          <div>🧩 컴포넌트 템플릿: {projectInfo.componentTemplates}개</div>
          <div>📁 프로젝트: {projectInfo.projects}개</div>
        </div>
      )}
      
      {!status.success && (
        <div className="text-xs text-red-600">
          <div>{status.error}</div>
          {status.details && <div className="mt-1 opacity-75">{status.details}</div>}
        </div>
      )}
    </div>
  )
}