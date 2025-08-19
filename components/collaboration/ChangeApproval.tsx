'use client'

import React, { useState, useEffect } from 'react'
import { collaborationService, ChangeRequest } from '@/lib/collaboration/collaboration-service'
import { ThemeData } from '@/types/database'
import { cn } from '@/lib/utils'

interface ChangeApprovalProps {
  themeId: string
  currentTheme: ThemeData
  onThemeUpdate?: (theme: Partial<ThemeData>) => void
  className?: string
}

export default function ChangeApproval({ 
  themeId, 
  currentTheme, 
  onThemeUpdate, 
  className 
}: ChangeApprovalProps) {
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    changes: {}
  })
  const [selectedChanges, setSelectedChanges] = useState<any>({})

  useEffect(() => {
    if (themeId) {
      loadChangeRequests()
    }
  }, [themeId])

  const loadChangeRequests = async () => {
    setIsLoading(true)
    try {
      const data = await collaborationService.getChangeRequests(themeId)
      setChangeRequests(data)
    } catch (error) {
      console.error('Failed to load change requests:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRequest.title.trim()) return

    try {
      const request = await collaborationService.createChangeRequest(
        themeId,
        newRequest.title,
        newRequest.description,
        selectedChanges
      )

      if (request) {
        setChangeRequests(prev => [request, ...prev])
        setNewRequest({ title: '', description: '', changes: {} })
        setSelectedChanges({})
        setShowCreateForm(false)
      }
    } catch (error) {
      console.error('Failed to create change request:', error)
    }
  }

  const handleReviewRequest = async (requestId: string, status: 'approved' | 'rejected', comment?: string) => {
    try {
      const success = await collaborationService.reviewChangeRequest(requestId, status, comment)
      
      if (success) {
        setChangeRequests(prev =>
          prev.map(req =>
            req.id === requestId
              ? { ...req, status, review_comment: comment, reviewed_at: new Date().toISOString() }
              : req
          )
        )

        // 승인된 변경 사항 적용
        if (status === 'approved') {
          const request = changeRequests.find(req => req.id === requestId)
          if (request && onThemeUpdate) {
            onThemeUpdate(request.changes)
          }
        }
      }
    } catch (error) {
      console.error('Failed to review change request:', error)
    }
  }

  const handleColorChange = (path: string, value: string) => {
    const pathArray = path.split('.')
    const updatedChanges = { ...selectedChanges }
    
    // Deep set using path
    let current = updatedChanges
    for (let i = 0; i < pathArray.length - 1; i++) {
      if (!current[pathArray[i]]) {
        current[pathArray[i]] = {}
      }
      current = current[pathArray[i]]
    }
    current[pathArray[pathArray.length - 1]] = value
    
    setSelectedChanges(updatedChanges)
  }

  const renderChangePreview = (changes: any) => {
    if (!changes || Object.keys(changes).length === 0) {
      return <span className="text-gray-500 text-sm">변경 사항 없음</span>
    }

    return (
      <div className="space-y-2">
        {changes.colors && (
          <div>
            <h5 className="font-medium text-sm text-gray-900">색상 변경</h5>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(changes.colors).map(([colorType, palette]: [string, any]) => (
                <div key={colorType}>
                  <span className="font-medium">{colorType}:</span>
                  <div className="flex space-x-1 mt-1">
                    {Object.entries(palette).slice(0, 3).map(([shade, color]: [string, any]) => (
                      <div
                        key={shade}
                        className="w-4 h-4 rounded border border-gray-200"
                        style={{ backgroundColor: color }}
                        title={`${shade}: ${color}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {changes.typography && (
          <div>
            <h5 className="font-medium text-sm text-gray-900">타이포그래피 변경</h5>
            <p className="text-xs text-gray-600">
              폰트, 크기 등 {Object.keys(changes.typography).length}개 항목
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200', className)}>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">🔄 변경 승인 워크플로우</h3>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-3 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 text-sm font-medium"
          >
            + 변경 요청
          </button>
        </div>
      </div>

      {/* 새 변경 요청 폼 */}
      {showCreateForm && (
        <div className="p-6 bg-purple-50 border-b border-gray-200">
          <form onSubmit={handleCreateRequest} className="space-y-4">
            <h4 className="font-medium text-gray-900">새 변경 요청</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                제목
              </label>
              <input
                type="text"
                value={newRequest.title}
                onChange={(e) => setNewRequest(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="예: Primary 색상 변경 제안"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                설명
              </label>
              <textarea
                value={newRequest.description}
                onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="변경이 필요한 이유와 기대 효과를 설명해주세요"
                rows={3}
              />
            </div>

            {/* 간단한 색상 변경 인터페이스 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                제안할 색상 변경
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Primary 500</label>
                  <div className="flex space-x-2">
                    <div
                      className="w-8 h-8 rounded border border-gray-200"
                      style={{ backgroundColor: currentTheme.colors.primary['500'] }}
                      title="현재 색상"
                    />
                    <span className="self-center text-sm">→</span>
                    <input
                      type="color"
                      value={selectedChanges?.colors?.primary?.['500'] || currentTheme.colors.primary['500']}
                      onChange={(e) => handleColorChange('colors.primary.500', e.target.value)}
                      className="w-8 h-8 rounded border border-gray-200"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Secondary 500</label>
                  <div className="flex space-x-2">
                    <div
                      className="w-8 h-8 rounded border border-gray-200"
                      style={{ backgroundColor: currentTheme.colors.secondary['500'] }}
                      title="현재 색상"
                    />
                    <span className="self-center text-sm">→</span>
                    <input
                      type="color"
                      value={selectedChanges?.colors?.secondary?.['500'] || currentTheme.colors.secondary['500']}
                      onChange={(e) => handleColorChange('colors.secondary.500', e.target.value)}
                      className="w-8 h-8 rounded border border-gray-200"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                요청 제출
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

      {/* 변경 요청 목록 */}
      <div className="p-6">
        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
            <span className="text-sm text-gray-600">변경 요청을 불러오는 중...</span>
          </div>
        ) : changeRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🔄</div>
            <p>아직 변경 요청이 없습니다.</p>
            <p className="text-sm">새 변경 요청을 생성하여 팀과 협업하세요.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {changeRequests.map((request) => (
              <div
                key={request.id}
                className={cn(
                  'border rounded-lg p-4',
                  request.status === 'pending' ? 'border-yellow-200 bg-yellow-50' :
                  request.status === 'approved' ? 'border-green-200 bg-green-50' :
                  'border-red-200 bg-red-50'
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900">{request.title}</h4>
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      )}>
                        {request.status === 'pending' ? '대기 중' :
                         request.status === 'approved' ? '승인됨' : '거부됨'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{request.description}</p>
                    <div className="text-xs text-gray-500">
                      요청자: {request.requester?.full_name || 'Unknown'} · 
                      {new Date(request.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* 변경 사항 미리보기 */}
                <div className="mb-3 p-3 bg-white rounded border border-gray-200">
                  <h5 className="font-medium text-sm text-gray-900 mb-2">제안된 변경 사항</h5>
                  {renderChangePreview(request.changes)}
                </div>

                {/* 승인/거부 버튼 (대기 중인 요청만) */}
                {request.status === 'pending' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleReviewRequest(request.id, 'approved')}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      승인
                    </button>
                    <button
                      onClick={() => {
                        const comment = prompt('거부 사유를 입력해주세요:')
                        if (comment !== null) {
                          handleReviewRequest(request.id, 'rejected', comment)
                        }
                      }}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      거부
                    </button>
                  </div>
                )}

                {/* 리뷰 코멘트 (승인/거부된 요청) */}
                {request.status !== 'pending' && request.review_comment && (
                  <div className="mt-3 p-2 bg-gray-100 rounded text-sm">
                    <span className="font-medium">리뷰 코멘트:</span> {request.review_comment}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}