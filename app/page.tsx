'use client'

import { useEffect, useState } from 'react'
import { getThemeTemplates, saveTheme, getUserThemes } from '@/lib/supabase/themes'
import { getComponentTemplates } from '@/lib/supabase/components'
import { Theme, ComponentTemplate, ComponentSettings } from '@/types/database'
import { useAuth } from '@/contexts/AuthContext'
import { signOut } from '@/lib/supabase/auth'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import SupabaseStatus from '@/components/SupabaseStatus'
import Navigation from '@/components/Navigation'
import { 
  parseThemeJson, 
  generateCssVariables, 
  applyCssVariables, 
  defaultTheme,
  sampleThemes 
} from '@/lib/theme-utils'
import { allComponentTemplates } from '@/lib/component-templates'
import { useToast } from '@/hooks/useToast'
import Toast from '@/components/ui/Toast'
import SaveThemeModal from '@/components/ui/SaveThemeModal'

export default function Home() {
  const [themeTemplates, setThemeTemplates] = useState<Theme[]>([])
  const [componentTemplates, setComponentTemplates] = useState<ComponentTemplate[]>([])
  const [selectedComponents, setSelectedComponents] = useState<string[]>([])
  const [componentSettings, setComponentSettings] = useState<ComponentSettings>({})
  const [expandedSettings, setExpandedSettings] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentTheme, setCurrentTheme] = useState(defaultTheme)
  const [jsonInput, setJsonInput] = useState(JSON.stringify(sampleThemes.flat, null, 2))
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [userThemes, setUserThemes] = useState<Theme[]>([])
  const [saveLoading, setSaveLoading] = useState(false)
  const [showUserThemes, setShowUserThemes] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const { toast, success, error: showError, hideToast } = useToast()

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
        
        // 컴포넌트 기본 설정 초기화
        const defaultSettings: ComponentSettings = {}
        allComponentTemplates.forEach(template => {
          const settings: { [key: string]: any } = {}
          Object.entries(template.props_schema).forEach(([propKey, propSchema]) => {
            settings[propKey] = propSchema.default
          })
          defaultSettings[template.id] = settings
        })
        setComponentSettings(defaultSettings)
        
        // 사용자 테마 불러오기
        if (user) {
          const userThemesData = await getUserThemes(user.id)
          setUserThemes(userThemesData)
        }
      } catch (err) {
        console.error('Failed to load data:', err)
        setError('Failed to load data from database')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

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

  // 전체 선택
  const selectAllComponents = () => {
    const allIds = allComponentTemplates.map(template => template.id)
    setSelectedComponents(allIds)
  }

  // 전체 해제
  const deselectAllComponents = () => {
    setSelectedComponents([])
  }

  // 필수 컴포넌트만 선택
  const selectEssentialOnly = () => {
    const essentialIds = allComponentTemplates
      .filter(template => template.category === 'essential')
      .map(template => template.id)
    setSelectedComponents(essentialIds)
  }

  // 컴포넌트 설정 업데이트
  const updateComponentSetting = (componentId: string, propKey: string, value: any) => {
    setComponentSettings(prev => ({
      ...prev,
      [componentId]: {
        ...prev[componentId],
        [propKey]: value
      }
    }))
  }

  // 설정 패널 토글
  const toggleSettingsExpanded = (componentId: string) => {
    setExpandedSettings(prev => 
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

  // 컴포넌트 설정값 가져오기
  const getComponentSetting = (componentId: string, propKey: string, defaultValue?: any) => {
    return componentSettings[componentId]?.[propKey] ?? defaultValue
  }

  // 테마 저장 버튼 클릭
  const handleSaveThemeClick = () => {
    if (!user) {
      showError('로그인이 필요합니다.')
      return
    }
    setShowSaveModal(true)
  }

  // 테마 저장 실행
  const handleSaveTheme = async (themeName: string) => {
    setSaveLoading(true)

    try {
      const { data, error: saveError } = await saveTheme({
        name: themeName,
        theme_data: currentTheme,
        selected_components: selectedComponents,
        component_settings: componentSettings,
        is_template: false
      })

      if (saveError) {
        showError(`저장 실패: ${saveError}`)
      } else {
        success(`테마 "${themeName}"이 컴포넌트 ${selectedComponents.length}개와 함께 저장되었습니다!`)
        // 사용자 테마 목록 새로고침
        if (user) {
          const updatedUserThemes = await getUserThemes(user.id)
          setUserThemes(updatedUserThemes)
        }
        setShowSaveModal(false)
      }
    } catch (err) {
      console.error('Save error:', err)
      showError('저장 중 오류가 발생했습니다.')
    } finally {
      setSaveLoading(false)
    }
  }

  // 저장된 테마 불러오기 (컴포넌트 정보 포함)
  const handleLoadTheme = (theme: Theme) => {
    setCurrentTheme(theme.theme_data)
    setJsonInput(JSON.stringify(theme.theme_data, null, 2))
    
    // 컴포넌트 선택 상태 복원
    if (theme.selected_components) {
      setSelectedComponents(theme.selected_components)
    }
    
    // 컴포넌트 설정 복원
    if (theme.component_settings) {
      setComponentSettings(theme.component_settings)
    }
    
    // CSS 변수 적용
    const cssVars = generateCssVariables(theme.theme_data)
    applyCssVariables(cssVars)
    
    // 성공 메시지 표시
    const componentCount = theme.selected_components?.length || 0
    success(`테마 "${theme.name}"과 컴포넌트 ${componentCount}개를 불러왔습니다!`)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        {/* Navigation */}
        <Navigation />
        
        <div className="flex h-[calc(100vh-80px)] bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        {/* Left Sidebar - JSON Editor & Component Selection */}
        <div className="w-96 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 overflow-y-auto shadow-sm">
          {/* Header */}
          <div className="p-4 border-b border-gray-200/50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-lg font-bold text-gray-900">테마 생성기</h1>
                <p className="text-xs text-gray-500">JSON 테마로 컴포넌트 생성</p>
              </div>
              <div className="text-xs text-gray-600">
                {user?.email}
              </div>
            </div>
            
            {/* Save/Load Controls */}
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={handleSaveThemeClick}
                disabled={saveLoading}
                className="flex-1 px-3 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 rounded-lg transition-colors"
              >
                {saveLoading ? '저장 중...' : '테마 저장'}
              </button>
              <button
                onClick={() => setShowUserThemes(!showUserThemes)}
                className="px-3 py-2 text-xs font-medium text-blue-600 border border-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                내 테마
              </button>
            </div>
            
            
            {/* User Themes List */}
            {showUserThemes && userThemes.length > 0 && (
              <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                <h4 className="text-xs font-semibold text-gray-700 mb-2">저장된 테마</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {userThemes.map((theme) => (
                    <div
                      key={theme.id}
                      className="bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-300 transition-colors"
                    >
                      <button
                        onClick={() => handleLoadTheme(theme)}
                        className="w-full text-left"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="text-sm font-medium text-gray-900">{theme.name}</h5>
                          <span className="text-xs text-gray-500">
                            {new Date(theme.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 mb-2">
                          테마: {theme.theme_data.name || '사용자 정의'}
                        </div>
                        {theme.selected_components && theme.selected_components.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            <span className="text-xs text-blue-600 font-medium">
                              컴포넌트 {theme.selected_components.length}개:
                            </span>
                            {theme.selected_components.slice(0, 3).map((componentId) => {
                              const component = allComponentTemplates.find(t => t.id === componentId)
                              return component ? (
                                <span key={componentId} className="text-xs bg-blue-100 text-blue-700 px-1 py-0.5 rounded">
                                  {component.name}
                                </span>
                              ) : null
                            })}
                            {theme.selected_components.length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{theme.selected_components.length - 3}개
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 샘플 테마 버튼 */}
          <div className="p-4 border-b border-gray-200/50">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">빠른 테마 적용</h3>
            <div className="grid grid-cols-2 gap-2 mb-3">
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
              <button
                onClick={() => loadSampleTheme('flat')}
                className="p-2 text-xs rounded-lg border border-gray-200 hover:border-teal-300 hover:bg-teal-50 transition-colors font-medium"
              >
                🆕 Flat JSON
              </button>
            </div>
            <div className="text-xs text-gray-500">
              <strong>Flat JSON:</strong> 단순화된 색상 + 타이포그래피 형태
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">컴포넌트 선택</h3>
              <div className="flex gap-1">
                <button
                  onClick={selectAllComponents}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  title="전체 선택"
                >
                  전체
                </button>
                <button
                  onClick={selectEssentialOnly}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  title="필수만"
                >
                  필수
                </button>
                <button
                  onClick={deselectAllComponents}
                  className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                  title="전체 해제"
                >
                  해제
                </button>
              </div>
            </div>
            
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
                    <div key={template.id} className="space-y-2">
                      <div className="flex items-center gap-3">
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
                        {selectedComponents.includes(template.id) && Object.keys(template.props_schema).length > 0 && (
                          <button
                            onClick={() => toggleSettingsExpanded(template.id)}
                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            title="설정"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </button>
                        )}
                      </div>
                      
                      {/* 설정 패널 */}
                      {selectedComponents.includes(template.id) && 
                       expandedSettings.includes(template.id) && 
                       Object.keys(template.props_schema).length > 0 && (
                        <div className="ml-7 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 space-y-4">
                          <div className="flex items-center gap-2 mb-3">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                            </svg>
                            <span className="text-sm font-semibold text-blue-700">컴포넌트 설정</span>
                          </div>
                          
                          {Object.entries(template.props_schema).map(([propKey, propSchema]) => (
                            <div key={propKey} className="space-y-2">
                              <label className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                                {propSchema.description || propKey}
                              </label>
                              
                              {propSchema.options ? (
                                <select
                                  value={componentSettings[template.id]?.[propKey] || propSchema.default}
                                  onChange={(e) => updateComponentSetting(template.id, propKey, e.target.value)}
                                  className="w-full px-3 py-2 text-sm bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                >
                                  {propSchema.options.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                  ))}
                                </select>
                              ) : propSchema.type === 'boolean' ? (
                                <label className="flex items-center gap-3 p-2 bg-white rounded-lg border border-blue-100 hover:bg-blue-25 transition-colors cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={componentSettings[template.id]?.[propKey] || propSchema.default || false}
                                    onChange={(e) => updateComponentSetting(template.id, propKey, e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-blue-300 rounded focus:ring-blue-500"
                                  />
                                  <span className="text-sm text-gray-700">활성화</span>
                                </label>
                              ) : (
                                <input
                                  type={propSchema.type === 'number' ? 'number' : 'text'}
                                  value={componentSettings[template.id]?.[propKey] || propSchema.default || ''}
                                  onChange={(e) => updateComponentSetting(template.id, propKey, e.target.value)}
                                  className="w-full px-3 py-2 text-sm bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                  placeholder={propSchema.default}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
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
                    <div key={template.id} className="space-y-2">
                      <div className="flex items-center gap-3">
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
                        {selectedComponents.includes(template.id) && Object.keys(template.props_schema).length > 0 && (
                          <button
                            onClick={() => toggleSettingsExpanded(template.id)}
                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            title="설정"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </button>
                        )}
                      </div>
                      
                      {/* 설정 패널 */}
                      {selectedComponents.includes(template.id) && 
                       expandedSettings.includes(template.id) && 
                       Object.keys(template.props_schema).length > 0 && (
                        <div className="ml-7 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 space-y-4">
                          <div className="flex items-center gap-2 mb-3">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                            </svg>
                            <span className="text-sm font-semibold text-blue-700">컴포넌트 설정</span>
                          </div>
                          
                          {Object.entries(template.props_schema).map(([propKey, propSchema]) => (
                            <div key={propKey} className="space-y-2">
                              <label className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                                {propSchema.description || propKey}
                              </label>
                              
                              {propSchema.options ? (
                                <select
                                  value={componentSettings[template.id]?.[propKey] || propSchema.default}
                                  onChange={(e) => updateComponentSetting(template.id, propKey, e.target.value)}
                                  className="w-full px-3 py-2 text-sm bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                >
                                  {propSchema.options.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                  ))}
                                </select>
                              ) : propSchema.type === 'boolean' ? (
                                <label className="flex items-center gap-3 p-2 bg-white rounded-lg border border-blue-100 hover:bg-blue-25 transition-colors cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={componentSettings[template.id]?.[propKey] || propSchema.default || false}
                                    onChange={(e) => updateComponentSetting(template.id, propKey, e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-blue-300 rounded focus:ring-blue-500"
                                  />
                                  <span className="text-sm text-gray-700">활성화</span>
                                </label>
                              ) : (
                                <input
                                  type={propSchema.type === 'number' ? 'number' : 'text'}
                                  value={componentSettings[template.id]?.[propKey] || propSchema.default || ''}
                                  onChange={(e) => updateComponentSetting(template.id, propKey, e.target.value)}
                                  className="w-full px-3 py-2 text-sm bg-white border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                  placeholder={propSchema.default}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
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
                  {template.id === 'button' && (() => {
                    const variant = getComponentSetting('button', 'variant', 'primary')
                    const size = getComponentSetting('button', 'size', 'md')
                    
                    const sizeClasses = {
                      sm: 'h-8 px-3 text-sm',
                      md: 'h-10 px-4 text-base', 
                      lg: 'h-12 px-6 text-lg'
                    }
                    
                    return (
                      <div className="flex flex-wrap gap-4">
                        <button className={`${sizeClasses[size as keyof typeof sizeClasses]} bg-[hsl(var(--color-primary-500))] text-white rounded-xl hover:bg-[hsl(var(--color-primary-600))] font-semibold shadow-lg transition-all transform hover:-translate-y-0.5`}>
                          Primary Button
                        </button>
                        <button className={`${sizeClasses[size as keyof typeof sizeClasses]} bg-[hsl(var(--color-secondary-500))] text-white rounded-xl hover:bg-[hsl(var(--color-secondary-600))] font-semibold shadow-lg transition-all transform hover:-translate-y-0.5`}>
                          Secondary Button
                        </button>
                        <button className={`${sizeClasses[size as keyof typeof sizeClasses]} border-2 border-[hsl(var(--color-primary-500))] text-[hsl(var(--color-primary-500))] rounded-xl hover:bg-[hsl(var(--color-primary-50))] font-semibold transition-all transform hover:-translate-y-0.5`}>
                          Outline Button
                        </button>
                      </div>
                    )
                  })()}
                  
                  {template.id === 'input' && (() => {
                    const variant = getComponentSetting('input', 'variant', 'default')
                    const inputSize = getComponentSetting('input', 'inputSize', 'md')
                    
                    const sizeClasses = {
                      sm: 'h-8 px-3 text-sm',
                      md: 'h-10 px-4 text-base', 
                      lg: 'h-12 px-5 text-lg'
                    }
                    
                    const variantClasses = {
                      default: 'border-2 border-gray-200 bg-white',
                      filled: 'border-transparent bg-[hsl(var(--color-secondary-100))] focus:bg-white'
                    }
                    
                    return (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">텍스트 입력</label>
                          <input 
                            type="text" 
                            placeholder="텍스트를 입력하세요" 
                            className={`w-full ${sizeClasses[inputSize as keyof typeof sizeClasses]} ${variantClasses[variant as keyof typeof variantClasses]} rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary-500))] focus:border-[hsl(var(--color-primary-500))] transition-all`}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">이메일 입력</label>
                          <input 
                            type="email" 
                            placeholder="name@example.com" 
                            className={`w-full ${sizeClasses[inputSize as keyof typeof sizeClasses]} ${variantClasses[variant as keyof typeof variantClasses]} rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary-500))] focus:border-[hsl(var(--color-primary-500))] transition-all`}
                          />
                        </div>
                      </div>
                    )
                  })()}
                  
                  {template.id === 'card' && (() => {
                    const variant = getComponentSetting('card', 'variant', 'default')
                    
                    const getCardClasses = (cardVariant: string) => {
                      const baseClasses = "bg-white rounded-2xl p-6 hover:shadow-xl transition-all transform hover:-translate-y-1"
                      switch(cardVariant) {
                        case 'outlined': 
                          return `${baseClasses} border border-gray-200`
                        case 'elevated':
                          return `${baseClasses} shadow-lg`
                        default:
                          return baseClasses
                      }
                    }
                    
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className={getCardClasses(variant)}>
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
                        <div className={getCardClasses(variant)}>
                          <h4 className="font-bold text-gray-900 mb-3">액션 카드</h4>
                          <p className="text-sm text-gray-600 leading-relaxed mb-4">버튼이 포함된 카드입니다.</p>
                          <button className="px-4 py-2 bg-[hsl(var(--color-primary-500))] text-white rounded-lg text-sm font-medium hover:bg-[hsl(var(--color-primary-600))] transition-colors">
                            액션
                          </button>
                        </div>
                      </div>
                    )
                  })()}
                  
                  {template.id === 'modal' && (
                    <div className="relative bg-white rounded-2xl border border-gray-200 p-6 shadow-xl max-w-md mx-auto">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-bold text-gray-900">모달 제목</h4>
                        <button className="text-gray-400 hover:text-gray-600">×</button>
                      </div>
                      <p className="text-gray-600 text-sm mb-6">모달 컴포넌트의 미리보기입니다.</p>
                      <div className="flex gap-3 justify-end">
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">취소</button>
                        <button className="px-4 py-2 bg-[hsl(var(--color-primary-500))] text-white rounded-lg text-sm hover:bg-[hsl(var(--color-primary-600))]">확인</button>
                      </div>
                    </div>
                  )}

                  {template.id === 'table' && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-[hsl(var(--color-secondary-50))]">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">이름</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">역할</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">홍길동</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">개발자</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">활성</span>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">김철수</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">디자이너</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">대기</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  {template.id === 'badge' && (
                    <div className="flex flex-wrap gap-3">
                      <span className="px-3 py-1 text-xs font-semibold bg-[hsl(var(--color-primary-100))] text-[hsl(var(--color-primary-800))] rounded-full">Primary</span>
                      <span className="px-3 py-1 text-xs font-semibold bg-[hsl(var(--color-secondary-100))] text-[hsl(var(--color-secondary-800))] rounded-full">Secondary</span>
                      <span className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">Success</span>
                      <span className="px-3 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">Warning</span>
                      <span className="px-3 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">Error</span>
                    </div>
                  )}

                  {template.id === 'avatar' && (
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[hsl(var(--color-primary-500))] rounded-full flex items-center justify-center text-white font-semibold">홍</div>
                      <div className="w-16 h-16 bg-gradient-to-r from-[hsl(var(--color-primary-500))] to-[hsl(var(--color-secondary-500))] rounded-full flex items-center justify-center text-white font-bold text-lg">김</div>
                      <div className="w-20 h-20 bg-gray-200 rounded-full overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-b from-gray-300 to-gray-400 flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}

                  {template.id === 'toast' && (
                    <div className="space-y-3">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-green-800">성공!</p>
                          <p className="text-xs text-green-600">작업이 성공적으로 완료되었습니다.</p>
                        </div>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                        <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-red-800">오류!</p>
                          <p className="text-xs text-red-600">작업을 처리하는 중 오류가 발생했습니다.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {template.id === 'grid' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                        <div key={item} className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                          <div className="w-12 h-12 bg-[hsl(var(--color-primary-100))] rounded-lg mx-auto mb-3 flex items-center justify-center">
                            <span className="text-[hsl(var(--color-primary-600))] font-semibold">{item}</span>
                          </div>
                          <p className="text-sm text-gray-600">Grid Item {item}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {template.id === 'divider' && (
                    <div className="space-y-6">
                      <div>
                        <p className="text-sm text-gray-600 mb-4">기본 구분선</p>
                        <hr className="border-gray-200" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-4">텍스트가 포함된 구분선</p>
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                          </div>
                          <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">또는</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {template.id === 'tabs' && (
                    <div className="w-full">
                      <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                          <button className="border-b-2 border-[hsl(var(--color-primary-500))] text-[hsl(var(--color-primary-600))] py-2 px-1 text-sm font-medium">
                            탭 1
                          </button>
                          <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 py-2 px-1 text-sm font-medium">
                            탭 2
                          </button>
                          <button className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 py-2 px-1 text-sm font-medium">
                            탭 3
                          </button>
                        </nav>
                      </div>
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">선택된 탭의 내용이 여기에 표시됩니다.</p>
                      </div>
                    </div>
                  )}

                  {(template.id === 'bar-chart' || template.id === 'line-chart' || template.id === 'pie-chart') && (
                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">차트 미리보기</h4>
                      {template.id === 'bar-chart' && (
                        <div className="flex items-end justify-center gap-2 h-32">
                          <div className="w-8 bg-[hsl(var(--color-primary-500))] h-16 rounded-t"></div>
                          <div className="w-8 bg-[hsl(var(--color-primary-400))] h-24 rounded-t"></div>
                          <div className="w-8 bg-[hsl(var(--color-primary-600))] h-12 rounded-t"></div>
                          <div className="w-8 bg-[hsl(var(--color-primary-500))] h-20 rounded-t"></div>
                          <div className="w-8 bg-[hsl(var(--color-primary-400))] h-28 rounded-t"></div>
                        </div>
                      )}
                      {template.id === 'line-chart' && (
                        <div className="relative h-32 bg-gray-50 rounded-lg p-4">
                          <svg className="w-full h-full" viewBox="0 0 300 100">
                            <polyline
                              fill="none"
                              stroke={`hsl(var(--color-primary-500))`}
                              strokeWidth="2"
                              points="20,80 60,40 100,60 140,20 180,50 220,30 260,70"
                            />
                            <circle cx="20" cy="80" r="3" fill={`hsl(var(--color-primary-500))`} />
                            <circle cx="60" cy="40" r="3" fill={`hsl(var(--color-primary-500))`} />
                            <circle cx="100" cy="60" r="3" fill={`hsl(var(--color-primary-500))`} />
                            <circle cx="140" cy="20" r="3" fill={`hsl(var(--color-primary-500))`} />
                            <circle cx="180" cy="50" r="3" fill={`hsl(var(--color-primary-500))`} />
                            <circle cx="220" cy="30" r="3" fill={`hsl(var(--color-primary-500))`} />
                            <circle cx="260" cy="70" r="3" fill={`hsl(var(--color-primary-500))`} />
                          </svg>
                        </div>
                      )}
                      {template.id === 'pie-chart' && (
                        <div className="flex justify-center">
                          <svg className="w-32 h-32" viewBox="0 0 42 42">
                            <circle cx="21" cy="21" r="15.915" fill="transparent" stroke={`hsl(var(--color-secondary-200))`} strokeWidth="3" />
                            <circle cx="21" cy="21" r="15.915" fill="transparent" stroke={`hsl(var(--color-primary-500))`} strokeWidth="3" strokeDasharray="60 40" strokeDashoffset="25" />
                            <circle cx="21" cy="21" r="15.915" fill="transparent" stroke={`hsl(var(--color-primary-300))`} strokeWidth="3" strokeDasharray="40 60" strokeDashoffset="-35" />
                          </svg>
                        </div>
                      )}
                    </div>
                  )}

                  {template.id === 'notification' && (
                    <div className="bg-blue-50 border-l-4 border-[hsl(var(--color-primary-500))] p-4 rounded-r-lg">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-[hsl(var(--color-primary-500))]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-[hsl(var(--color-primary-700))]">
                            <strong>알림:</strong> 새로운 업데이트가 있습니다.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {template.id === 'banner' && (
                    <div className="bg-gradient-to-r from-[hsl(var(--color-primary-500))] to-[hsl(var(--color-primary-600))] rounded-xl p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-bold mb-2">환영합니다!</h4>
                          <p className="text-sm opacity-90">새로운 디자인 시스템을 경험해보세요.</p>
                        </div>
                        <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors">
                          시작하기
                        </button>
                      </div>
                    </div>
                  )}

                  {template.id === 'pagination' && (
                    <div className="flex items-center justify-center space-x-1">
                      <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50">
                        이전
                      </button>
                      <button className="px-3 py-2 text-sm font-medium text-white bg-[hsl(var(--color-primary-500))] border border-[hsl(var(--color-primary-500))]">
                        1
                      </button>
                      <button className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50">
                        2
                      </button>
                      <button className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50">
                        3
                      </button>
                      <button className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50">
                        다음
                      </button>
                    </div>
                  )}

                  {template.id === 'accordion' && (
                    <div className="space-y-2">
                      <div className="border border-gray-200 rounded-lg">
                        <button className="w-full px-4 py-3 text-left font-medium text-gray-900 bg-gray-50 hover:bg-gray-100 flex items-center justify-between rounded-t-lg">
                          <span>첫 번째 아코디언</span>
                          <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <div className="px-4 py-3 text-sm text-gray-600 border-t border-gray-200">
                          첫 번째 아코디언의 내용입니다.
                        </div>
                      </div>
                      <div className="border border-gray-200 rounded-lg">
                        <button className="w-full px-4 py-3 text-left font-medium text-gray-900 hover:bg-gray-50 flex items-center justify-between rounded-lg">
                          <span>두 번째 아코디언</span>
                          <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}

                  {template.id === 'carousel' && (
                    <div className="relative bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="flex">
                        <div className="w-full h-48 bg-gradient-to-r from-[hsl(var(--color-primary-100))] to-[hsl(var(--color-primary-200))] flex items-center justify-center">
                          <div className="text-center">
                            <h4 className="text-xl font-bold text-[hsl(var(--color-primary-700))] mb-2">슬라이드 1</h4>
                            <p className="text-[hsl(var(--color-primary-600))]">첫 번째 슬라이드 내용</p>
                          </div>
                        </div>
                      </div>
                      <button className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg">
                        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <button className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg">
                        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        <div className="w-2 h-2 bg-[hsl(var(--color-primary-500))] rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Button 미리보기 */}
                  {template.id === 'enhanced-button' && (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        <button className="px-4 py-2 text-sm font-medium text-white bg-[hsl(var(--color-primary-500))] hover:bg-[hsl(var(--color-primary-600))] rounded-lg transition-colors">
                          Primary
                        </button>
                        <button className="px-4 py-2 text-sm font-medium text-[hsl(var(--color-primary-500))] border border-[hsl(var(--color-primary-500))] hover:bg-[hsl(var(--color-primary-50))] rounded-lg transition-colors">
                          Outline
                        </button>
                        <button className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                          Destructive
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-[hsl(var(--color-primary-500))] rounded-lg">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                          With Icon
                        </button>
                        <button className="px-4 py-2 text-sm font-medium text-white bg-gray-400 rounded-lg cursor-not-allowed" disabled>
                          Disabled
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Input 미리보기 */}
                  {template.id === 'enhanced-input' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Enhanced Input</label>
                        <input 
                          type="text" 
                          placeholder="Enter your text..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary-500))] focus:border-[hsl(var(--color-primary-500))] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">With Icon</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <input 
                            type="text" 
                            placeholder="Username"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary-500))] focus:border-[hsl(var(--color-primary-500))] transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Modal 미리보기 */}
                  {template.id === 'enhanced-modal' && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 max-w-md">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Enhanced Modal</h3>
                        <button className="text-gray-400 hover:text-gray-600">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-gray-600 mb-6">이것은 향상된 모달 다이얼로그 컴포넌트입니다. 더 나은 접근성과 애니메이션을 제공합니다.</p>
                      <div className="flex justify-end gap-3">
                        <button className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                          취소
                        </button>
                        <button className="px-4 py-2 text-sm font-medium text-white bg-[hsl(var(--color-primary-500))] rounded-lg hover:bg-[hsl(var(--color-primary-600))] transition-colors">
                          확인
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Typography/Font Component 미리보기 */}
                  {template.id === 'typography' && (
                    <div className="space-y-6">
                      {/* Headings */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">제목 스타일</h4>
                        <div className="space-y-3">
                          <h1 className="text-4xl font-bold text-gray-900 leading-tight" style={{ fontFamily: currentTheme.typography.fontFamily.sans.join(', ') }}>
                            Heading 1 - 주요 제목
                          </h1>
                          <h2 className="text-3xl font-bold text-gray-800 leading-tight" style={{ fontFamily: currentTheme.typography.fontFamily.sans.join(', ') }}>
                            Heading 2 - 부제목
                          </h2>
                          <h3 className="text-2xl font-semibold text-gray-700 leading-tight" style={{ fontFamily: currentTheme.typography.fontFamily.sans.join(', ') }}>
                            Heading 3 - 섹션 제목
                          </h3>
                          <h4 className="text-xl font-medium text-gray-700 leading-tight" style={{ fontFamily: currentTheme.typography.fontFamily.sans.join(', ') }}>
                            Heading 4 - 소제목
                          </h4>
                        </div>
                      </div>

                      {/* Body Text */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">본문 텍스트</h4>
                        <div className="space-y-3">
                          <p className="text-lg text-gray-700 leading-relaxed" style={{ fontFamily: currentTheme.typography.fontFamily.sans.join(', ') }}>
                            대형 본문 텍스트 - 이것은 큰 본문 텍스트 예시입니다. 읽기 편한 크기와 줄 간격을 가지고 있습니다.
                          </p>
                          <p className="text-base text-gray-600 leading-relaxed" style={{ fontFamily: currentTheme.typography.fontFamily.sans.join(', ') }}>
                            일반 본문 텍스트 - 가장 많이 사용되는 기본 텍스트 크기입니다. 대부분의 콘텐츠에 적합합니다.
                          </p>
                          <p className="text-sm text-gray-500 leading-relaxed" style={{ fontFamily: currentTheme.typography.fontFamily.sans.join(', ') }}>
                            소형 본문 텍스트 - 부가 정보나 설명에 사용되는 작은 텍스트입니다.
                          </p>
                        </div>
                      </div>

                      {/* Code and Monospace */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">코드 텍스트</h4>
                        <div className="space-y-3">
                          <code className="px-2 py-1 text-sm bg-gray-100 text-gray-800 rounded" style={{ fontFamily: currentTheme.typography.fontFamily.mono.join(', ') }}>
                            const example = &apos;inline code&apos;
                          </code>
                          <pre className="p-4 bg-gray-900 text-green-400 rounded-lg text-sm overflow-x-auto" style={{ fontFamily: currentTheme.typography.fontFamily.mono.join(', ') }}>
{`function generateComponent() {
  return {
    name: 'Button',
    variant: 'primary',
    size: 'medium'
  };
}`}
                          </pre>
                        </div>
                      </div>

                      {/* Text Styles */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">텍스트 스타일</h4>
                        <div className="space-y-2">
                          <p className="text-base" style={{ fontFamily: currentTheme.typography.fontFamily.sans.join(', ') }}>
                            <span className="font-bold">굵은 텍스트</span>, 
                            <span className="italic ml-2">기울임 텍스트</span>, 
                            <span className="underline ml-2">밑줄 텍스트</span>, 
                            <span className="line-through ml-2">취소선 텍스트</span>
                          </p>
                          <p className="text-base" style={{ fontFamily: currentTheme.typography.fontFamily.sans.join(', ') }}>
                            <span className="text-[hsl(var(--color-primary-500))] font-medium">컬러 텍스트</span>, 
                            <span className="text-gray-500 ml-2">회색 텍스트</span>, 
                            <span className="text-red-500 ml-2">빨간 텍스트</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Button 더 많은 예시 */}
                  {template.id === 'button' && (
                    <div className="space-y-6">
                      {/* 기본 버튼들 */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">기본 버튼</h4>
                        <div className="flex flex-wrap gap-3">
                          <button className="px-6 py-3 text-sm font-medium text-white bg-[hsl(var(--color-primary-500))] hover:bg-[hsl(var(--color-primary-600))] rounded-lg transition-all transform hover:scale-105 shadow-lg">
                            Primary Button
                          </button>
                          <button className="px-6 py-3 text-sm font-medium text-[hsl(var(--color-primary-500))] border-2 border-[hsl(var(--color-primary-500))] hover:bg-[hsl(var(--color-primary-50))] rounded-lg transition-all">
                            Outline Button
                          </button>
                          <button className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all">
                            Ghost Button
                          </button>
                        </div>
                      </div>

                      {/* 크기별 버튼 */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">크기별 버튼</h4>
                        <div className="flex items-center flex-wrap gap-3">
                          <button className="px-3 py-1.5 text-xs font-medium text-white bg-[hsl(var(--color-primary-500))] rounded-md">
                            Small
                          </button>
                          <button className="px-4 py-2 text-sm font-medium text-white bg-[hsl(var(--color-primary-500))] rounded-lg">
                            Medium
                          </button>
                          <button className="px-6 py-3 text-base font-medium text-white bg-[hsl(var(--color-primary-500))] rounded-lg">
                            Large
                          </button>
                          <button className="px-8 py-4 text-lg font-medium text-white bg-[hsl(var(--color-primary-500))] rounded-xl">
                            Extra Large
                          </button>
                        </div>
                      </div>

                      {/* 아이콘 버튼 */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">아이콘 버튼</h4>
                        <div className="flex flex-wrap gap-3">
                          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[hsl(var(--color-primary-500))] rounded-lg">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            추가하기
                          </button>
                          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 012 0v4a1 1 0 11-2 0V7zM12 7a1 1 0 012 0v4a1 1 0 11-2 0V7z" clipRule="evenodd" />
                            </svg>
                            삭제하기
                          </button>
                          <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* 상태별 버튼 */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">상태별 버튼</h4>
                        <div className="flex flex-wrap gap-3">
                          <button className="px-4 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-lg">
                            성공
                          </button>
                          <button className="px-4 py-2 text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 rounded-lg">
                            경고
                          </button>
                          <button className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg">
                            위험
                          </button>
                          <button className="px-4 py-2 text-sm font-medium text-white bg-gray-400 rounded-lg cursor-not-allowed" disabled>
                            비활성화
                          </button>
                          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[hsl(var(--color-primary-500))] rounded-lg">
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                            </svg>
                            로딩 중...
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Input 더 많은 예시 */}
                  {template.id === 'input' && (
                    <div className="space-y-6">
                      {/* 기본 입력 필드 */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">기본 입력 필드</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                            <input 
                              type="text" 
                              placeholder="홍길동" 
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary-500))] focus:border-[hsl(var(--color-primary-500))] transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                            <input 
                              type="email" 
                              placeholder="hong@example.com" 
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary-500))] focus:border-[hsl(var(--color-primary-500))] transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">비밀번호</label>
                            <input 
                              type="password" 
                              placeholder="••••••••" 
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary-500))] focus:border-[hsl(var(--color-primary-500))] transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
                            <input 
                              type="tel" 
                              placeholder="010-1234-5678" 
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary-500))] focus:border-[hsl(var(--color-primary-500))] transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 아이콘이 있는 입력 필드 */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">아이콘 입력 필드</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                              </div>
                              <input 
                                type="text" 
                                placeholder="검색어를 입력하세요"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary-500))] focus:border-[hsl(var(--color-primary-500))] transition-all"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">사용자명</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                              <input 
                                type="text" 
                                placeholder="사용자명"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary-500))] focus:border-[hsl(var(--color-primary-500))] transition-all"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 특수 입력 필드 */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">특수 입력 필드</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">메시지</label>
                            <textarea 
                              placeholder="메시지를 입력하세요..."
                              rows={4}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary-500))] focus:border-[hsl(var(--color-primary-500))] transition-all resize-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">국가 선택</label>
                            <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary-500))] focus:border-[hsl(var(--color-primary-500))] transition-all">
                              <option>대한민국</option>
                              <option>미국</option>
                              <option>일본</option>
                              <option>중국</option>
                            </select>
                          </div>
                          <div className="flex items-center gap-3">
                            <input 
                              type="checkbox" 
                              id="terms"
                              className="w-4 h-4 text-[hsl(var(--color-primary-500))] border-gray-300 rounded focus:ring-[hsl(var(--color-primary-500))]"
                            />
                            <label htmlFor="terms" className="text-sm text-gray-700">
                              이용약관에 동의합니다
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 지원되지 않는 컴포넌트에 대한 기본 메시지 */}
                  {![
                    'button', 'input', 'card', 'modal', 'table', 'badge', 'avatar', 'toast', 
                    'grid', 'divider', 'tabs', 'bar-chart', 'line-chart', 'pie-chart',
                    'notification', 'banner', 'pagination', 'accordion', 'carousel',
                    'enhanced-button', 'enhanced-input', 'enhanced-modal', 'typography'
                  ].includes(template.id) && (
                    <div className="p-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-center">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-sm font-medium mb-1">
                        {template.name} 컴포넌트
                      </p>
                      <p className="text-gray-400 text-xs">
                        미리보기 준비 중
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
      </div>
      
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      {/* Save Theme Modal */}
      <SaveThemeModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveTheme}
        defaultName={currentTheme.name || 'My Theme'}
        isLoading={saveLoading}
      />
    </ProtectedRoute>
  )
}