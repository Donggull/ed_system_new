'use client'

import React, { useState, useEffect } from 'react'
import { collaborationService, TeamWorkspace as TeamWorkspaceType, WorkspaceMember } from '@/lib/collaboration/collaboration-service'
import { cn } from '@/lib/utils'

interface TeamWorkspaceProps {
  className?: string
  onWorkspaceSelect?: (workspace: TeamWorkspaceType) => void
}

export default function TeamWorkspace({ className, onWorkspaceSelect }: TeamWorkspaceProps) {
  const [workspaces, setWorkspaces] = useState<TeamWorkspaceType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showInviteForm, setShowInviteForm] = useState<string | null>(null)
  const [newWorkspace, setNewWorkspace] = useState({ name: '', description: '' })
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<WorkspaceMember['role']>('editor')

  useEffect(() => {
    loadWorkspaces()
  }, [])

  const loadWorkspaces = async () => {
    setIsLoading(true)
    try {
      const data = await collaborationService.getWorkspaces()
      setWorkspaces(data)
    } catch (error) {
      console.error('Failed to load workspaces:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newWorkspace.name.trim()) return

    try {
      const workspace = await collaborationService.createWorkspace(
        newWorkspace.name,
        newWorkspace.description
      )
      
      if (workspace) {
        setWorkspaces(prev => [workspace, ...prev])
        setNewWorkspace({ name: '', description: '' })
        setShowCreateForm(false)
      }
    } catch (error) {
      console.error('Failed to create workspace:', error)
    }
  }

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim() || !showInviteForm) return

    try {
      const success = await collaborationService.inviteToWorkspace(
        showInviteForm,
        inviteEmail,
        inviteRole
      )
      
      if (success) {
        setInviteEmail('')
        setShowInviteForm(null)
        alert('초대를 보냈습니다!')
      } else {
        alert('초대 전송에 실패했습니다.')
      }
    } catch (error) {
      console.error('Failed to invite user:', error)
      alert('초대 전송 중 오류가 발생했습니다.')
    }
  }

  if (isLoading) {
    return (
      <div className={cn('bg-white rounded-lg border border-gray-200 p-6', className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200', className)}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">👥 팀 워크스페이스</h3>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm font-medium"
          >
            + 새 워크스페이스
          </button>
        </div>
      </div>

      {/* 새 워크스페이스 생성 폼 */}
      {showCreateForm && (
        <div className="p-6 bg-blue-50 border-b border-gray-200">
          <form onSubmit={handleCreateWorkspace} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                워크스페이스 이름
              </label>
              <input
                type="text"
                value={newWorkspace.name}
                onChange={(e) => setNewWorkspace(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="예: Design Team"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                설명 (선택사항)
              </label>
              <textarea
                value={newWorkspace.description}
                onChange={(e) => setNewWorkspace(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="워크스페이스에 대한 간단한 설명"
                rows={2}
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                생성
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 초대 폼 */}
      {showInviteForm && (
        <div className="p-6 bg-green-50 border-b border-gray-200">
          <form onSubmit={handleInviteUser} className="space-y-4">
            <h4 className="font-medium text-gray-900">팀원 초대</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이메일 주소
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="user@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                권한
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as WorkspaceMember['role'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="viewer">뷰어 - 보기만 가능</option>
                <option value="editor">에디터 - 편집 가능</option>
                <option value="admin">관리자 - 모든 권한</option>
              </select>
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                초대 보내기
              </button>
              <button
                type="button"
                onClick={() => setShowInviteForm(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 워크스페이스 목록 */}
      <div className="p-6">
        {workspaces.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">👥</div>
            <p>아직 워크스페이스가 없습니다.</p>
            <p className="text-sm">새 워크스페이스를 생성하여 팀과 함께 작업하세요.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {workspaces.map((workspace) => (
              <div
                key={workspace.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{workspace.name}</h4>
                    {workspace.description && (
                      <p className="text-sm text-gray-600 mt-1">{workspace.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      생성일: {new Date(workspace.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowInviteForm(workspace.id)}
                      className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      초대
                    </button>
                    <button
                      onClick={() => onWorkspaceSelect?.(workspace)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      선택
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}