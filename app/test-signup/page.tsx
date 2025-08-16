'use client'

import { useState } from 'react'

export default function TestSignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testSignup = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/debug-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()
      setResult(data)
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message,
        debug: { fetchError: true }
      })
    } finally {
      setLoading(false)
    }
  }

  const checkEnvironment = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/debug-signup')
      const data = await response.json()
      setResult(data)
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message,
        debug: { fetchError: true }
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🧪 회원가입 테스트</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">환경 상태 확인</h2>
          <button
            onClick={checkEnvironment}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '확인 중...' : '환경 상태 확인'}
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">회원가입 테스트</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="최소 6자"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <button
              onClick={testSignup}
              disabled={loading || !email || !password}
              className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '테스트 중...' : '회원가입 테스트'}
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">결과</h2>
            <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="font-medium mb-2">
                {result.success ? '✅ 성공' : '❌ 실패'}
              </div>
              
              {result.error && (
                <div className="text-red-700 mb-2">
                  <strong>오류:</strong> {result.error}
                </div>
              )}
              
              {result.debug && (
                <div className="mt-4">
                  <strong>디버그 정보:</strong>
                  <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto">
                    {JSON.stringify(result.debug, null, 2)}
                  </pre>
                </div>
              )}
              
              <div className="mt-4">
                <strong>전체 응답:</strong>
                <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}