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
  if (!supabase) {
    throw new Error('Supabase가 설정되지 않았습니다. .env.local 파일에서 NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 설정해주세요.')
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`
    }
  })

  if (error) throw error
  return data
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
    redirectTo: `${window.location.origin}/auth/reset-password`
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