'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Link from 'next/link'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalThemes: 0,
    totalComponents: 0,
    totalDownloads: 0
  })

  useEffect(() => {
    setStats({
      totalProjects: 24,
      totalThemes: 156,
      totalComponents: 1847,
      totalDownloads: 892
    })
  }, [])

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
                <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg">
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
                  <h2 className="text-2xl font-bold text-gray-900">프로젝트 대시보드</h2>
                  <p className="text-sm text-gray-600">디자인 시스템 생성 프로젝트를 관리하고 현황을 확인하세요</p>
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

            {/* Dashboard Content */}
            <div className="p-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">총 프로젝트</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalProjects}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 002 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-sm text-green-600 font-medium">+3 이번 주</span>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">생성된 테마</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalThemes}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-sm text-green-600 font-medium">+12 이번 주</span>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">생성된 컴포넌트</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalComponents.toLocaleString()}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-sm text-green-600 font-medium">+89 이번 주</span>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">다운로드 수</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalDownloads}</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-sm text-green-600 font-medium">+47 이번 주</span>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Project Creation Chart */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">월별 프로젝트 생성 현황</h3>
                  <div className="h-64 bg-gradient-to-t from-blue-50 to-white rounded-xl p-4 flex items-end justify-between">
                    <div className="flex items-end gap-2 w-full justify-around">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-32 bg-blue-400 rounded-t mb-2"></div>
                        <span className="text-xs text-gray-600">1월</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-40 bg-blue-500 rounded-t mb-2"></div>
                        <span className="text-xs text-gray-600">2월</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-36 bg-blue-400 rounded-t mb-2"></div>
                        <span className="text-xs text-gray-600">3월</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-48 bg-blue-600 rounded-t mb-2"></div>
                        <span className="text-xs text-gray-600">4월</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-44 bg-blue-500 rounded-t mb-2"></div>
                        <span className="text-xs text-gray-600">5월</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-52 bg-blue-700 rounded-t mb-2"></div>
                        <span className="text-xs text-gray-600">6월</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Popular Themes */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">인기 테마 TOP 5</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">모던 미니멀</p>
                        <p className="text-sm text-gray-600">사용 횟수: 245회</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">4.8</p>
                        <p className="text-xs text-gray-500">평점</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">다크 프로</p>
                        <p className="text-sm text-gray-600">사용 횟수: 198회</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">4.7</p>
                        <p className="text-xs text-gray-500">평점</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">컬러풀 브라이트</p>
                        <p className="text-sm text-gray-600">사용 횟수: 176회</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-purple-600">4.6</p>
                        <p className="text-xs text-gray-500">평점</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">클래식 엘레강트</p>
                        <p className="text-sm text-gray-600">사용 횟수: 154회</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-yellow-600">4.5</p>
                        <p className="text-xs text-gray-500">평점</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-red-100 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">네이처 그린</p>
                        <p className="text-sm text-gray-600">사용 횟수: 132회</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-red-600">4.4</p>
                        <p className="text-xs text-gray-500">평점</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 활동</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 002 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">새로운 디자인 시스템 프로젝트 25개가 생성되었습니다</p>
                      <p className="text-sm text-gray-600">2시간 전</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4z" clipRule="evenodd" />
                        <path d="M10.5 2A1.5 1.5 0 009 3.5v11A3.5 3.5 0 1012.5 11V3.5A1.5 1.5 0 0010.5 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">&quot;다크 프로&quot; 테마가 새로 추가되었습니다</p>
                      <p className="text-sm text-gray-600">4시간 전</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 112 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 110 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 110-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">157개의 컴포넌트가 새로 생성되었습니다</p>
                      <p className="text-sm text-gray-600">6시간 전</p>
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