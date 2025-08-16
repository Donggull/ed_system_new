'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Link from 'next/link'

interface AnalyticsData {
  totalProjects: number
  activeProjects: number
  totalComponents: number
  totalThemes: number
  totalGenerations: number
  downloadRate: number
  averageRating: number
  monthlyGenerations: Array<{month: string, count: number}>
  popularComponents: Array<{name: string, usage: number, rating: number}>
  frameworkDistribution: Array<{framework: string, count: number, percentage: number}>
}

export default function Analytics() {
  const { user } = useAuth()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('last6months')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 가상의 분석 데이터
    const mockAnalyticsData: AnalyticsData = {
      totalProjects: 324,
      activeProjects: 287,
      totalComponents: 1847,
      totalThemes: 156,
      totalGenerations: 5634,
      downloadRate: 92.3,
      averageRating: 4.7,
      monthlyGenerations: [
        { month: '1월', count: 456 },
        { month: '2월', count: 523 },
        { month: '3월', count: 487 },
        { month: '4월', count: 612 },
        { month: '5월', count: 578 },
        { month: '6월', count: 689 },
      ],
      popularComponents: [
        { name: '기본 버튼', usage: 1245, rating: 4.8 },
        { name: '네비게이션 바', usage: 987, rating: 4.9 },
        { name: '카드 컴포넌트', usage: 823, rating: 4.6 },
        { name: '폼 입력 필드', usage: 756, rating: 4.7 },
        { name: '모달 다이얼로그', usage: 634, rating: 4.5 },
      ],
      frameworkDistribution: [
        { framework: 'React', count: 892, percentage: 48.3 },
        { framework: 'Vue', count: 487, percentage: 26.4 },
        { framework: 'Angular', count: 356, percentage: 19.3 },
        { framework: 'Svelte', count: 112, percentage: 6.0 },
      ]
    }

    setTimeout(() => {
      setAnalyticsData(mockAnalyticsData)
      setLoading(false)
    }, 1000)
  }, [selectedPeriod])

  const generateAnalyticsReport = () => {
    alert('분석 리포트가 생성되었습니다!')
  }

  const exportToExcel = () => {
    alert('Excel 파일로 내보내기가 완료되었습니다!')
  }

  if (loading || !analyticsData) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">분석 데이터를 불러오는 중...</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

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
                <Link href="/components" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 112 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 110 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 110-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  컴포넌트
                </Link>
                <Link href="/analytics" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg">
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
                  <h2 className="text-2xl font-bold text-gray-900">생성 분석</h2>
                  <p className="text-sm text-gray-600">디자인 시스템 생성 현황과 성과를 분석해보세요</p>
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

            {/* Analytics Content */}
            <div className="p-8">
              {/* Controls */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg mb-8">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex gap-4">
                    <select
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="last3months">최근 3개월</option>
                      <option value="last6months">최근 6개월</option>
                      <option value="lastyear">최근 1년</option>
                      <option value="all">전체 기간</option>
                    </select>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={exportToExcel}
                      className="px-4 py-2 text-sm font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                    >
                      Excel 내보내기
                    </button>
                    <button 
                      onClick={generateAnalyticsReport}
                      className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg transition-all"
                    >
                      PDF 생성
                    </button>
                  </div>
                </div>
              </div>

              {/* Summary Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">총 프로젝트 수</p>
                      <p className="text-3xl font-bold text-blue-600">{analyticsData.totalProjects.toLocaleString()}</p>
                      <p className="text-sm text-green-600">활성: {analyticsData.activeProjects}개</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM14 16a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">총 컴포넌트 수</p>
                      <p className="text-3xl font-bold text-green-600">{analyticsData.totalComponents}</p>
                      <p className="text-sm text-green-600">테마: {analyticsData.totalThemes}개</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 112 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 110 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 110-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">총 생성 횟수</p>
                      <p className="text-3xl font-bold text-purple-600">{analyticsData.totalGenerations.toLocaleString()}</p>
                      <p className="text-sm text-green-600">다운로드율: {analyticsData.downloadRate}%</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">평균 평점</p>
                      <p className="text-3xl font-bold text-yellow-600">{analyticsData.averageRating}</p>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-4 h-4 ${i < Math.floor(analyticsData.averageRating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Monthly Generations Chart */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">월별 생성 현황 추이</h3>
                  <div className="h-64 bg-gradient-to-t from-blue-50 to-white rounded-xl p-4 flex items-end justify-between">
                    <div className="flex items-end gap-3 w-full justify-around">
                      {analyticsData.monthlyGenerations.map((data, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div 
                            className="w-8 bg-blue-500 rounded-t mb-2" 
                            style={{height: `${(data.count / Math.max(...analyticsData.monthlyGenerations.map(d => d.count))) * 150}px`}}
                          ></div>
                          <span className="text-xs text-gray-600">{data.month}</span>
                          <span className="text-xs text-gray-500">{data.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Popular Components */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">인기 컴포넌트 TOP 5</h3>
                  <div className="space-y-4">
                    {analyticsData.popularComponents.map((component, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                            index === 0 ? 'bg-yellow-500' : 
                            index === 1 ? 'bg-gray-400' : 
                            index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{component.name}</p>
                            <p className="text-sm text-gray-600">사용: {component.usage}회</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-900">{component.rating}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Framework Distribution */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">프레임워크별 사용 분포</h3>
                <div className="space-y-6">
                  {analyticsData.frameworkDistribution.map((framework, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">{framework.framework}</span>
                        <span className="text-sm text-gray-600">
                          {framework.count}개 ({framework.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500" 
                          style={{width: `${framework.percentage}%`}}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">사용자 활동</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">일일 평균 사용자</span>
                      <span className="text-sm font-medium text-gray-900">487명</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">평균 세션 시간</span>
                      <span className="text-sm font-medium text-gray-900">45분</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">컴포넌트 생성률</span>
                      <span className="text-sm font-medium text-gray-900">92%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">성능 지표</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">이번 달 다운로드</span>
                      <span className="text-sm font-medium text-gray-900">12,456회</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">평균 빌드 시간</span>
                      <span className="text-sm font-medium text-gray-900">2.3초</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">전년 대비 성장률</span>
                      <span className="text-sm font-medium text-green-600">+34.7%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">디바이스 분포</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">모바일 사용</span>
                      <span className="text-sm font-medium text-gray-900">73%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">데스크톱 사용</span>
                      <span className="text-sm font-medium text-gray-900">27%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">태블릿 사용</span>
                      <span className="text-sm font-medium text-gray-900">15%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}