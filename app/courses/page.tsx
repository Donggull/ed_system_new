'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Link from 'next/link'

interface ComponentTemplate {
  id: number
  name: string
  description: string
  framework: string
  category: string
  complexity: string
  complexity_level: 'basic' | 'intermediate' | 'advanced'
  status: 'active' | 'draft' | 'archived'
  usageCount: number
  rating: number
  size: string
  preview: string
  createdDate: string
}

export default function Components() {
  const { user } = useAuth()
  const [components, setComponents] = useState<ComponentTemplate[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterComplexity, setFilterComplexity] = useState<string>('all')
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 가상의 컴포넌트 템플릿 데이터
    const mockComponents: ComponentTemplate[] = [
      {
        id: 1,
        name: '기본 버튼',
        description: '다양한 스타일과 크기를 지원하는 재사용 가능한 버튼 컴포넌트입니다.',
        framework: 'React',
        category: 'UI 요소',
        complexity: '기본적인 프롭스와 이벤트 핸들링',
        complexity_level: 'basic',
        status: 'active',
        usageCount: 245,
        rating: 4.8,
        size: '2.5KB',
        preview: '/previews/button.png',
        createdDate: '2024-01-15'
      },
      {
        id: 2,
        name: '네비게이션 바',
        description: '반응형 디자인을 지원하는 모던한 네비게이션 바 컴포넌트입니다.',
        framework: 'React',
        category: '내비게이션',
        complexity: '복잡한 상태 관리와 반응형 로직',
        complexity_level: 'intermediate',
        status: 'active',
        usageCount: 198,
        rating: 4.9,
        size: '8.2KB',
        preview: '/previews/navbar.png',
        createdDate: '2024-02-01'
      },
      {
        id: 3,
        name: '데이터 테이블',
        description: '정렬, 필터링, 페이지네이션을 지원하는 고급 데이터 테이블 컴포넌트입니다.',
        framework: 'React',
        category: '데이터 표시',
        complexity: '고급 상태 관리와 성능 최적화',
        complexity_level: 'advanced',
        status: 'active',
        usageCount: 176,
        rating: 4.6,
        size: '15.7KB',
        preview: '/previews/datatable.png',
        createdDate: '2024-01-20'
      },
      {
        id: 4,
        name: '폼 입력 필드',
        description: '유효성 검사와 에러 표시 기능을 포함한 폼 입력 필드 컴포넌트입니다.',
        framework: 'Vue',
        category: '폼 요소',
        complexity: '폼 유효성 검사와 에러 핸들링',
        complexity_level: 'intermediate',
        status: 'active',
        usageCount: 154,
        rating: 4.5,
        size: '6.3KB',
        preview: '/previews/input.png',
        createdDate: '2024-02-15'
      },
      {
        id: 5,
        name: '모달 다이얼로그',
        description: '접근성을 고려한 모달 다이얼로그 컴포넌트입니다.',
        framework: 'Angular',
        category: '오버레이',
        complexity: '접근성과 포커스 관리',
        complexity_level: 'advanced',
        status: 'draft',
        usageCount: 0,
        rating: 0,
        size: '12.1KB',
        preview: '/previews/modal.png',
        createdDate: '2024-03-01'
      },
      {
        id: 6,
        name: '카드 컴포넌트',
        description: '다양한 레이아웃을 지원하는 유연한 카드 컴포넌트입니다.',
        framework: 'React',
        category: '레이아웃',
        complexity: '기본적인 슬롯과 스타일링',
        complexity_level: 'basic',
        status: 'archived',
        usageCount: 132,
        rating: 4.4,
        size: '4.8KB',
        preview: '/previews/card.png',
        createdDate: '2023-12-01'
      }
    ]

    setTimeout(() => {
      setComponents(mockComponents)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredComponents = components.filter(component => {
    const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         component.framework.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         component.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || component.category === filterCategory
    const matchesComplexity = filterComplexity === 'all' || component.complexity_level === filterComplexity
    return matchesSearch && matchesCategory && matchesComplexity
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'archived':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '진행중'
      case 'draft':
        return '준비중'
      case 'archived':
        return '보관됨'
      default:
        return '알 수 없음'
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'basic':
        return 'bg-blue-100 text-blue-800'
      case 'intermediate':
        return 'bg-purple-100 text-purple-800'
      case 'advanced':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getComplexityText = (complexity: string) => {
    switch (complexity) {
      case 'basic':
        return '기본'
      case 'intermediate':
        return '중급'
      case 'advanced':
        return '고급'
      default:
        return '알 수 없음'
    }
  }

  const categories = [...new Set(components.map(component => component.category))]

  // Alias for compatibility with existing display code
  const courses = components
  const filteredCourses = filteredComponents

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-sm font-bold">ED</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">디자인 시스템</h1>
                  <p className="text-xs text-gray-500">Design System Generator</p>
                </div>
              </div>

              <nav className="space-y-2">
                <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM14 16a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" />
                  </svg>
                  대시보드
                </Link>
                <Link href="/themes" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4z" clipRule="evenodd" />
                    <path d="M10.5 2A1.5 1.5 0 009 3.5v11A3.5 3.5 0 1012.5 11V3.5A1.5 1.5 0 0010.5 2z" />
                  </svg>
                  테마 관리
                </Link>
                <Link href="/components" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 112 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 110 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 110-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  컴포넌트
                </Link>
                <Link href="/analytics" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                  생성 분석
                </Link>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">컴포넌트 템플릿</h2>
                  <p className="text-sm text-gray-600">디자인 시스템의 컴포넌트 템플릿을 관리하고 새로운 컴포넌트를 생성하세요</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600">
                    {user?.email}
                  </div>
                  <Link href="/" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                    홈으로
                  </Link>
                </div>
              </div>
            </div>

            {/* Courses Content */}
            <div className="p-8">
              {/* Controls */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg mb-8">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="컴포넌트명, 프레임워크로 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">모든 카테고리</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                    <select
                      value={filterComplexity}
                      onChange={(e) => setFilterComplexity(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">모든 복잡도</option>
                      <option value="basic">기본</option>
                      <option value="intermediate">중급</option>
                      <option value="advanced">고급</option>
                    </select>
                  </div>
                  <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium shadow-lg transition-all">
                    새 컴포넌트 추가
                  </button>
                </div>
              </div>

              {/* Component Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">전체 컴포넌트</p>
                      <p className="text-2xl font-bold text-gray-900">{components.length}개</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">활성</p>
                      <p className="text-2xl font-bold text-green-600">
                        {components.filter(c => c.status === 'active').length}개
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">총 사용 횟수</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {components.reduce((acc, c) => acc + c.usageCount, 0).toLocaleString()}회
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">평균 평점</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {(components.filter(c => c.rating > 0).reduce((acc, c) => acc + c.rating, 0) / components.filter(c => c.rating > 0).length).toFixed(1)}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Components Grid */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">컴포넌트 정보를 불러오는 중...</p>
                </div>
              ) : filteredCourses.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">검색 조건에 맞는 컴포넌트가 없습니다.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredComponents.map((component) => (
                    <div key={component.id} className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 overflow-hidden">
                      {/* Component Thumbnail */}
                      <div className="h-48 bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <p className="text-sm font-medium text-gray-700">{component.category}</p>
                        </div>
                      </div>

                      {/* Component Content */}
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-bold text-gray-900 flex-1 mr-2">{component.name}</h3>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(component.status)}`}>
                            {getStatusText(component.status)}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{component.description}</p>

                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                            </svg>
                            <span className="text-sm text-gray-600">{component.framework}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm text-gray-600">{component.size}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getComplexityColor(component.complexity_level)}`}>
                            {getComplexityText(component.complexity_level)}
                          </span>
                          {component.rating > 0 && (
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span className="text-sm font-medium text-gray-900">{component.rating}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-sm text-gray-600">사용 횟수</p>
                            <p className="text-lg font-bold text-gray-900">{component.usageCount}회</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">생성일</p>
                            <p className="text-lg font-bold text-blue-600">{new Date(component.createdDate).toLocaleDateString('ko-KR')}</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button className="flex-1 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                            편집
                          </button>
                          <button className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                            미리보기
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}