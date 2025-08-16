import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Supabase client not initialized'
      }, { status: 500 })
    }

    const { email, password } = await request.json()

    console.log('🧪 테스트 회원가입 시도:', email)

    // 회원가입 시도
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          email: email,
          full_name: email.split('@')[0]
        }
      }
    })

    if (error) {
      console.error('❌ 회원가입 오류:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      }, { status: 400 })
    }

    // 결과 확인
    const result = {
      success: true,
      user: data.user ? {
        id: data.user.id,
        email: data.user.email,
        email_confirmed_at: data.user.email_confirmed_at,
        created_at: data.user.created_at,
        needs_confirmation: !data.user.email_confirmed_at
      } : null,
      session: data.session ? 'Created' : 'Not created'
    }

    console.log('✅ 회원가입 성공:', result)

    // user_profiles 테이블 확인
    if (data.user) {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      result.profile = profile ? 'Created' : 'Not found'
      if (profileError) {
        result.profile_error = profileError.message
      }
    }

    return NextResponse.json(result)

  } catch (error: any) {
    console.error('🚨 API 오류:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Supabase client not initialized'
      })
    }

    // 현재 사용자 수 확인
    const { count: userCount } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })

    const { count: authCount } = await supabase
      .rpc('get_auth_users_count')
      .single()

    return NextResponse.json({
      success: true,
      user_profiles_count: userCount || 0,
      auth_users_count: authCount || 'Unable to count',
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      user_profiles_count: 0,
      auth_users_count: 0,
      timestamp: new Date().toISOString()
    })
  }
}