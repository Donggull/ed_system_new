import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    console.log('🔍 DEBUG: 회원가입 디버깅 시작')
    console.log('  이메일:', email)
    console.log('  비밀번호 길이:', password?.length)

    // 환경변수 확인
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    console.log('🔍 DEBUG: 환경변수 상태')
    console.log('  NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'SET' : 'NOT SET')
    console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'SET' : 'NOT SET')
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        success: false,
        error: 'Supabase 환경변수가 설정되지 않았습니다',
        debug: {
          url: supabaseUrl ? 'SET' : 'NOT SET',
          key: supabaseAnonKey ? 'SET' : 'NOT SET'
        }
      }, { status: 500 })
    }

    // 새로운 Supabase 클라이언트 생성 (서버 사이드에서)
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
    console.log('🔍 DEBUG: Supabase 클라이언트 생성 완료')

    // 회원가입 시도
    console.log('🔍 DEBUG: 회원가입 시도 중...')
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/auth/callback`,
        data: {
          email: email,
          full_name: email.split('@')[0]
        }
      }
    })

    console.log('🔍 DEBUG: 회원가입 결과')
    console.log('  Data:', data)
    console.log('  Error:', error)

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        errorCode: error.status,
        debug: {
          errorDetails: error,
          timestamp: new Date().toISOString()
        }
      }, { status: 400 })
    }

    // 성공 시 상세 정보 반환
    const result = {
      success: true,
      debug: {
        userId: data.user?.id,
        email: data.user?.email,
        emailConfirmed: data.user?.email_confirmed_at,
        needsEmailConfirmation: !data.user?.email_confirmed_at,
        sessionCreated: !!data.session,
        timestamp: new Date().toISOString(),
        redirectUrl: `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/auth/callback`
      }
    }

    console.log('✅ DEBUG: 회원가입 성공:', result)
    return NextResponse.json(result)

  } catch (error: any) {
    console.error('🚨 DEBUG: 예외 발생:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
      debug: {
        stack: error.stack,
        timestamp: new Date().toISOString()
      }
    }, { status: 500 })
  }
}

export async function GET() {
  // 환경 상태 확인
  const debug = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_URL: process.env.VERCEL_URL,
    },
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
      urlValue: process.env.NEXT_PUBLIC_SUPABASE_URL,
    }
  }

  return NextResponse.json({
    success: true,
    message: '회원가입 디버깅 엔드포인트',
    debug
  })
}