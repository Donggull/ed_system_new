'use client'

import { createClient } from '@supabase/supabase-js'
import { User } from '@/types/database'

// 협업 기능 관련 타입 정의
export interface TeamWorkspace {
  id: string
  name: string
  description?: string
  owner_id: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface WorkspaceMember {
  id: string
  workspace_id: string
  user_id: string
  role: 'owner' | 'admin' | 'editor' | 'viewer'
  joined_at: string
}

export interface Comment {
  id: string
  theme_id: string
  user_id: string
  content: string
  position?: { x: number; y: number }
  component_id?: string
  parent_id?: string
  is_resolved: boolean
  created_at: string
  updated_at: string
  user?: User
  replies?: Comment[]
}

export interface ChangeRequest {
  id: string
  theme_id: string
  requested_by: string
  title: string
  description: string
  changes: any
  status: 'pending' | 'approved' | 'rejected'
  reviewed_by?: string
  reviewed_at?: string
  review_comment?: string
  created_at: string
  requester?: User
  reviewer?: User
}

export interface LiveCursor {
  user_id: string
  user_name: string
  user_avatar?: string
  x: number
  y: number
  updated_at: string
}

// 협업 서비스 클래스
export class CollaborationService {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // 팀 워크스페이스 관리
  async createWorkspace(name: string, description?: string): Promise<TeamWorkspace | null> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await this.supabase
        .from('team_workspaces')
        .insert({
          name,
          description,
          owner_id: user.id,
          is_active: true
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Failed to create workspace:', error)
      return null
    }
  }

  async getWorkspaces(): Promise<TeamWorkspace[]> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await this.supabase
        .from('workspace_members')
        .select(`
          workspace:team_workspaces(*)
        `)
        .eq('user_id', user.id)

      if (error) throw error
      return data.map((item: any) => item.workspace).filter(Boolean)
    } catch (error) {
      console.error('Failed to get workspaces:', error)
      return []
    }
  }

  async inviteToWorkspace(workspaceId: string, email: string, role: WorkspaceMember['role'] = 'editor'): Promise<boolean> {
    try {
      // 실제로는 이메일 초대 시스템을 구현해야 함
      // 여기서는 간단한 데이터베이스 초대 레코드 생성
      const { error } = await this.supabase
        .from('workspace_invites')
        .insert({
          workspace_id: workspaceId,
          email,
          role,
          status: 'pending'
        })

      return !error
    } catch (error) {
      console.error('Failed to invite user:', error)
      return false
    }
  }

  // 댓글 및 피드백 시스템
  async addComment(themeId: string, content: string, position?: { x: number; y: number }, componentId?: string): Promise<Comment | null> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await this.supabase
        .from('theme_comments')
        .insert({
          theme_id: themeId,
          user_id: user.id,
          content,
          position,
          component_id: componentId,
          is_resolved: false
        })
        .select(`
          *,
          user:users(*)
        `)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Failed to add comment:', error)
      return null
    }
  }

  async getComments(themeId: string): Promise<Comment[]> {
    try {
      const { data, error } = await this.supabase
        .from('theme_comments')
        .select(`
          *,
          user:users(*),
          replies:theme_comments!parent_id(
            *,
            user:users(*)
          )
        `)
        .eq('theme_id', themeId)
        .is('parent_id', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Failed to get comments:', error)
      return []
    }
  }

  async resolveComment(commentId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('theme_comments')
        .update({ is_resolved: true })
        .eq('id', commentId)

      return !error
    } catch (error) {
      console.error('Failed to resolve comment:', error)
      return false
    }
  }

  // 변경 사항 승인 워크플로우
  async createChangeRequest(themeId: string, title: string, description: string, changes: any): Promise<ChangeRequest | null> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await this.supabase
        .from('change_requests')
        .insert({
          theme_id: themeId,
          requested_by: user.id,
          title,
          description,
          changes,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Failed to create change request:', error)
      return null
    }
  }

  async getChangeRequests(themeId: string): Promise<ChangeRequest[]> {
    try {
      const { data, error } = await this.supabase
        .from('change_requests')
        .select(`
          *,
          requester:users!requested_by(*),
          reviewer:users!reviewed_by(*)
        `)
        .eq('theme_id', themeId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Failed to get change requests:', error)
      return []
    }
  }

  async reviewChangeRequest(requestId: string, status: 'approved' | 'rejected', comment?: string): Promise<boolean> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await this.supabase
        .from('change_requests')
        .update({
          status,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          review_comment: comment
        })
        .eq('id', requestId)

      return !error
    } catch (error) {
      console.error('Failed to review change request:', error)
      return false
    }
  }

  // 실시간 협업 기능
  async updateCursor(themeId: string, x: number, y: number): Promise<void> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) return

      await this.supabase
        .from('live_cursors')
        .upsert({
          theme_id: themeId,
          user_id: user.id,
          x,
          y,
          updated_at: new Date().toISOString()
        })
    } catch (error) {
      console.error('Failed to update cursor:', error)
    }
  }

  subscribeToLiveCursors(themeId: string, callback: (cursors: LiveCursor[]) => void) {
    return this.supabase
      .channel(`live-cursors-${themeId}`)
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'live_cursors',
          filter: `theme_id=eq.${themeId}`
        },
        async () => {
          // 커서 데이터 다시 로드
          const { data } = await this.supabase
            .from('live_cursors')
            .select(`
              *,
              user:users(full_name, avatar_url)
            `)
            .eq('theme_id', themeId)
            .gte('updated_at', new Date(Date.now() - 30000).toISOString()) // 30초 이내

          if (data) {
            const cursors: LiveCursor[] = data.map((cursor: any) => ({
              user_id: cursor.user_id,
              user_name: cursor.user?.full_name || 'Anonymous',
              user_avatar: cursor.user?.avatar_url,
              x: cursor.x,
              y: cursor.y,
              updated_at: cursor.updated_at
            }))
            callback(cursors)
          }
        }
      )
      .subscribe()
  }

  subscribeToComments(themeId: string, callback: (comments: Comment[]) => void) {
    return this.supabase
      .channel(`comments-${themeId}`)
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'theme_comments',
          filter: `theme_id=eq.${themeId}`
        },
        async () => {
          const comments = await this.getComments(themeId)
          callback(comments)
        }
      )
      .subscribe()
  }

  // 워크스페이스 권한 확인
  async checkWorkspacePermission(workspaceId: string, requiredRole: WorkspaceMember['role'] = 'viewer'): Promise<boolean> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) return false

      const { data, error } = await this.supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)
        .single()

      if (error || !data) return false

      const roleHierarchy = {
        viewer: 0,
        editor: 1,
        admin: 2,
        owner: 3
      }

      return roleHierarchy[data.role as WorkspaceMember['role']] >= roleHierarchy[requiredRole]
    } catch (error) {
      console.error('Failed to check permission:', error)
      return false
    }
  }
}

export const collaborationService = new CollaborationService()