'use client'

import { useEffect, useState } from 'react'
import { getThemeTemplates } from '@/lib/supabase/themes'
import { getComponentTemplates } from '@/lib/supabase/components'
import { Theme, ComponentTemplate } from '@/types/database'
import { useAuth } from '@/contexts/AuthContext'
import { signOut } from '@/lib/supabase/auth'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import SupabaseStatus from '@/components/SupabaseStatus'
import { 
  parseThemeJson, 
  generateCssVariables, 
  applyCssVariables, 
  defaultTheme,
  sampleThemes 
} from '@/lib/theme-utils'
import { allComponentTemplates } from '@/lib/component-templates'

export default function Home() {
  const [themeTemplates, setThemeTemplates] = useState<Theme[]>([])
  const [componentTemplates, setComponentTemplates] = useState<ComponentTemplate[]>([])
  const [selectedComponents, setSelectedComponents] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentTheme, setCurrentTheme] = useState(defaultTheme)
  const [jsonInput, setJsonInput] = useState(JSON.stringify(sampleThemes.modern, null, 2))
  const [jsonError, setJsonError] = useState<string | null>(null)
  const { user } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/auth/signin')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const [themes, components] = await Promise.all([
          getThemeTemplates(),
          getComponentTemplates()
        ])
        setThemeTemplates(themes)
        setComponentTemplates(components.length > 0 ? components : allComponentTemplates)
        
        // 필수 컴포넌트 자동 선택
        const essentialComponents = allComponentTemplates
          .filter(template => template.category === 'essential')
          .map(template => template.id)
        setSelectedComponents(essentialComponents)
      } catch (err) {
        console.error('Failed to load data:', err)
        setError('Failed to load data from database')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // JSON 입력 핸들러
  const handleJsonChange = (value: string) => {
    setJsonInput(value)
    const { theme, error } = parseThemeJson(value)
    
    if (error) {
      setJsonError(error)
    } else if (theme) {
      setJsonError(null)
      setCurrentTheme(theme)
      
      // CSS 변수 적용
      const cssVars = generateCssVariables(theme)
      applyCssVariables(cssVars)
    }
  }

  // 컴포넌트 선택 토글
  const toggleComponent = (componentId: string) => {
    setSelectedComponents(prev => 
      prev.includes(componentId)
        ? prev.filter(id => id !== componentId)
        : [...prev, componentId]
    )
  }

  // 템플릿 로드
  const loadSampleTheme = (themeName: keyof typeof sampleThemes) => {
    const themeJson = JSON.stringify(sampleThemes[themeName], null, 2)
    handleJsonChange(themeJson)
  }

  // 선택된 컴포넌트 템플릿 가져오기
  const getSelectedTemplates = () => {
    return allComponentTemplates.filter(template => 
      selectedComponents.includes(template.id)
    )
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        {/* Left Sidebar - JSON Editor & Component Selection */}
        <div className="w-96 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 overflow-y-auto shadow-sm">
          {/* Header */}
          <div className="p-6 border-b border-gray-200/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm font-bold">DS</span>
                </div>
                <div>
                  <h1 className="text-base font-bold text-gray-900">DesignSystem</h1>
                  <p className="text-xs text-gray-500 font-medium">테마 기반 컴포넌트 생성기</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-gray-600">
                  {user?.email}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="로그아웃"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* 샘플 테마 버튼 */}
          <div className="p-4 border-b border-gray-200/50">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">빠른 테마 적용</h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => loadSampleTheme('modern')}
                className="p-2 text-xs rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                모던
              </button>
              <button
                onClick={() => loadSampleTheme('dark')}
                className="p-2 text-xs rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
              >
                다크
              </button>
              <button
                onClick={() => loadSampleTheme('minimal')}
                className="p-2 text-xs rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
              >
                미니멀
              </button>
            </div>
          </div>

          {/* JSON 입력 */}
          <div className="p-4 border-b border-gray-200/50">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">JSON 테마 설정</h3>
            <div className="relative">
              <textarea
                value={jsonInput}
                onChange={(e) => handleJsonChange(e.target.value)}
                className="w-full h-64 p-3 text-xs font-mono rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="JSON 테마를 입력하세요..."
              />
              {jsonError && (
                <div className="mt-2 text-xs text-red-500">
                  ❌ {jsonError}
                </div>
              )}
              {!jsonError && (
                <div className="mt-2 text-xs text-green-500">
                  ✅ 유효한 JSON
                </div>
              )}
            </div>
          </div>

          {/* 컴포넌트 선택 */}
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">컴포넌트 선택</h3>
            
            {/* 필수 컴포넌트 */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">필수 컴포넌트</span>
                <span className="text-xs text-gray-500">({allComponentTemplates.filter(t => t.category === 'essential').length}개)</span>
              </div>
              <div className="space-y-2">
                {allComponentTemplates
                  .filter(template => template.category === 'essential')
                  .map(template => (
                    <div key={template.id} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id={template.id}
                        checked={selectedComponents.includes(template.id)}
                        onChange={() => toggleComponent(template.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label 
                        htmlFor={template.id}
                        className="text-sm text-gray-700 cursor-pointer flex-1"
                      >
                        {template.name}
                      </label>
                    </div>
                  ))
                }
              </div>
            </div>

            {/* 선택 컴포넌트 */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">선택 컴포넌트</span>
                <span className="text-xs text-gray-500">({allComponentTemplates.filter(t => t.category === 'optional').length}개)</span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {allComponentTemplates
                  .filter(template => template.category === 'optional')
                  .map(template => (
                    <div key={template.id} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id={template.id}
                        checked={selectedComponents.includes(template.id)}
                        onChange={() => toggleComponent(template.id)}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <label 
                        htmlFor={template.id}
                        className="text-sm text-gray-700 cursor-pointer flex-1"
                      >
                        {template.name}
                      </label>
                    </div>
                  ))
                }
              </div>
            </div>

            {/* 선택 상태 */}
            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span>선택된 컴포넌트: {selectedComponents.length}개</span>
                <SupabaseStatus />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area - Component Preview Canvas */}
        <div className="flex-1 overflow-y-auto">
          {/* Top Header */}
          <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-8 py-6 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <h2 className="text-xl font-bold text-gray-900">실시간 컴포넌트 미리보기</h2>
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-semibold">
                    테마: {currentTheme.name}
                  </div>
                  <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                    {selectedComponents.length}개 선택
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm">
                  저장
                </button>
                <button className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl">
                  다운로드
                </button>
              </div>
            </div>
          </div>

          {/* Component Preview Sections */}
          <div className="p-8 space-y-12">
            {getSelectedTemplates().map((template) => (
              <div key={template.id} className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">{template.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      template.category === 'essential' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {template.category === 'essential' ? '필수' : '선택'}
                    </span>
                  </div>
                </div>
                
                {/* 컴포넌트별 미리보기 렌더링 */}
                <div className="space-y-6">
                  {template.id === 'button' && (
                    <div className="flex flex-wrap gap-4">
                      <button className="px-6 py-3 bg-[hsl(var(--color-primary-500))] text-white rounded-xl hover:bg-[hsl(var(--color-primary-600))] text-sm font-semibold shadow-lg transition-all transform hover:-translate-y-0.5">
                        Primary Button
                      </button>
                      <button className="px-6 py-3 bg-[hsl(var(--color-secondary-500))] text-white rounded-xl hover:bg-[hsl(var(--color-secondary-600))] text-sm font-semibold shadow-lg transition-all transform hover:-translate-y-0.5">
                        Secondary Button
                      </button>
                      <button className="px-6 py-3 border-2 border-[hsl(var(--color-primary-500))] text-[hsl(var(--color-primary-500))] rounded-xl hover:bg-[hsl(var(--color-primary-50))] text-sm font-semibold transition-all transform hover:-translate-y-0.5">
                        Outline Button
                      </button>
                    </div>
                  )}
                  
                  {template.id === 'input' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">텍스트 입력</label>
                        <input 
                          type="text" 
                          placeholder="텍스트를 입력하세요" 
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary-500))] focus:border-[hsl(var(--color-primary-500))] text-sm transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">이메일 입력</label>
                        <input 
                          type="email" 
                          placeholder="name@example.com" 
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary-500))] focus:border-[hsl(var(--color-primary-500))] text-sm transition-all"
                        />
                      </div>
                    </div>
                  )}
                  
                  {template.id === 'card' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                        <h4 className="font-bold text-gray-900 mb-3">기본 카드</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">테마가 적용된 기본 카드 컴포넌트입니다.</p>
                      </div>
                      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                        <div className="h-32 bg-[hsl(var(--color-primary-100))]"></div>
                        <div className="p-6">
                          <h4 className="font-bold text-gray-900 mb-3">이미지 카드</h4>
                          <p className="text-sm text-gray-600 leading-relaxed">헤더 이미지가 포함된 카드입니다.</p>
                        </div>
                      </div>
                      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                        <h4 className="font-bold text-gray-900 mb-3">액션 카드</h4>
                        <p className="text-sm text-gray-600 leading-relaxed mb-4">버튼이 포함된 카드입니다.</p>
                        <button className="px-4 py-2 bg-[hsl(var(--color-primary-500))] text-white rounded-lg text-sm font-medium hover:bg-[hsl(var(--color-primary-600))] transition-colors">
                          액션
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* 다른 컴포넌트들도 유사하게 렌더링 */}
                  {!['button', 'input', 'card'].includes(template.id) && (
                    <div className="p-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-center">
                      <p className="text-gray-500 text-sm">
                        {template.name} 컴포넌트 미리보기 (개발 예정)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {selectedComponents.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">컴포넌트를 선택해주세요</h3>
                <p className="text-gray-500">왼쪽 사이드바에서 미리보기할 컴포넌트를 선택하세요.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}