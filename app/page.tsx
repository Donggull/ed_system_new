'use client'

/* eslint-disable @next/next/no-img-element */

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
import { cn } from '@/lib/utils'
import SaveThemeModal from '@/components/ui/SaveThemeModal'
import SaveDesignSystemModal from '@/components/design-system/SaveDesignSystemModal'
import SavedDesignSystems from '@/components/design-system/SavedDesignSystems'
import VersionHistoryModal from '@/components/design-system/VersionHistoryModal'
import ShareDesignSystemModal from '@/components/design-system/ShareDesignSystemModal'
import DiscoverDesignSystems from '@/components/design-system/DiscoverDesignSystems'
import AIRecommendations from '@/components/ai/AIRecommendations'
import CollaborationHub from '@/components/collaboration/CollaborationHub'
import PerformanceHub from '@/components/performance/PerformanceHub'
import ToolsHub from '@/components/tools/ToolsHub'
import { DesignSystem, DesignSystemVersion } from '@/types/database'
import { useDesignSystem } from '@/lib/hooks/useDesignSystem'

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
  const [showSaveDesignSystemModal, setShowSaveDesignSystemModal] = useState(false)
  const [showSavedDesignSystems, setShowSavedDesignSystems] = useState(false)
  const [currentDesignSystem, setCurrentDesignSystem] = useState<DesignSystem | null>(null)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [versionHistoryDesignSystem, setVersionHistoryDesignSystem] = useState<DesignSystem | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareDesignSystem, setShareDesignSystem] = useState<DesignSystem | null>(null)
  const [showDiscoverSystems, setShowDiscoverSystems] = useState(false)
  const [showAIRecommendations, setShowAIRecommendations] = useState(false)
  const [showCollaboration, setShowCollaboration] = useState(false)
  const [showPerformance, setShowPerformance] = useState(false)
  const [showTools, setShowTools] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const { toast, success, error: showError, hideToast } = useToast()
  const { createVersion } = useDesignSystem()

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

  // localStorage에서 공유 테마 확인
  useEffect(() => {
    const checkSharedTheme = () => {
      const sharedThemeData = localStorage.getItem('shared-theme-data')
      const sharedThemeJson = localStorage.getItem('shared-theme-json')
      
      if (sharedThemeData && sharedThemeJson) {
        try {
          const parsedTheme = JSON.parse(sharedThemeData)
          setCurrentTheme(parsedTheme)
          setJsonInput(sharedThemeJson)
          setJsonError(null)
          
          // CSS 변수 적용
          const cssVars = generateCssVariables(parsedTheme)
          applyCssVariables(cssVars)
          
          // 사용 후 localStorage 정리
          localStorage.removeItem('shared-theme-data')
          localStorage.removeItem('shared-theme-json')
          
          success('v2 페이지에서 생성된 테마가 적용되었습니다!')
        } catch (error) {
          console.error('Shared theme parsing error:', error)
        }
      }
    }

    // 컴포넌트 마운트 시와 focus 이벤트에 확인
    checkSharedTheme()
    
    const handleFocus = () => checkSharedTheme()
    window.addEventListener('focus', handleFocus)
    
    return () => window.removeEventListener('focus', handleFocus)
  }, [success])

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
      
      // v2 페이지와 공유
      localStorage.setItem('main-theme-data', JSON.stringify(theme))
      localStorage.setItem('main-theme-json', value)
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

  // Design System handlers
  const handleSaveDesignSystem = () => {
    if (!user) {
      showError('로그인이 필요합니다.')
      return
    }
    setShowSaveDesignSystemModal(true)
  }

  const handleLoadDesignSystem = (designSystem: DesignSystem) => {
    setCurrentTheme(designSystem.theme_data)
    setJsonInput(JSON.stringify(designSystem.theme_data, null, 2))
    
    // 컴포넌트 선택 상태 복원
    setSelectedComponents(designSystem.selected_components)
    
    // 컴포넌트 설정 복원
    if (designSystem.component_settings) {
      setComponentSettings(designSystem.component_settings)
    }
    
    // CSS 변수 적용
    const cssVars = generateCssVariables(designSystem.theme_data)
    applyCssVariables(cssVars)
    
    // 현재 디자인 시스템 설정
    setCurrentDesignSystem(designSystem)
    
    // 성공 메시지 표시
    success(`디자인 시스템 "${designSystem.name}"을 불러왔습니다!`)
  }

  const handleEditDesignSystem = (designSystem: DesignSystem) => {
    setCurrentDesignSystem(designSystem)
    setShowSaveDesignSystemModal(true)
    setShowSavedDesignSystems(false)
  }

  const handleViewVersionHistory = (designSystem: DesignSystem) => {
    setVersionHistoryDesignSystem(designSystem)
    setShowVersionHistory(true)
    setShowSavedDesignSystems(false)
  }

  const handleCreateVersion = async (changeNotes?: string) => {
    if (!versionHistoryDesignSystem) return

    await createVersion(
      versionHistoryDesignSystem.id,
      currentTheme,
      selectedComponents,
      componentSettings,
      changeNotes
    )

    // Refresh the current design system data
    // Note: In a full implementation, you'd want to refetch the design system
    // to get the updated version number
    success('New version created successfully!')
  }

  const handleLoadVersion = (version: DesignSystemVersion) => {
    setCurrentTheme(version.theme_data)
    setJsonInput(JSON.stringify(version.theme_data, null, 2))
    
    // Restore component selection state
    setSelectedComponents(version.selected_components)
    
    // Restore component settings
    if (version.component_settings) {
      setComponentSettings(version.component_settings)
    }
    
    // Apply CSS variables
    const cssVars = generateCssVariables(version.theme_data)
    applyCssVariables(cssVars)
    
    success(`Loaded version ${version.version_number} successfully!`)
  }

  const handleShareDesignSystem = (designSystem: DesignSystem) => {
    setShareDesignSystem(designSystem)
    setShowShareModal(true)
    setShowSavedDesignSystems(false)
  }

  const handleCloneDesignSystem = (designSystem: DesignSystem) => {
    // Load the cloned system into the current editor
    handleLoadDesignSystem(designSystem)
    setShowDiscoverSystems(false)
    success('Design system cloned successfully!')
  }

  const handleAIThemeUpdate = (themeUpdate: Partial<any>) => {
    const updatedTheme = { ...currentTheme, ...themeUpdate }
    setCurrentTheme(updatedTheme)
    
    // JSON input 업데이트
    setJsonInput(JSON.stringify(updatedTheme, null, 2))
    
    // CSS 변수 적용
    try {
      const cssVariables = generateCssVariables(updatedTheme)
      applyCssVariables(cssVariables)
      success('AI 추천이 적용되었습니다!')
    } catch (error) {
      console.error('Failed to apply AI recommendation:', error)
      showError('AI 추천 적용 중 오류가 발생했습니다.')
    }
  }

  const handleViewDiscoveredSystem = (designSystem: DesignSystem) => {
    // Open the shared design system page in a new tab
    if (designSystem.share_token) {
      const shareUrl = `${window.location.origin}/shared/${designSystem.share_token}`
      window.open(shareUrl, '_blank')
    }
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
            <div className="space-y-2 mb-3">
              {/* Theme Controls */}
              <div className="flex items-center gap-2">
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
              
              {/* Design System Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveDesignSystem}
                  className="flex-1 px-3 py-2 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                >
                  디자인 시스템 저장
                </button>
                <button
                  onClick={() => setShowSavedDesignSystems(true)}
                  className="px-3 py-2 text-xs font-medium text-purple-600 border border-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  내 시스템
                </button>
                <button
                  onClick={() => setShowDiscoverSystems(true)}
                  className="px-3 py-2 text-xs font-medium text-blue-600 border border-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  🌐 둘러보기
                </button>
              </div>
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
            
            {/* 컴포넌트 생성하기 버튼 */}
            <div className="mt-3">
              <button
                onClick={() => handleJsonChange(jsonInput)}
                disabled={!!jsonError}
                className={cn(
                  "w-full px-4 py-2 rounded-lg font-medium text-sm transition-colors",
                  jsonError 
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                )}
              >
                🎨 컴포넌트 생성하기
              </button>
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
                <button 
                  onClick={() => setShowAIRecommendations(true)}
                  className="px-5 py-2.5 text-sm font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 hover:border-purple-300 transition-all shadow-sm"
                >
                  🤖 AI 추천
                </button>
                <button 
                  onClick={() => setShowCollaboration(true)}
                  className="px-5 py-2.5 text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 hover:border-blue-300 transition-all shadow-sm"
                >
                  🤝 협업
                </button>
                <button 
                  onClick={() => setShowPerformance(true)}
                  className="px-5 py-2.5 text-sm font-semibold text-green-700 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 hover:border-green-300 transition-all shadow-sm"
                >
                  ⚡ 성능
                </button>
                <button 
                  onClick={() => setShowTools(true)}
                  className="px-5 py-2.5 text-sm font-semibold text-orange-700 bg-orange-50 border border-orange-200 rounded-xl hover:bg-orange-100 hover:border-orange-300 transition-all shadow-sm"
                >
                  🛠️ 도구
                </button>
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
                    <div className="space-y-6">
                      {/* 기본 모달 */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">기본 모달</h4>
                        <div className="relative bg-white rounded-2xl border border-gray-200 p-6 shadow-xl max-w-md mx-auto">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-bold text-gray-900">확인 모달</h4>
                            <button className="text-gray-400 hover:text-gray-600 transition-colors">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          <p className="text-gray-600 text-sm mb-6">이 작업을 계속 진행하시겠습니까? 이 작업은 되돌릴 수 없습니다.</p>
                          <div className="flex gap-3 justify-end">
                            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors">취소</button>
                            <button className="px-4 py-2 bg-[hsl(var(--color-primary-500))] text-white rounded-lg text-sm hover:bg-[hsl(var(--color-primary-600))] transition-colors">확인</button>
                          </div>
                        </div>
                      </div>

                      {/* 경고 모달 */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">경고 모달</h4>
                        <div className="relative bg-white rounded-2xl border border-red-200 p-6 shadow-xl max-w-md mx-auto">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-bold text-gray-900 mb-2">삭제 확인</h4>
                              <p className="text-gray-600 text-sm mb-6">정말로 이 항목을 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다.</p>
                              <div className="flex gap-3 justify-end">
                                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors">취소</button>
                                <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors">삭제</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 성공 모달 */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">성공 모달</h4>
                        <div className="relative bg-white rounded-2xl border border-green-200 p-6 shadow-xl max-w-md mx-auto">
                          <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <h4 className="text-lg font-bold text-gray-900 mb-2">작업 완료!</h4>
                            <p className="text-gray-600 text-sm mb-6">모든 작업이 성공적으로 완료되었습니다.</p>
                            <button className="w-full px-4 py-2 bg-[hsl(var(--color-primary-500))] text-white rounded-lg text-sm hover:bg-[hsl(var(--color-primary-600))] transition-colors">확인</button>
                          </div>
                        </div>
                      </div>

                      {/* 폼 모달 */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">폼 모달</h4>
                        <div className="relative bg-white rounded-2xl border border-gray-200 p-6 shadow-xl max-w-lg mx-auto">
                          <div className="flex items-center justify-between mb-6">
                            <h4 className="text-lg font-bold text-gray-900">새 항목 추가</h4>
                            <button className="text-gray-400 hover:text-gray-600 transition-colors">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          <div className="space-y-4 mb-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
                              <input 
                                type="text" 
                                placeholder="제목을 입력하세요"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary-500))] focus:border-[hsl(var(--color-primary-500))]"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">설명</label>
                              <textarea 
                                placeholder="설명을 입력하세요"
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary-500))] focus:border-[hsl(var(--color-primary-500))] resize-none"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
                              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary-500))] focus:border-[hsl(var(--color-primary-500))]">
                                <option>선택하세요</option>
                                <option>업무</option>
                                <option>개인</option>
                                <option>학습</option>
                              </select>
                            </div>
                          </div>
                          <div className="flex gap-3 justify-end">
                            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors">취소</button>
                            <button className="px-4 py-2 bg-[hsl(var(--color-primary-500))] text-white rounded-lg text-sm hover:bg-[hsl(var(--color-primary-600))] transition-colors">추가</button>
                          </div>
                        </div>
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

                  {/* Bar Chart 미리보기 */}
                  {template.id === 'bar-chart' && (
                    <div className="space-y-6">
                      {/* 기본 막대 차트 */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">기본 막대 차트</h4>
                        <div className="bg-white p-6 rounded-xl border border-gray-200">
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="text-lg font-semibold text-gray-900">월별 매출</h5>
                            <div className="flex gap-2">
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-[hsl(var(--color-primary-500))] rounded"></div>
                                <span className="text-xs text-gray-600">2024</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-[hsl(var(--color-primary-300))] rounded"></div>
                                <span className="text-xs text-gray-600">2023</span>
                              </div>
                            </div>
                          </div>
                          <div className="relative">
                            <div className="flex items-end justify-center gap-3 h-40 px-4">
                              {/* 1월 */}
                              <div className="flex flex-col items-center gap-2">
                                <div className="flex items-end gap-1">
                                  <div className="w-6 bg-[hsl(var(--color-primary-500))] h-16 rounded-t hover:opacity-80 transition-opacity cursor-pointer" title="2024: ₩450만"></div>
                                  <div className="w-6 bg-[hsl(var(--color-primary-300))] h-12 rounded-t hover:opacity-80 transition-opacity cursor-pointer" title="2023: ₩320만"></div>
                                </div>
                                <span className="text-xs text-gray-500">1월</span>
                              </div>
                              {/* 2월 */}
                              <div className="flex flex-col items-center gap-2">
                                <div className="flex items-end gap-1">
                                  <div className="w-6 bg-[hsl(var(--color-primary-500))] h-24 rounded-t hover:opacity-80 transition-opacity cursor-pointer" title="2024: ₩680만"></div>
                                  <div className="w-6 bg-[hsl(var(--color-primary-300))] h-18 rounded-t hover:opacity-80 transition-opacity cursor-pointer" title="2023: ₩510만"></div>
                                </div>
                                <span className="text-xs text-gray-500">2월</span>
                              </div>
                              {/* 3월 */}
                              <div className="flex flex-col items-center gap-2">
                                <div className="flex items-end gap-1">
                                  <div className="w-6 bg-[hsl(var(--color-primary-500))] h-12 rounded-t hover:opacity-80 transition-opacity cursor-pointer" title="2024: ₩320만"></div>
                                  <div className="w-6 bg-[hsl(var(--color-primary-300))] h-20 rounded-t hover:opacity-80 transition-opacity cursor-pointer" title="2023: ₩560만"></div>
                                </div>
                                <span className="text-xs text-gray-500">3월</span>
                              </div>
                              {/* 4월 */}
                              <div className="flex flex-col items-center gap-2">
                                <div className="flex items-end gap-1">
                                  <div className="w-6 bg-[hsl(var(--color-primary-500))] h-20 rounded-t hover:opacity-80 transition-opacity cursor-pointer" title="2024: ₩580만"></div>
                                  <div className="w-6 bg-[hsl(var(--color-primary-300))] h-16 rounded-t hover:opacity-80 transition-opacity cursor-pointer" title="2023: ₩450만"></div>
                                </div>
                                <span className="text-xs text-gray-500">4월</span>
                              </div>
                              {/* 5월 */}
                              <div className="flex flex-col items-center gap-2">
                                <div className="flex items-end gap-1">
                                  <div className="w-6 bg-[hsl(var(--color-primary-500))] h-32 rounded-t hover:opacity-80 transition-opacity cursor-pointer" title="2024: ₩920만"></div>
                                  <div className="w-6 bg-[hsl(var(--color-primary-300))] h-24 rounded-t hover:opacity-80 transition-opacity cursor-pointer" title="2023: ₩680만"></div>
                                </div>
                                <span className="text-xs text-gray-500">5월</span>
                              </div>
                              {/* 6월 */}
                              <div className="flex flex-col items-center gap-2">
                                <div className="flex items-end gap-1">
                                  <div className="w-6 bg-[hsl(var(--color-primary-500))] h-28 rounded-t hover:opacity-80 transition-opacity cursor-pointer" title="2024: ₩820만"></div>
                                  <div className="w-6 bg-[hsl(var(--color-primary-300))] h-22 rounded-t hover:opacity-80 transition-opacity cursor-pointer" title="2023: ₩620만"></div>
                                </div>
                                <span className="text-xs text-gray-500">6월</span>
                              </div>
                            </div>
                            {/* Y축 라벨 */}
                            <div className="absolute left-0 top-0 h-40 flex flex-col justify-between text-xs text-gray-500 -ml-2">
                              <span>₩1,000만</span>
                              <span>₩750만</span>
                              <span>₩500만</span>
                              <span>₩250만</span>
                              <span>₩0</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 수평 막대 차트 */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">수평 막대 차트</h4>
                        <div className="bg-white p-6 rounded-xl border border-gray-200">
                          <h5 className="text-lg font-semibold text-gray-900 mb-4">인기 카테고리</h5>
                          <div className="space-y-4">
                            <div className="flex items-center gap-4">
                              <div className="w-20 text-sm text-gray-700 text-right">전자제품</div>
                              <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                                <div className="bg-[hsl(var(--color-primary-500))] h-full rounded-full transition-all duration-700 ease-out" style={{width: '85%'}}></div>
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-white">85%</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="w-20 text-sm text-gray-700 text-right">의류</div>
                              <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                                <div className="bg-[hsl(var(--color-primary-400))] h-full rounded-full transition-all duration-700 ease-out" style={{width: '72%'}}></div>
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-white">72%</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="w-20 text-sm text-gray-700 text-right">도서</div>
                              <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                                <div className="bg-[hsl(var(--color-primary-600))] h-full rounded-full transition-all duration-700 ease-out" style={{width: '58%'}}></div>
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-white">58%</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="w-20 text-sm text-gray-700 text-right">홈&리빙</div>
                              <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                                <div className="bg-[hsl(var(--color-primary-300))] h-full rounded-full transition-all duration-700 ease-out" style={{width: '45%'}}></div>
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-600">45%</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="w-20 text-sm text-gray-700 text-right">스포츠</div>
                              <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                                <div className="bg-[hsl(var(--color-primary-200))] h-full rounded-full transition-all duration-700 ease-out" style={{width: '32%'}}></div>
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-600">32%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 스택 막대 차트 */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">스택 막대 차트</h4>
                        <div className="bg-white p-6 rounded-xl border border-gray-200">
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="text-lg font-semibold text-gray-900">프로젝트 진행률</h5>
                            <div className="flex gap-3 text-xs">
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-green-500 rounded"></div>
                                <span>완료</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-[hsl(var(--color-primary-500))] rounded"></div>
                                <span>진행중</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-gray-300 rounded"></div>
                                <span>대기</span>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-700">Design System</span>
                                <span className="text-gray-500">23/30 작업</span>
                              </div>
                              <div className="flex h-4 bg-gray-200 rounded-full overflow-hidden">
                                <div className="bg-green-500 transition-all duration-500" style={{width: '60%'}}></div>
                                <div className="bg-[hsl(var(--color-primary-500))] transition-all duration-500" style={{width: '17%'}}></div>
                                <div className="bg-gray-300 transition-all duration-500" style={{width: '23%'}}></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-700">Mobile App</span>
                                <span className="text-gray-500">18/25 작업</span>
                              </div>
                              <div className="flex h-4 bg-gray-200 rounded-full overflow-hidden">
                                <div className="bg-green-500 transition-all duration-500" style={{width: '48%'}}></div>
                                <div className="bg-[hsl(var(--color-primary-500))] transition-all duration-500" style={{width: '24%'}}></div>
                                <div className="bg-gray-300 transition-all duration-500" style={{width: '28%'}}></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-700">Web Platform</span>
                                <span className="text-gray-500">31/35 작업</span>
                              </div>
                              <div className="flex h-4 bg-gray-200 rounded-full overflow-hidden">
                                <div className="bg-green-500 transition-all duration-500" style={{width: '74%'}}></div>
                                <div className="bg-[hsl(var(--color-primary-500))] transition-all duration-500" style={{width: '15%'}}></div>
                                <div className="bg-gray-300 transition-all duration-500" style={{width: '11%'}}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Line Chart 미리보기 */}
                  {template.id === 'line-chart' && (
                    <div className="space-y-6">
                      {/* 기본 라인 차트 */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">기본 라인 차트</h4>
                        <div className="bg-white p-6 rounded-xl border border-gray-200">
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="text-lg font-semibold text-gray-900">방문자 추이</h5>
                            <div className="flex gap-2">
                              <button className="px-3 py-1 text-xs bg-[hsl(var(--color-primary-500))] text-white rounded-full">7일</button>
                              <button className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded-full transition-colors">30일</button>
                              <button className="px-3 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded-full transition-colors">90일</button>
                            </div>
                          </div>
                          <div className="relative h-40 bg-gradient-to-t from-[hsl(var(--color-primary-50))] to-transparent rounded-lg p-4">
                            <svg className="w-full h-full" viewBox="0 0 350 120">
                              {/* 그리드 라인 */}
                              <defs>
                                <pattern id="grid" width="50" height="24" patternUnits="userSpaceOnUse">
                                  <path d="M 50 0 L 0 0 0 24" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
                                </pattern>
                              </defs>
                              <rect width="100%" height="100%" fill="url(#grid)" />
                              
                              {/* 영역 그래디언트 */}
                              <defs>
                                <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                  <stop offset="0%" stopColor="hsl(var(--color-primary-500))" stopOpacity="0.3" />
                                  <stop offset="100%" stopColor="hsl(var(--color-primary-500))" stopOpacity="0.05" />
                                </linearGradient>
                              </defs>
                              
                              {/* 영역 */}
                              <path
                                fill="url(#areaGradient)"
                                d="M 30,90 L 70,60 L 110,70 L 150,35 L 190,50 L 230,25 L 270,45 L 310,20 L 310,120 L 30,120 Z"
                              />
                              
                              {/* 라인 */}
                              <polyline
                                fill="none"
                                stroke="hsl(var(--color-primary-500))"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                points="30,90 70,60 110,70 150,35 190,50 230,25 270,45 310,20"
                              />
                              
                              {/* 데이터 포인트 */}
                              <circle cx="30" cy="90" r="4" fill="white" stroke="hsl(var(--color-primary-500))" strokeWidth="2" />
                              <circle cx="70" cy="60" r="4" fill="white" stroke="hsl(var(--color-primary-500))" strokeWidth="2" />
                              <circle cx="110" cy="70" r="4" fill="white" stroke="hsl(var(--color-primary-500))" strokeWidth="2" />
                              <circle cx="150" cy="35" r="4" fill="white" stroke="hsl(var(--color-primary-500))" strokeWidth="2" />
                              <circle cx="190" cy="50" r="4" fill="white" stroke="hsl(var(--color-primary-500))" strokeWidth="2" />
                              <circle cx="230" cy="25" r="4" fill="white" stroke="hsl(var(--color-primary-500))" strokeWidth="2" />
                              <circle cx="270" cy="45" r="4" fill="white" stroke="hsl(var(--color-primary-500))" strokeWidth="2" />
                              <circle cx="310" cy="20" r="4" fill="white" stroke="hsl(var(--color-primary-500))" strokeWidth="2" />
                            </svg>
                            {/* X축 라벨 */}
                            <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 px-4">
                              <span>월</span>
                              <span>화</span>
                              <span>수</span>
                              <span>목</span>
                              <span>금</span>
                              <span>토</span>
                              <span>일</span>
                            </div>
                          </div>
                          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                            <div>
                              <div className="text-2xl font-bold text-gray-900">12.4K</div>
                              <div className="text-xs text-gray-500">총 방문자</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-green-600">+24%</div>
                              <div className="text-xs text-gray-500">증가율</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-gray-900">2.1K</div>
                              <div className="text-xs text-gray-500">평균 일일</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 다중 라인 차트 */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">다중 라인 차트</h4>
                        <div className="bg-white p-6 rounded-xl border border-gray-200">
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="text-lg font-semibold text-gray-900">매출 vs 비용</h5>
                            <div className="flex gap-3 text-xs">
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-[hsl(var(--color-primary-500))] rounded"></div>
                                <span>매출</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-red-500 rounded"></div>
                                <span>비용</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-green-500 rounded"></div>
                                <span>이익</span>
                              </div>
                            </div>
                          </div>
                          <div className="relative h-40 bg-gray-50 rounded-lg p-4">
                            <svg className="w-full h-full" viewBox="0 0 320 100">
                              {/* 매출 라인 */}
                              <polyline
                                fill="none"
                                stroke="hsl(var(--color-primary-500))"
                                strokeWidth="2.5"
                                strokeDasharray="none"
                                points="20,70 60,45 100,55 140,30 180,40 220,20 260,35 300,15"
                              />
                              {/* 비용 라인 */}
                              <polyline
                                fill="none"
                                stroke="#ef4444"
                                strokeWidth="2.5"
                                strokeDasharray="4,4"
                                points="20,80 60,65 100,70 140,55 180,60 220,45 260,55 300,40"
                              />
                              {/* 이익 라인 */}
                              <polyline
                                fill="none"
                                stroke="#22c55e"
                                strokeWidth="2.5"
                                strokeDasharray="8,2"
                                points="20,85 60,75 100,80 140,65 180,70 220,55 260,65 300,50"
                              />
                              
                              {/* 매출 포인트 */}
                              <circle cx="60" cy="45" r="3" fill="hsl(var(--color-primary-500))" />
                              <circle cx="140" cy="30" r="3" fill="hsl(var(--color-primary-500))" />
                              <circle cx="220" cy="20" r="3" fill="hsl(var(--color-primary-500))" />
                              <circle cx="300" cy="15" r="3" fill="hsl(var(--color-primary-500))" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* 실시간 차트 */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">실시간 모니터링</h4>
                        <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="text-lg font-semibold text-white">CPU 사용률</h5>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                              <span className="text-xs text-green-400">실시간</span>
                            </div>
                          </div>
                          <div className="relative h-32 bg-gray-800 rounded-lg p-4">
                            <svg className="w-full h-full" viewBox="0 0 300 80">
                              {/* 그리드 */}
                              <defs>
                                <pattern id="darkGrid" width="30" height="16" patternUnits="userSpaceOnUse">
                                  <path d="M 30 0 L 0 0 0 16" fill="none" stroke="#374151" strokeWidth="0.5"/>
                                </pattern>
                              </defs>
                              <rect width="100%" height="100%" fill="url(#darkGrid)" />
                              
                              {/* CPU 라인 */}
                              <polyline
                                fill="none"
                                stroke="#22d3ee"
                                strokeWidth="2"
                                points="0,60 30,45 60,50 90,30 120,40 150,25 180,35 210,20 240,30 270,15 300,25"
                              >
                                <animate attributeName="points" 
                                  values="0,60 30,45 60,50 90,30 120,40 150,25 180,35 210,20 240,30 270,15 300,25;
                                         0,50 30,55 60,40 90,45 120,30 150,35 180,25 210,30 240,20 270,25 300,15;
                                         0,60 30,45 60,50 90,30 120,40 150,25 180,35 210,20 240,30 270,15 300,25"
                                  dur="3s" repeatCount="indefinite"/>
                              </polyline>
                              
                              {/* 현재 값 표시 */}
                              <circle cx="300" cy="25" r="3" fill="#22d3ee">
                                <animate attributeName="cy" values="25;15;25" dur="3s" repeatCount="indefinite"/>
                              </circle>
                            </svg>
                            <div className="absolute top-2 right-2 text-2xl font-bold text-cyan-400">
                              <span className="animate-pulse">67</span><span className="text-sm">%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pie Chart 미리보기 */}
                  {template.id === 'pie-chart' && (
                    <div className="space-y-6">
                      {/* 기본 파이 차트 */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">기본 파이 차트</h4>
                        <div className="bg-white p-6 rounded-xl border border-gray-200">
                          <h5 className="text-lg font-semibold text-gray-900 mb-4">브라우저 점유율</h5>
                          <div className="flex items-center justify-center gap-8">
                            <div className="relative">
                              <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 42 42">
                                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#e5e7eb" strokeWidth="2" />
                                {/* Chrome - 45% */}
                                <circle cx="21" cy="21" r="15.915" fill="transparent" 
                                  stroke="hsl(var(--color-primary-500))" strokeWidth="2" 
                                  strokeDasharray="45 55" strokeDashoffset="0" 
                                  className="transition-all duration-1000" />
                                {/* Safari - 25% */}
                                <circle cx="21" cy="21" r="15.915" fill="transparent" 
                                  stroke="#06b6d4" strokeWidth="2" 
                                  strokeDasharray="25 75" strokeDashoffset="-45" 
                                  className="transition-all duration-1000" />
                                {/* Firefox - 20% */}
                                <circle cx="21" cy="21" r="15.915" fill="transparent" 
                                  stroke="#f59e0b" strokeWidth="2" 
                                  strokeDasharray="20 80" strokeDashoffset="-70" 
                                  className="transition-all duration-1000" />
                                {/* Edge - 10% */}
                                <circle cx="21" cy="21" r="15.915" fill="transparent" 
                                  stroke="#84cc16" strokeWidth="2" 
                                  strokeDasharray="10 90" strokeDashoffset="-90" 
                                  className="transition-all duration-1000" />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-gray-900">100%</div>
                                  <div className="text-xs text-gray-500">사용자</div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                                <div className="w-4 h-4 bg-[hsl(var(--color-primary-500))] rounded"></div>
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-900">Chrome</div>
                                  <div className="text-xs text-gray-500">45.2%</div>
                                </div>
                                <div className="text-sm font-semibold text-gray-900">2,840</div>
                              </div>
                              <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                                <div className="w-4 h-4 bg-cyan-500 rounded"></div>
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-900">Safari</div>
                                  <div className="text-xs text-gray-500">24.8%</div>
                                </div>
                                <div className="text-sm font-semibold text-gray-900">1,560</div>
                              </div>
                              <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                                <div className="w-4 h-4 bg-amber-500 rounded"></div>
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-900">Firefox</div>
                                  <div className="text-xs text-gray-500">19.7%</div>
                                </div>
                                <div className="text-sm font-semibold text-gray-900">1,240</div>
                              </div>
                              <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                                <div className="w-4 h-4 bg-lime-500 rounded"></div>
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-900">Edge</div>
                                  <div className="text-xs text-gray-500">9.3%</div>
                                </div>
                                <div className="text-sm font-semibold text-gray-900">580</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 도넛 차트 */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">도넛 차트</h4>
                        <div className="bg-white p-6 rounded-xl border border-gray-200">
                          <h5 className="text-lg font-semibold text-gray-900 mb-4">수익 분석</h5>
                          <div className="flex items-center justify-center gap-8">
                            <div className="relative">
                              <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 42 42">
                                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f3f4f6" strokeWidth="4" />
                                {/* 상품 판매 - 60% */}
                                <circle cx="21" cy="21" r="15.915" fill="transparent" 
                                  stroke="hsl(var(--color-primary-500))" strokeWidth="4" 
                                  strokeDasharray="60 40" strokeDashoffset="0" />
                                {/* 서비스 - 25% */}
                                <circle cx="21" cy="21" r="15.915" fill="transparent" 
                                  stroke="#8b5cf6" strokeWidth="4" 
                                  strokeDasharray="25 75" strokeDashoffset="-60" />
                                {/* 광고 - 15% */}
                                <circle cx="21" cy="21" r="15.915" fill="transparent" 
                                  stroke="#f59e0b" strokeWidth="4" 
                                  strokeDasharray="15 85" strokeDashoffset="-85" />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                  <div className="text-xl font-bold text-gray-900">₩850만</div>
                                  <div className="text-xs text-gray-500">총 수익</div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-[hsl(var(--color-primary-500))] rounded-full"></div>
                                    <span className="text-sm text-gray-700">상품 판매</span>
                                  </div>
                                  <span className="text-sm font-semibold text-gray-900">₩510만</span>
                                </div>
                                <div className="text-xs text-gray-500 ml-5">전월 대비 +12%</div>
                              </div>
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                    <span className="text-sm text-gray-700">서비스</span>
                                  </div>
                                  <span className="text-sm font-semibold text-gray-900">₩213만</span>
                                </div>
                                <div className="text-xs text-gray-500 ml-5">전월 대비 +8%</div>
                              </div>
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                                    <span className="text-sm text-gray-700">광고</span>
                                  </div>
                                  <span className="text-sm font-semibold text-gray-900">₩127만</span>
                                </div>
                                <div className="text-xs text-gray-500 ml-5">전월 대비 -3%</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 반원형 게이지 차트 */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">게이지 차트</h4>
                        <div className="bg-white p-6 rounded-xl border border-gray-200">
                          <h5 className="text-lg font-semibold text-gray-900 mb-4">목표 달성률</h5>
                          <div className="flex justify-center gap-8">
                            {/* 매출 게이지 */}
                            <div className="text-center">
                              <div className="relative">
                                <svg className="w-32 h-16" viewBox="0 0 100 50">
                                  <path d="M 10 40 A 30 30 0 0 1 90 40" stroke="#e5e7eb" strokeWidth="8" fill="none" strokeLinecap="round"/>
                                  <path d="M 10 40 A 30 30 0 0 1 90 40" stroke="hsl(var(--color-primary-500))" strokeWidth="8" fill="none" 
                                    strokeLinecap="round" strokeDasharray="94" strokeDashoffset="24" className="transition-all duration-1000"/>
                                </svg>
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                                  <div className="text-xl font-bold text-gray-900">75%</div>
                                </div>
                              </div>
                              <div className="text-sm text-gray-600 mt-2">매출 목표</div>
                            </div>
                            
                            {/* 고객 게이지 */}
                            <div className="text-center">
                              <div className="relative">
                                <svg className="w-32 h-16" viewBox="0 0 100 50">
                                  <path d="M 10 40 A 30 30 0 0 1 90 40" stroke="#e5e7eb" strokeWidth="8" fill="none" strokeLinecap="round"/>
                                  <path d="M 10 40 A 30 30 0 0 1 90 40" stroke="#22c55e" strokeWidth="8" fill="none" 
                                    strokeLinecap="round" strokeDasharray="94" strokeDashoffset="6" className="transition-all duration-1000"/>
                                </svg>
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                                  <div className="text-xl font-bold text-gray-900">94%</div>
                                </div>
                              </div>
                              <div className="text-sm text-gray-600 mt-2">고객 만족도</div>
                            </div>
                            
                            {/* 프로젝트 게이지 */}
                            <div className="text-center">
                              <div className="relative">
                                <svg className="w-32 h-16" viewBox="0 0 100 50">
                                  <path d="M 10 40 A 30 30 0 0 1 90 40" stroke="#e5e7eb" strokeWidth="8" fill="none" strokeLinecap="round"/>
                                  <path d="M 10 40 A 30 30 0 0 1 90 40" stroke="#f59e0b" strokeWidth="8" fill="none" 
                                    strokeLinecap="round" strokeDasharray="94" strokeDashoffset="41" className="transition-all duration-1000"/>
                                </svg>
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                                  <div className="text-xl font-bold text-gray-900">56%</div>
                                </div>
                              </div>
                              <div className="text-sm text-gray-600 mt-2">프로젝트 완료</div>
                            </div>
                          </div>
                        </div>
                      </div>
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
                    <div className="space-y-6">
                      {/* 기본 버튼들 */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">기본 버튼 변형</h4>
                        <div className="flex flex-wrap gap-3">
                          <button className="px-6 py-3 text-sm font-medium text-white bg-[hsl(var(--color-primary-500))] hover:bg-[hsl(var(--color-primary-600))] rounded-lg transition-all transform hover:scale-105 shadow-lg">
                            Primary
                          </button>
                          <button className="px-6 py-3 text-sm font-medium text-[hsl(var(--color-primary-500))] border-2 border-[hsl(var(--color-primary-500))] hover:bg-[hsl(var(--color-primary-50))] rounded-lg transition-all">
                            Outline
                          </button>
                          <button className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all">
                            Ghost
                          </button>
                          <button className="px-6 py-3 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all">
                            Destructive
                          </button>
                        </div>
                      </div>

                      {/* 크기별 버튼 */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">크기 변형</h4>
                        <div className="flex items-center flex-wrap gap-3">
                          <button className="px-3 py-1.5 text-xs font-medium text-white bg-[hsl(var(--color-primary-500))] rounded-md">
                            Extra Small
                          </button>
                          <button className="px-4 py-2 text-sm font-medium text-white bg-[hsl(var(--color-primary-500))] rounded-lg">
                            Small
                          </button>
                          <button className="px-6 py-3 text-base font-medium text-white bg-[hsl(var(--color-primary-500))] rounded-lg">
                            Medium
                          </button>
                          <button className="px-8 py-4 text-lg font-medium text-white bg-[hsl(var(--color-primary-500))] rounded-xl">
                            Large
                          </button>
                        </div>
                      </div>

                      {/* 아이콘 버튼들 */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">아이콘 버튼</h4>
                        <div className="flex flex-wrap gap-3">
                          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[hsl(var(--color-primary-500))] hover:bg-[hsl(var(--color-primary-600))] rounded-lg transition-all">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            새로 만들기
                          </button>
                          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-lg transition-all">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            저장하기
                          </button>
                          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 012 0v4a1 1 0 11-2 0V7zM12 7a1 1 0 012 0v4a1 1 0 11-2 0V7z" clipRule="evenodd" />
                            </svg>
                            삭제하기
                          </button>
                        </div>
                      </div>

                      {/* 아이콘 전용 버튼 */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">아이콘 전용 버튼</h4>
                        <div className="flex items-center gap-3">
                          <button className="p-2 text-white bg-[hsl(var(--color-primary-500))] hover:bg-[hsl(var(--color-primary-600))] rounded-lg transition-all">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </button>
                          <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* 상태별 버튼 */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">상태별 버튼</h4>
                        <div className="flex flex-wrap gap-3">
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
                          <button className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all">
                            정보
                          </button>
                          <button className="px-4 py-2 text-sm font-medium text-yellow-600 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-all">
                            경고
                          </button>
                        </div>
                      </div>

                      {/* 플로팅 액션 버튼 */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">플로팅 액션 버튼</h4>
                        <div className="flex items-center gap-4">
                          <button className="w-14 h-14 bg-[hsl(var(--color-primary-500))] hover:bg-[hsl(var(--color-primary-600))] text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110 flex items-center justify-center">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button className="w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110 flex items-center justify-center">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                            </svg>
                          </button>
                          <button className="w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-110 flex items-center justify-center">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Input 미리보기 */}
                  {template.id === 'enhanced-input' && (
                    <div className="space-y-6">
                      {/* 기본 입력 필드들 */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">기본 입력 필드</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">텍스트 입력</label>
                            <input 
                              type="text" 
                              placeholder="텍스트를 입력하세요"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary-500))] focus:border-[hsl(var(--color-primary-500))] transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                            <input 
                              type="email" 
                              placeholder="email@example.com"
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">숫자</label>
                            <input 
                              type="number" 
                              placeholder="0"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary-500))] focus:border-[hsl(var(--color-primary-500))] transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 아이콘이 있는 입력 필드들 */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">아이콘 입력 필드</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">이메일 주소</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                </svg>
                              </div>
                              <input 
                                type="email" 
                                placeholder="name@company.com"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary-500))] focus:border-[hsl(var(--color-primary-500))] transition-all"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">전화번호</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                              </div>
                              <input 
                                type="tel" 
                                placeholder="010-1234-5678"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary-500))] focus:border-[hsl(var(--color-primary-500))] transition-all"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 고급 입력 필드들 */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">고급 입력 필드</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">메시지</label>
                            <textarea 
                              placeholder="메시지를 입력하세요..."
                              rows={4}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary-500))] focus:border-[hsl(var(--color-primary-500))] transition-all resize-none"
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">국가</label>
                              <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary-500))] focus:border-[hsl(var(--color-primary-500))] transition-all">
                                <option>선택하세요</option>
                                <option>대한민국</option>
                                <option>미국</option>
                                <option>일본</option>
                                <option>중국</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">날짜</label>
                              <input 
                                type="date" 
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-primary-500))] focus:border-[hsl(var(--color-primary-500))] transition-all"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 상태별 입력 필드 */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">상태별 입력 필드</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">성공 상태</label>
                            <input 
                              type="text" 
                              placeholder="올바른 입력"
                              className="w-full px-4 py-3 border-2 border-green-300 bg-green-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                            />
                            <p className="text-sm text-green-600 mt-1">✓ 입력이 올바릅니다</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">오류 상태</label>
                            <input 
                              type="text" 
                              placeholder="잘못된 입력"
                              className="w-full px-4 py-3 border-2 border-red-300 bg-red-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                            />
                            <p className="text-sm text-red-600 mt-1">✗ 입력을 확인해주세요</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">비활성화 상태</label>
                            <input 
                              type="text" 
                              placeholder="비활성화된 입력"
                              disabled
                              className="w-full px-4 py-3 border border-gray-300 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 체크박스와 라디오 */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">선택 입력</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">관심사 (복수 선택)</label>
                            <div className="space-y-2">
                              <label className="flex items-center">
                                <input 
                                  type="checkbox" 
                                  className="w-4 h-4 text-[hsl(var(--color-primary-500))] border-gray-300 rounded focus:ring-[hsl(var(--color-primary-500))]"
                                />
                                <span className="ml-2 text-sm text-gray-700">웹 개발</span>
                              </label>
                              <label className="flex items-center">
                                <input 
                                  type="checkbox" 
                                  className="w-4 h-4 text-[hsl(var(--color-primary-500))] border-gray-300 rounded focus:ring-[hsl(var(--color-primary-500))]"
                                />
                                <span className="ml-2 text-sm text-gray-700">모바일 앱</span>
                              </label>
                              <label className="flex items-center">
                                <input 
                                  type="checkbox" 
                                  className="w-4 h-4 text-[hsl(var(--color-primary-500))] border-gray-300 rounded focus:ring-[hsl(var(--color-primary-500))]"
                                />
                                <span className="ml-2 text-sm text-gray-700">데이터 분석</span>
                              </label>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">경력 수준 (단일 선택)</label>
                            <div className="space-y-2">
                              <label className="flex items-center">
                                <input 
                                  type="radio" 
                                  name="experience" 
                                  className="w-4 h-4 text-[hsl(var(--color-primary-500))] border-gray-300 focus:ring-[hsl(var(--color-primary-500))]"
                                />
                                <span className="ml-2 text-sm text-gray-700">초급 (1-2년)</span>
                              </label>
                              <label className="flex items-center">
                                <input 
                                  type="radio" 
                                  name="experience" 
                                  className="w-4 h-4 text-[hsl(var(--color-primary-500))] border-gray-300 focus:ring-[hsl(var(--color-primary-500))]"
                                />
                                <span className="ml-2 text-sm text-gray-700">중급 (3-5년)</span>
                              </label>
                              <label className="flex items-center">
                                <input 
                                  type="radio" 
                                  name="experience" 
                                  className="w-4 h-4 text-[hsl(var(--color-primary-500))] border-gray-300 focus:ring-[hsl(var(--color-primary-500))]"
                                />
                                <span className="ml-2 text-sm text-gray-700">고급 (5년+)</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Modal 미리보기 */}
                  {template.id === 'enhanced-modal' && (
                    <div className="space-y-6">
                      {/* 기본 확인 모달 */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">기본 확인 모달 (Small)</h4>
                        <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 max-w-sm">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">확인</h3>
                            <button className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          <p className="text-gray-600 mb-6">정말로 이 작업을 수행하시겠습니까?</p>
                          <div className="flex justify-end gap-3">
                            <button className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                              취소
                            </button>
                            <button className="px-4 py-2 text-sm font-medium text-white bg-[hsl(var(--color-primary-500))] rounded-lg hover:bg-[hsl(var(--color-primary-600))] transition-colors">
                              확인
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* 경고 삭제 모달 */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">경고 삭제 모달 (Medium)</h4>
                        <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 max-w-md">
                          <div className="flex items-start gap-4 mb-6">
                            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">파일 삭제</h3>
                              <p className="text-gray-600 text-sm">
                                <strong>design-system.zip</strong> 파일을 삭제하시겠습니까? 
                                <br />이 작업은 되돌릴 수 없습니다.
                              </p>
                            </div>
                            <button className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          <div className="flex justify-end gap-3">
                            <button className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                              취소
                            </button>
                            <button className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">
                              삭제
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* 성공 알림 모달 */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">성공 알림 모달 (Large)</h4>
                        <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 max-w-lg">
                          <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">테마 저장 완료!</h3>
                            <p className="text-gray-600">
                              &quot;Modern Blue Theme&quot;이 성공적으로 저장되었습니다.<br />
                              이제 디자인 시스템을 다운로드하거나 팀과 공유할 수 있습니다.
                            </p>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <button className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                              나중에
                            </button>
                            <button className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[hsl(var(--color-primary-500))] rounded-lg hover:bg-[hsl(var(--color-primary-600))] transition-colors">
                              다운로드
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* 폼 입력 모달 */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">폼 입력 모달 (Extra Large)</h4>
                        <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 max-w-xl">
                          <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-6">
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900">새 프로젝트 생성</h3>
                              <p className="text-sm text-gray-500 mt-1">프로젝트 정보를 입력하여 새로운 디자인 시스템을 시작하세요</p>
                            </div>
                            <button className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          
                          <div className="space-y-4 mb-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">프로젝트 이름 *</label>
                              <input 
                                type="text" 
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[hsl(var(--color-primary-500))] focus:border-transparent transition-all"
                                placeholder="예: E-commerce Design System"
                                defaultValue="My Awesome Project"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">설명</label>
                              <textarea 
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[hsl(var(--color-primary-500))] focus:border-transparent transition-all resize-none"
                                placeholder="프로젝트에 대한 간단한 설명을 입력하세요..."
                                defaultValue="온라인 쇼핑몰을 위한 모던하고 일관된 디자인 시스템"
                              />
                            </div>
                            <div className="flex gap-4">
                              <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">템플릿</label>
                                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[hsl(var(--color-primary-500))] focus:border-transparent transition-all">
                                  <option>Material Design</option>
                                  <option>Modern Minimal</option>
                                  <option>Corporate</option>
                                  <option>Custom</option>
                                </select>
                              </div>
                              <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">색상 테마</label>
                                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[hsl(var(--color-primary-500))] focus:border-transparent transition-all">
                                  <option>Blue</option>
                                  <option>Green</option>
                                  <option>Purple</option>
                                  <option>Custom</option>
                                </select>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <input type="checkbox" id="public-project" className="w-4 h-4 text-[hsl(var(--color-primary-500))] border-gray-300 rounded focus:ring-[hsl(var(--color-primary-500))]" />
                              <label htmlFor="public-project" className="text-sm text-gray-700">
                                공개 프로젝트로 생성 (다른 사용자가 볼 수 있습니다)
                              </label>
                            </div>
                          </div>
                          
                          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                            <button className="px-6 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                              취소
                            </button>
                            <button className="px-6 py-2 text-sm font-medium text-white bg-[hsl(var(--color-primary-500))] rounded-lg hover:bg-[hsl(var(--color-primary-600))] transition-colors">
                              프로젝트 생성
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* 설정 모달 */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">설정 모달 (Full Width)</h4>
                        <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 w-full max-w-4xl">
                          <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-6">
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900">테마 설정</h3>
                              <p className="text-sm text-gray-500 mt-1">디자인 시스템의 전반적인 설정을 관리합니다</p>
                            </div>
                            <button className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* 색상 설정 */}
                            <div className="space-y-4">
                              <h4 className="text-sm font-semibold text-gray-900">색상 팔레트</h4>
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-2">Primary</label>
                                  <div className="flex gap-2">
                                    <div className="w-8 h-8 bg-blue-500 rounded border-2 border-gray-200"></div>
                                    <input type="text" className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500" defaultValue="#3B82F6" />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-2">Secondary</label>
                                  <div className="flex gap-2">
                                    <div className="w-8 h-8 bg-gray-500 rounded border-2 border-gray-200"></div>
                                    <input type="text" className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500" defaultValue="#6B7280" />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* 타이포그래피 설정 */}
                            <div className="space-y-4">
                              <h4 className="text-sm font-semibold text-gray-900">타이포그래피</h4>
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-2">본문 폰트</label>
                                  <select className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500">
                                    <option>Inter</option>
                                    <option>Roboto</option>
                                    <option>Open Sans</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-2">제목 폰트</label>
                                  <select className="w-full px-3 py-2 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500">
                                    <option>Inter</option>
                                    <option>Poppins</option>
                                    <option>Playfair Display</option>
                                  </select>
                                </div>
                              </div>
                            </div>

                            {/* 간격 설정 */}
                            <div className="space-y-4">
                              <h4 className="text-sm font-semibold text-gray-900">간격 & 크기</h4>
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-2">기본 간격</label>
                                  <input type="range" min="4" max="16" defaultValue="8" className="w-full" />
                                  <div className="flex justify-between text-xs text-gray-500">
                                    <span>4px</span>
                                    <span>16px</span>
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-2">둥근 모서리</label>
                                  <input type="range" min="0" max="16" defaultValue="8" className="w-full" />
                                  <div className="flex justify-between text-xs text-gray-500">
                                    <span>0px</span>
                                    <span>16px</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-6">
                            <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                              기본값으로 복원
                            </button>
                            <div className="flex gap-3">
                              <button className="px-6 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                취소
                              </button>
                              <button className="px-6 py-2 text-sm font-medium text-white bg-[hsl(var(--color-primary-500))] rounded-lg hover:bg-[hsl(var(--color-primary-600))] transition-colors">
                                설정 저장
                              </button>
                            </div>
                          </div>
                        </div>
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

                  {/* Profile Card 미리보기 */}
                  {template.id === 'profile-card' && (
                    <div className="space-y-6">
                      {/* Compact Profile Card */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">컴팩트 프로필 카드</h4>
                        <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-4 max-w-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <img
                                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face"
                                alt="John Doe"
                                className="w-12 h-12 rounded-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/john/400/400'
                                }}
                              />
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 truncate">John Doe</h3>
                              <p className="text-sm text-gray-600 truncate">Frontend Developer</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Default Profile Card */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">기본 프로필 카드</h4>
                        <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 max-w-md hover:shadow-md transition-shadow">
                          <div className="flex items-start gap-4">
                            <div className="relative">
                              <img
                                src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face"
                                alt="Sarah Wilson"
                                className="w-16 h-16 rounded-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/sarah/400/400'
                                }}
                              />
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900">Sarah Wilson</h3>
                              <p className="text-gray-600 mb-2">UX/UI Designer</p>
                              <p className="text-sm text-gray-600">5년차 디자이너로 사용자 중심의 인터페이스 설계를 전문으로 합니다.</p>
                            </div>
                          </div>
                          
                          <div className="flex justify-around pt-4 mt-4 border-t border-gray-100">
                            <div className="text-center">
                              <div className="text-lg font-bold text-gray-900">128</div>
                              <div className="text-xs text-gray-500">프로젝트</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-gray-900">2.4K</div>
                              <div className="text-xs text-gray-500">팔로워</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-gray-900">4.8</div>
                              <div className="text-xs text-gray-500">평점</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Detailed Profile Card */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">상세 프로필 카드</h4>
                        <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden hover:shadow-lg transition-shadow max-w-sm">
                          {/* Cover Image */}
                          <div className="relative h-32 bg-gradient-to-r from-[hsl(var(--color-primary-500))] to-[hsl(var(--color-primary-600))]">
                            <img
                              src="https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=200&fit=crop"
                              alt="Cover"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/cover/800/200'
                              }}
                            />
                            <div className="absolute inset-0 bg-black/20"></div>
                          </div>
                          
                          {/* Profile Info */}
                          <div className="relative px-6 pb-6">
                            {/* Avatar */}
                            <div className="flex justify-center -mt-8 mb-4">
                              <div className="relative">
                                <img
                                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"
                                  alt="Alex Chen"
                                  className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/alex/400/400'
                                  }}
                                />
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                              </div>
                            </div>
                            
                            {/* Name & Title */}
                            <div className="text-center mb-4">
                              <h3 className="text-xl font-bold text-gray-900">Alex Chen</h3>
                              <p className="text-gray-600">Full Stack Developer</p>
                            </div>
                            
                            {/* Bio */}
                            <p className="text-sm text-gray-600 text-center mb-4 leading-relaxed">
                              10년 경력의 풀스택 개발자입니다. React, Node.js, Python을 주로 사용합니다.
                            </p>
                            
                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                              <div className="text-center">
                                <div className="text-lg font-bold text-gray-900">45</div>
                                <div className="text-xs text-gray-500">프로젝트</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-gray-900">1.2K</div>
                                <div className="text-xs text-gray-500">팔로워</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-gray-900">4.9</div>
                                <div className="text-xs text-gray-500">평점</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Product Card 미리보기 */}
                  {template.id === 'product-card' && (
                    <div className="space-y-6">
                      {/* Compact Product Card */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">컴팩트 제품 카드</h4>
                        <div className="bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden hover:shadow-md transition-shadow max-w-xs">
                          <div className="flex">
                            <div className="relative w-24 h-24 flex-shrink-0">
                              <img
                                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop"
                                alt="Wireless Headphones"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/headphones/400/300'
                                }}
                              />
                              <div className="absolute top-1 left-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded">
                                15%
                              </div>
                            </div>
                            <div className="p-3 flex-1">
                              <h3 className="font-medium text-gray-900 text-sm line-clamp-2">무선 블루투스 헤드폰</h3>
                              <div className="flex items-center gap-1 mt-1">
                                <span className="text-lg font-bold text-[hsl(var(--color-primary-600))]">₩89,000</span>
                                <span className="text-sm text-gray-500 line-through">₩105,000</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Default Product Card */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">기본 제품 카드</h4>
                        <div className="bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden hover:shadow-md transition-shadow max-w-sm">
                          <div className="relative">
                            <div className="relative h-48 bg-gray-100">
                              <img
                                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop"
                                alt="Running Shoes"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/shoes/400/300'
                                }}
                              />
                              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                                20% 할인
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-4">
                            <span className="text-xs text-[hsl(var(--color-primary-600))] font-medium">
                              스포츠
                            </span>
                            <h3 className="font-semibold text-gray-900 mt-1 mb-2">프리미엄 러닝화</h3>
                            
                            <div className="flex items-center gap-1 mb-2">
                              <div className="flex items-center">
                                {[1,2,3,4,5].map((star) => (
                                  <svg
                                    key={star}
                                    className={`w-4 h-4 ${star <= 4 ? 'text-yellow-400' : 'text-gray-300'}`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                              <span className="text-sm text-gray-600">(128)</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-[hsl(var(--color-primary-600))]">₩159,000</span>
                                <span className="text-sm text-gray-500 line-through">₩199,000</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Featured Product Card */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">프리미엄 제품 카드</h4>
                        <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] max-w-sm">
                          <div className="relative">
                            <div className="relative h-64 bg-gray-100">
                              <img
                                src="https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=300&fit=crop"
                                alt="Laptop"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/laptop/400/300'
                                }}
                              />
                              <div className="absolute top-3 left-3 bg-red-500 text-white text-sm px-2 py-1 rounded-lg font-medium">
                                신제품
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-6">
                            <span className="text-xs text-[hsl(var(--color-primary-600))] font-medium uppercase tracking-wide">
                              컴퓨터
                            </span>
                            <h3 className="text-xl font-bold text-gray-900 mt-2 mb-3">MacBook Pro 16인치</h3>
                            
                            <div className="flex items-center gap-2 mb-3">
                              <div className="flex items-center">
                                {[1,2,3,4,5].map((star) => (
                                  <svg
                                    key={star}
                                    className="w-4 h-4 text-yellow-400"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                              <span className="text-sm text-gray-600">(42)</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-[hsl(var(--color-primary-600))]">₩3,590,000</span>
                              </div>
                              <button className="bg-[hsl(var(--color-primary-500))] text-white px-4 py-2 rounded-lg hover:bg-[hsl(var(--color-primary-600))] transition-colors">
                                구매하기
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Blog Card 미리보기 */}
                  {template.id === 'blog-card' && (
                    <div className="space-y-6">
                      {/* Horizontal Blog Card */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">가로형 블로그 카드</h4>
                        <div className="bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden hover:shadow-md transition-shadow max-w-md">
                          <div className="flex">
                            <div className="relative w-48 h-32 flex-shrink-0">
                              <img
                                src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&h=400&fit=crop"
                                alt="React Development"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/react/600/400'
                                }}
                              />
                              <div className="absolute top-2 left-2 bg-[hsl(var(--color-primary-500))] text-white text-xs px-2 py-1 rounded">
                                개발
                              </div>
                            </div>
                            <div className="p-4 flex-1">
                              <h3 className="font-bold text-gray-900 text-lg line-clamp-2 mb-2">React 18의 새로운 기능들</h3>
                              <p className="text-gray-600 text-sm line-clamp-2 mb-3">Concurrent Features와 Suspense의 개선된 기능을 살펴봅니다.</p>
                              
                              <div className="flex items-center justify-between text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                  <img
                                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
                                    alt="김개발"
                                    className="w-6 h-6 rounded-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/kim/100/100'
                                    }}
                                  />
                                  <span>김개발</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span>2024.01.15</span>
                                  <span>• 5분 읽기</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Default Blog Card */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">기본 블로그 카드</h4>
                        <div className="bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden hover:shadow-md transition-shadow max-w-sm">
                          <div className="relative">
                            <div className="relative h-48 bg-gray-100">
                              <img
                                src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop"
                                alt="Web Design"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/design/600/400'
                                }}
                              />
                              <div className="absolute top-3 left-3 bg-[hsl(var(--color-primary-500))] text-white text-sm px-3 py-1 rounded-full">
                                디자인
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-6">
                            <h3 className="font-bold text-gray-900 text-lg mb-2">2024 웹 디자인 트렌드</h3>
                            <p className="text-gray-600 mb-4 leading-relaxed">올해 주목해야 할 웹 디자인 트렌드와 실무에 적용하는 방법을 알아봅시다.</p>
                            
                            <div className="flex flex-wrap gap-2 mb-4">
                              <span className="text-xs bg-[hsl(var(--color-secondary-100))] text-[hsl(var(--color-secondary-700))] px-2 py-1 rounded">
                                #웹디자인
                              </span>
                              <span className="text-xs bg-[hsl(var(--color-secondary-100))] text-[hsl(var(--color-secondary-700))] px-2 py-1 rounded">
                                #트렌드
                              </span>
                              <span className="text-xs bg-[hsl(var(--color-secondary-100))] text-[hsl(var(--color-secondary-700))] px-2 py-1 rounded">
                                #2024
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <img
                                  src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
                                  alt="이디자인"
                                  className="w-10 h-10 rounded-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/lee/100/100'
                                  }}
                                />
                                <div>
                                  <div className="text-sm font-medium text-gray-900">이디자인</div>
                                  <div className="text-xs text-gray-500">2024.01.10</div>
                                </div>
                              </div>
                              <span className="text-sm text-gray-500">8분 읽기</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Minimal Blog Card */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">미니멀 블로그 카드</h4>
                        <div className="bg-white rounded-lg border border-gray-200 shadow-lg p-6 hover:shadow-md transition-shadow max-w-md">
                          <span className="text-xs text-[hsl(var(--color-primary-600))] font-medium uppercase tracking-wide">
                            기술
                          </span>
                          <h3 className="font-bold text-gray-900 text-xl mt-2 mb-3">TypeScript 5.0 마이그레이션 가이드</h3>
                          <p className="text-gray-600 mb-4 leading-relaxed">기존 프로젝트를 TypeScript 5.0으로 업그레이드하는 방법과 주의사항을 상세히 설명합니다.</p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <img
                                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
                                alt="박타입"
                                className="w-8 h-8 rounded-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/park/100/100'
                                }}
                              />
                              <div>
                                <div className="text-sm font-medium text-gray-900">박타입</div>
                                <div className="text-xs text-gray-500">2024.01.05</div>
                              </div>
                            </div>
                            <span className="text-sm text-gray-500">12분 읽기</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Gallery 미리보기 */}
                  {template.id === 'gallery' && (
                    <div className="space-y-6">
                      {/* Grid Gallery */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">그리드 갤러리</h4>
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg">
                          <div className="grid grid-cols-3 gap-4">
                            {[
                              { src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop', title: '산의 풍경' },
                              { src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop', title: '숲속 길' },
                              { src: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=300&h=300&fit=crop', title: '호수 반영' },
                              { src: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300&h=300&fit=crop', title: '석양 풍경' },
                              { src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=300&fit=crop', title: '바다 파도' },
                              { src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=300&fit=crop', title: '꽃밭' }
                            ].map((image, index) => (
                              <div key={index} className="group cursor-pointer">
                                <div className="relative overflow-hidden rounded-lg bg-gray-100 aspect-square">
                                  <img
                                    src={image.src}
                                    alt={image.title}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = `https://picsum.photos/seed/gallery-${index}/300/300`
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                                    <h3 className="text-white font-medium text-sm">{image.title}</h3>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Carousel Gallery */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">캐러셀 갤러리</h4>
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg">
                          <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory">
                            {[
                              { src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=320&h=240&fit=crop', title: '여행 사진 1' },
                              { src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=320&h=240&fit=crop', title: '여행 사진 2' },
                              { src: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=320&h=240&fit=crop', title: '여행 사진 3' },
                              { src: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=320&h=240&fit=crop', title: '여행 사진 4' }
                            ].map((image, index) => (
                              <div key={index} className="flex-shrink-0 w-80 snap-start cursor-pointer">
                                <div className="relative overflow-hidden rounded-lg bg-gray-100 h-60">
                                  <img
                                    src={image.src}
                                    alt={image.title}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = `https://picsum.photos/seed/carousel-${index}/320/240`
                                    }}
                                  />
                                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                                    <h3 className="text-white font-medium">{image.title}</h3>
                                  </div>
                                </div>
                              </div>
                            ))}
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
                    'enhanced-button', 'enhanced-input', 'enhanced-modal', 'typography',
                    'profile-card', 'product-card', 'blog-card', 'gallery'
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

      {/* Save Design System Modal */}
      <SaveDesignSystemModal
        isOpen={showSaveDesignSystemModal}
        onClose={() => {
          setShowSaveDesignSystemModal(false)
          setCurrentDesignSystem(null)
        }}
        themeData={currentTheme}
        selectedComponents={selectedComponents}
        componentSettings={componentSettings}
        existingDesignSystem={currentDesignSystem ? {
          id: currentDesignSystem.id,
          name: currentDesignSystem.name,
          description: currentDesignSystem.description,
          tags: currentDesignSystem.tags,
          is_public: currentDesignSystem.is_public
        } : undefined}
      />

      {/* Saved Design Systems Modal */}
      <SavedDesignSystems
        isOpen={showSavedDesignSystems}
        onClose={() => setShowSavedDesignSystems(false)}
        onLoadDesignSystem={handleLoadDesignSystem}
        onEditDesignSystem={handleEditDesignSystem}
        onViewVersionHistory={handleViewVersionHistory}
        onShareDesignSystem={handleShareDesignSystem}
      />

      {/* Version History Modal */}
      {versionHistoryDesignSystem && (
        <VersionHistoryModal
          isOpen={showVersionHistory}
          onClose={() => {
            setShowVersionHistory(false)
            setVersionHistoryDesignSystem(null)
          }}
          designSystem={versionHistoryDesignSystem}
          onLoadVersion={handleLoadVersion}
          onCreateVersion={handleCreateVersion}
        />
      )}

      {/* Share Modal */}
      {shareDesignSystem && (
        <ShareDesignSystemModal
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false)
            setShareDesignSystem(null)
          }}
          designSystem={shareDesignSystem}
        />
      )}

      {/* Discover Design Systems Modal */}
      <DiscoverDesignSystems
        isOpen={showDiscoverSystems}
        onClose={() => setShowDiscoverSystems(false)}
        onCloneDesignSystem={handleCloneDesignSystem}
        onViewDesignSystem={handleViewDiscoveredSystem}
      />

      {/* AI Recommendations Modal */}
      {showAIRecommendations && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowAIRecommendations(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">🤖 AI 기반 디자인 추천</h2>
              <button
                onClick={() => setShowAIRecommendations(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <AIRecommendations
                currentTheme={currentTheme}
                onThemeUpdate={handleAIThemeUpdate}
              />
            </div>
          </div>
        </div>
      )}

      {/* Collaboration Hub Modal */}
      {showCollaboration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowCollaboration(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">🤝 팀 협업</h2>
              <button
                onClick={() => setShowCollaboration(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <CollaborationHub
                themeId={currentDesignSystem?.id || 'temp-theme-id'}
                currentTheme={currentTheme}
                onThemeUpdate={handleAIThemeUpdate}
              />
            </div>
          </div>
        </div>
      )}

      {/* Performance Hub Modal */}
      {showPerformance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowPerformance(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">⚡ 성능 최적화</h2>
              <button
                onClick={() => setShowPerformance(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <PerformanceHub
                components={componentTemplates}
                onOptimizationApply={(suggestion) => {
                  success(`${suggestion.title} 최적화가 적용되었습니다!`)
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tools Hub Modal */}
      {showTools && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowTools(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">🛠️ 디자인 도구</h2>
              <button
                onClick={() => setShowTools(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <ToolsHub
                theme={currentTheme}
                onToolAction={(tool, action, data) => {
                  console.log('Tool action:', tool, action, data)
                  success(`${tool} 도구에서 ${action} 작업이 완료되었습니다!`)
                }}
              />
            </div>
          </div>
        </div>
      )}

      <Toast 
        message={toast.message} 
        type={toast.type} 
        isVisible={toast.isVisible} 
        onClose={hideToast} 
      />
    </ProtectedRoute>
  )
}