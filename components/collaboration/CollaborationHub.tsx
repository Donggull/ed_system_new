'use client'

import React, { useState } from 'react'
import { ThemeData } from '@/types/database'
import { cn } from '@/lib/utils'
import TeamWorkspace from './TeamWorkspace'
import CommentSystem from './CommentSystem'
import ChangeApproval from './ChangeApproval'

interface CollaborationHubProps {
  themeId: string
  currentTheme: ThemeData
  onThemeUpdate: (theme: Partial<ThemeData>) => void
  className?: string
}

export default function CollaborationHub({ 
  themeId, 
  currentTheme, 
  onThemeUpdate, 
  className 
}: CollaborationHubProps) {
  const [activeTab, setActiveTab] = useState<'workspace' | 'comments' | 'approval'>('workspace')
  const [isCollaborationEnabled, setIsCollaborationEnabled] = useState(false)

  const tabs = [
    { id: 'workspace', label: '팀 워크스페이스', icon: '👥' },
    { id: 'comments', label: '댓글 & 피드백', icon: '💬' },
    { id: 'approval', label: '변경 승인', icon: '🔄' },
  ] as const

  return (
    <div className={cn('bg-gray-50 rounded-lg', className)}>
      {/* 협업 기능 활성화 토글 */}
      <div className="bg-white border-b border-gray-200 rounded-t-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg font-semibold text-gray-900">🤝 협업 기능</h2>
            <span className="text-sm text-gray-500">팀과 함께 디자인 시스템을 개발하세요</span>
          </div>
          <label className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">협업 모드</span>
            <input
              type="checkbox"
              checked={isCollaborationEnabled}
              onChange={(e) => setIsCollaborationEnabled(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      {/* 탭 메뉴 */}
      <div className="border-b border-gray-200 bg-white">
        <div className="flex space-x-1 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              disabled={!isCollaborationEnabled}
              className={cn(
                'flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                !isCollaborationEnabled 
                  ? 'text-gray-400 cursor-not-allowed'
                  : activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              )}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 컨텐츠 영역 */}
      <div className="p-6">
        {!isCollaborationEnabled ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">협업 기능을 활성화하세요</h3>
            <p className="text-gray-600 mb-4 max-w-md mx-auto">
              팀원들과 실시간으로 디자인 시스템을 개발하고 피드백을 주고받을 수 있습니다.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto text-sm">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-2xl mb-2">👥</div>
                <h4 className="font-medium text-gray-900 mb-1">팀 워크스페이스</h4>
                <p className="text-gray-600">팀원 초대 및 권한 관리</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-2xl mb-2">💬</div>
                <h4 className="font-medium text-gray-900 mb-1">실시간 댓글</h4>
                <p className="text-gray-600">즉시 피드백 및 토론</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-2xl mb-2">🔄</div>
                <h4 className="font-medium text-gray-900 mb-1">변경 승인</h4>
                <p className="text-gray-600">체계적인 변경 관리</p>
              </div>
            </div>
            <button
              onClick={() => setIsCollaborationEnabled(true)}
              className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              협업 기능 활성화
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'workspace' && (
              <TeamWorkspace 
                onWorkspaceSelect={(workspace) => {
                  console.log('Selected workspace:', workspace)
                  // 워크스페이스 선택 로직
                }}
              />
            )}
            {activeTab === 'comments' && (
              <CommentSystem 
                themeId={themeId}
                isEnabled={isCollaborationEnabled}
              />
            )}
            {activeTab === 'approval' && (
              <ChangeApproval 
                themeId={themeId}
                currentTheme={currentTheme}
                onThemeUpdate={onThemeUpdate}
              />
            )}
          </>
        )}
      </div>

      {/* 협업 기능 활성화 시 하단 상태 표시 */}
      {isCollaborationEnabled && (
        <div className="bg-blue-50 border-t border-blue-200 p-3 rounded-b-lg">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-blue-700 font-medium">실시간 협업 활성화됨</span>
            </div>
            <div className="text-blue-600">
              <span>연결된 사용자: 1명</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}