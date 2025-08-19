'use client'

import React, { useState, useEffect, useRef } from 'react'
import { collaborationService, Comment, LiveCursor } from '@/lib/collaboration/collaboration-service'
import { cn } from '@/lib/utils'

interface CommentSystemProps {
  themeId: string
  isEnabled: boolean
  className?: string
}

export default function CommentSystem({ themeId, isEnabled, className }: CommentSystemProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [showCommentForm, setShowCommentForm] = useState<{ x: number; y: number } | null>(null)
  const [newComment, setNewComment] = useState('')
  const [liveCursors, setLiveCursors] = useState<LiveCursor[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const subscriptionRef = useRef<any>(null)
  const cursorSubscriptionRef = useRef<any>(null)

  useEffect(() => {
    if (isEnabled && themeId) {
      loadComments()
      setupSubscriptions()
    }

    return () => {
      cleanupSubscriptions()
    }
  }, [themeId, isEnabled])

  const loadComments = async () => {
    setIsLoading(true)
    try {
      const data = await collaborationService.getComments(themeId)
      setComments(data)
    } catch (error) {
      console.error('Failed to load comments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const setupSubscriptions = () => {
    // 댓글 실시간 구독
    subscriptionRef.current = collaborationService.subscribeToComments(themeId, (updatedComments) => {
      setComments(updatedComments)
    })

    // 실시간 커서 구독
    cursorSubscriptionRef.current = collaborationService.subscribeToLiveCursors(themeId, (cursors) => {
      setLiveCursors(cursors)
    })
  }

  const cleanupSubscriptions = () => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe()
    }
    if (cursorSubscriptionRef.current) {
      cursorSubscriptionRef.current.unsubscribe()
    }
  }

  const handleContainerClick = (e: React.MouseEvent) => {
    if (!isEnabled) return

    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setShowCommentForm({ x, y })
  }

  const handleMouseMove = async (e: React.MouseEvent) => {
    if (!isEnabled) return

    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // 실시간 커서 위치 업데이트 (throttle 적용)
    await collaborationService.updateCursor(themeId, x, y)
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !showCommentForm) return

    try {
      const comment = await collaborationService.addComment(
        themeId,
        newComment,
        showCommentForm
      )

      if (comment) {
        setComments(prev => [comment, ...prev])
        setNewComment('')
        setShowCommentForm(null)
      }
    } catch (error) {
      console.error('Failed to add comment:', error)
    }
  }

  const handleResolveComment = async (commentId: string) => {
    try {
      const success = await collaborationService.resolveComment(commentId)
      if (success) {
        setComments(prev => 
          prev.map(comment => 
            comment.id === commentId 
              ? { ...comment, is_resolved: true }
              : comment
          )
        )
      }
    } catch (error) {
      console.error('Failed to resolve comment:', error)
    }
  }

  if (!isEnabled) {
    return (
      <div className={cn('relative', className)}>
        <div className="absolute inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center rounded-lg">
          <div className="bg-white px-4 py-2 rounded-md shadow-md text-sm text-gray-600">
            💬 협업 모드를 활성화하여 댓글 기능을 사용하세요
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('relative', className)}>
      {/* 실시간 커서 */}
      {liveCursors.map(cursor => (
        <div
          key={cursor.user_id}
          className="absolute pointer-events-none z-50"
          style={{
            left: cursor.x,
            top: cursor.y,
            transform: 'translate(-2px, -2px)'
          }}
        >
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
            <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
              {cursor.user_name}
            </div>
          </div>
        </div>
      ))}

      {/* 댓글 마커들 */}
      {comments.map(comment => (
        comment.position && (
          <div
            key={comment.id}
            className={cn(
              'absolute z-40 w-6 h-6 rounded-full border-2 border-white shadow-lg cursor-pointer transform -translate-x-3 -translate-y-3',
              comment.is_resolved ? 'bg-green-500' : 'bg-yellow-500'
            )}
            style={{
              left: comment.position.x,
              top: comment.position.y
            }}
            title={comment.content}
          >
            <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
              💬
            </div>
          </div>
        )
      ))}

      {/* 댓글 입력 폼 */}
      {showCommentForm && (
        <div
          className="absolute z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-80"
          style={{
            left: showCommentForm.x,
            top: showCommentForm.y
          }}
        >
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">새 댓글 추가</h4>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="댓글을 입력하세요..."
              rows={3}
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowCommentForm(null)}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                취소
              </button>
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                댓글 추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 메인 컨테이너 - 클릭 이벤트와 마우스 추적 */}
      <div
        ref={containerRef}
        className="w-full h-full min-h-[400px]"
        onClick={handleContainerClick}
        onMouseMove={handleMouseMove}
      >
        {/* 실제 콘텐츠는 여기에 들어감 */}
        <div className="p-6 bg-gray-50 rounded-lg h-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">💬 협업 공간</h3>
            <span className="text-sm text-gray-500">
              클릭하여 댓글 추가 · {comments.length}개 댓글
            </span>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-gray-600 mb-2">실시간 협업 기능이 활성화되었습니다.</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• 화면을 클릭하여 댓글을 추가할 수 있습니다</li>
                <li>• 다른 사용자의 실시간 커서를 볼 수 있습니다</li>
                <li>• 댓글에 답글을 달고 해결 표시를 할 수 있습니다</li>
              </ul>
            </div>

            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <span className="text-sm text-gray-600">댓글을 불러오는 중...</span>
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">최근 댓글</h4>
                {comments.slice(0, 5).map(comment => (
                  <div key={comment.id} className="bg-white p-3 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm text-gray-900">
                            {comment.user?.full_name || 'Anonymous'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.created_at).toLocaleString()}
                          </span>
                          {comment.is_resolved && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                              해결됨
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700">{comment.content}</p>
                      </div>
                      {!comment.is_resolved && (
                        <button
                          onClick={() => handleResolveComment(comment.id)}
                          className="text-xs text-green-600 hover:text-green-700 ml-2"
                        >
                          해결
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-2xl mb-2">💬</div>
                <p>아직 댓글이 없습니다.</p>
                <p className="text-sm">화면을 클릭하여 첫 댓글을 추가해보세요.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}