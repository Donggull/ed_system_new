'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Link from 'next/link'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    activeEnrollments: 0,
    completionRate: 0
  })

  useEffect(() => {
    setStats({
      totalStudents: 1247,
      totalCourses: 89,
      activeEnrollments: 3564,
      completionRate: 87.5
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
                  <h1 className="text-lg font-bold text-gray-900">교육 시스템</h1>
                  <p className="text-xs text-gray-500">Education Management</p>
                </div>
              </div>

              <nav className="space-y-2">
                <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM14 16a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" />
                  </svg>
                  대시보드
                </Link>
                <Link href="/students" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  학생 관리
                </Link>
                <Link href="/courses" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  강의 관리
                </Link>
                <Link href="/reports" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a1 1 0 002 0V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd" />
                  </svg>
                  리포트
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
                  <h2 className="text-2xl font-bold text-gray-900">대시보드</h2>
                  <p className="text-sm text-gray-600">교육 시스템 현황을 한눈에 확인하세요</p>
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
                      <p className="text-sm font-medium text-gray-600">총 학생 수</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalStudents.toLocaleString()}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-sm text-green-600 font-medium">+12% 지난 달 대비</span>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">총 강의 수</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.totalCourses}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-sm text-green-600 font-medium">+5 신규 강의</span>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">활성 수강생</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.activeEnrollments.toLocaleString()}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-sm text-green-600 font-medium">활발한 참여</span>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">완료율</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.completionRate}%</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-sm text-green-600 font-medium">+2.3% 향상</span>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Enrollment Chart */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">월별 수강 등록 현황</h3>
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

                {/* Course Performance */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">인기 강의 TOP 5</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">웹 개발 기초</p>
                        <p className="text-sm text-gray-600">수강생: 245명</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">4.8</p>
                        <p className="text-xs text-gray-500">평점</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">데이터 분석</p>
                        <p className="text-sm text-gray-600">수강생: 198명</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">4.7</p>
                        <p className="text-xs text-gray-500">평점</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">AI 머신러닝</p>
                        <p className="text-sm text-gray-600">수강생: 176명</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-purple-600">4.6</p>
                        <p className="text-xs text-gray-500">평점</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">모바일 앱 개발</p>
                        <p className="text-sm text-gray-600">수강생: 154명</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-yellow-600">4.5</p>
                        <p className="text-xs text-gray-500">평점</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-red-100 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">클라우드 컴퓨팅</p>
                        <p className="text-sm text-gray-600">수강생: 132명</p>
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
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">새로운 학생 25명이 등록했습니다</p>
                      <p className="text-sm text-gray-600">2시간 전</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-green-50 rounded-lg">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">"리액트 고급" 강의가 추가되었습니다</p>
                      <p className="text-sm text-gray-600">4시간 전</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">157명의 학생이 과제를 완료했습니다</p>
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