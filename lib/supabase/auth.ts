import { supabase } from './client'
import { User, AuthError, AuthResponse } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  email_confirmed_at?: string
  created_at: string
}

export interface SignUpData {
  email: string
  password: string
}

export interface SignInData {
  email: string
  password: string
}

// Sign up with email and password
export async function signUp({ email, password }: SignUpData) {
  console.log('🚀 signUp 함수 호출됨:', email)
  console.log('🔧 Supabase 클라이언트 상태:', {
    exists: !!supabase,
    type: typeof supabase
  })
  
  if (!supabase) {
    const errorMsg = 'Supabase가 설정되지 않았습니다. .env.local 파일에서 NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 설정해주세요.'
    console.error('❌', errorMsg)
    throw new Error(errorMsg)
  }

  // 환경변수 재확인
  console.log('🔍 클라이언트 사이드 환경변수:')
  console.log('  URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET')
  console.log('  Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET')

  console.log('🔄 Supabase Auth 회원가입 시작:', email)
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'https://ed-system-new.vercel.app/auth/callback',
        data: {
          email: email,
          full_name: email.split('@')[0] // 기본 이름으로 이메일 앞부분 사용
        }
      }
    })

    console.log('📊 상세 회원가입 결과:')
    console.log('  전체 응답:', { data, error })
    console.log('  사용자 데이터:', data?.user)
    console.log('  세션 데이터:', data?.session)
    console.log('  오류 데이터:', error)

    if (error) {
      console.error('❌ 회원가입 API 오류:', {
        message: error.message,
        status: error.status,
        details: error
      })
      throw error
    }

    // 성공적으로 가입된 경우 사용자 정보 확인
    if (data.user) {
      console.log('✅ 사용자 생성 성공:', {
        id: data.user.id,
        email: data.user.email,
        emailConfirmed: data.user.email_confirmed_at,
        confirmationSentAt: data.user.confirmation_sent_at,
        needsConfirmation: !data.user.email_confirmed_at,
        createdAt: data.user.created_at
      })
      
      // 세션 상태도 확인
      if (data.session) {
        console.log('🔑 세션 생성됨:', {
          accessToken: data.session.access_token ? 'EXISTS' : 'NO TOKEN',
          refreshToken: data.session.refresh_token ? 'EXISTS' : 'NO TOKEN',
          expiresAt: data.session.expires_at
        })
      } else {
        console.log('⚠️ 세션이 생성되지 않음 (이메일 확인 필요할 수 있음)')
      }
    } else {
      console.log('⚠️ 사용자 객체가 없음 - 응답 구조 확인 필요')
    }

    return data
    
  } catch (apiError: any) {
    console.error('🚨 회원가입 API 호출 중 예외 발생:', {
      message: apiError.message,
      stack: apiError.stack,
      name: apiError.name
    })
    throw apiError
  }
}

// Sign in with email and password
export async function signIn({ email, password }: SignInData) {
  if (!supabase) {
    throw new Error('Supabase가 설정되지 않았습니다. .env.local 파일에서 NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 설정해주세요.')
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw error
  return data
}

// Sign out
export async function signOut() {
  if (!supabase) {
    throw new Error('Supabase가 설정되지 않았습니다.')
  }

  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Get current user
export async function getCurrentUser(): Promise<User | null> {
  if (!supabase) {
    return null
  }

  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// Reset password
export async function resetPassword(email: string) {
  if (!supabase) {
    throw new Error('Supabase가 설정되지 않았습니다. .env.local 파일에서 NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 설정해주세요.')
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://ed-system-new.vercel.app/auth/reset-password'
  })

  if (error) throw error
}

// Update password
export async function updatePassword(password: string) {
  if (!supabase) {
    throw new Error('Supabase가 설정되지 않았습니다.')
  }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) throw error
}

// Listen to auth changes
export function onAuthStateChange(callback: (user: User | null) => void) {
  if (!supabase) {
    return { data: { subscription: { unsubscribe: () => {} } } }
  }

  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null)
  })
}