'use client'

import { useState } from 'react'
import { signIn, signUp, resetPassword } from '@/lib/supabase/auth'
import { useRouter } from 'next/navigation'

interface AuthFormProps {
  mode?: 'signin' | 'signup' | 'reset'
  onModeChange?: (mode: 'signin' | 'signup' | 'reset') => void
}

export default function AuthForm({ mode = 'signin', onModeChange }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (mode === 'signin') {
        await signIn({ email, password })
        router.push('/')
      } else if (mode === 'signup') {
        if (password !== confirmPassword) {
          throw new Error('비밀번호가 일치하지 않습니다.')
        }
        await signUp({ email, password })
        setMessage('회원가입 완료! 이메일을 확인해주세요.')
      } else if (mode === 'reset') {
        await resetPassword(email)
        setMessage('비밀번호 재설정 이메일을 발송했습니다.')
      }
    } catch (err: any) {
      setError(err.message || '오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const getTitle = () => {
    switch (mode) {
      case 'signin': return '로그인'
      case 'signup': return '회원가입'
      case 'reset': return '비밀번호 재설정'
    }
  }

  const getButtonText = () => {
    switch (mode) {
      case 'signin': return '로그인'
      case 'signup': return '회원가입'
      case 'reset': return '재설정 이메일 발송'
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 shadow-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-xl font-bold">DS</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{getTitle()}</h1>
          <p className="text-sm text-gray-600 mt-2">DesignSystem에 오신 것을 환영합니다</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              이메일
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all hover:border-gray-300"
              required
            />
          </div>

          {mode !== 'reset' && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all hover:border-gray-300"
                required
                minLength={6}
              />
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호 확인
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="비밀번호를 다시 입력하세요"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all hover:border-gray-300"
                required
                minLength={6}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '처리 중...' : getButtonText()}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          {mode === 'signin' && (
            <>
              <button
                onClick={() => onModeChange?.('reset')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                비밀번호를 잊으셨나요?
              </button>
              <div>
                <span className="text-sm text-gray-600">계정이 없으신가요? </span>
                <button
                  onClick={() => onModeChange?.('signup')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  회원가입
                </button>
              </div>
            </>
          )}

          {mode === 'signup' && (
            <div>
              <span className="text-sm text-gray-600">이미 계정이 있으신가요? </span>
              <button
                onClick={() => onModeChange?.('signin')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                로그인
              </button>
            </div>
          )}

          {mode === 'reset' && (
            <button
              onClick={() => onModeChange?.('signin')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              로그인으로 돌아가기
            </button>
          )}
        </div>
      </div>
    </div>
  )
}