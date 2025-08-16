'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Link from 'next/link'

interface ReportData {
  totalStudents: number
  activeStudents: number
  totalCourses: number
  activeCourses: number
  totalEnrollments: number
  completionRate: number
  averageRating: number
  monthlyEnrollments: Array<{month: string, count: number}>
  topCourses: Array<{name: string, enrollments: number, rating: number}>
  studentProgress: Array<{category: string, completed: number, total: number}>
}

export default function Reports() {
  const { user } = useAuth()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('last6months')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 가상의 리포트 데이터
    const mockReportData: ReportData = {
      totalStudents: 1247,
      activeStudents: 1089,
      totalCourses: 89,
      activeCourses: 67,
      totalEnrollments: 3564,
      completionRate: 87.5,
      averageRating: 4.6,
      monthlyEnrollments: [
        { month: '1월', count: 245 },
        { month: '2월', count: 298 },
        { month: '3월', count: 267 },
        { month: '4월', count: 321 },
        { month: '5월', count: 289 },
        { month: '6월', count: 356 },
      ],
      topCourses: [
        { name: '웹 개발 기초', enrollments: 245, rating: 4.8 },
        { name: '리액트 마스터클래스', enrollments: 198, rating: 4.9 },
        { name: '파이썬 데이터 분석', enrollments: 176, rating: 4.6 },
        { name: '모바일 앱 개발', enrollments: 154, rating: 4.5 },
        { name: 'AI 머신러닝', enrollments: 132, rating: 4.7 },
      ],
      studentProgress: [
        { category: '웹 개발', completed: 180, total: 220 },
        { category: '데이터 사이언스', completed: 145, total: 180 },
        { category: '모바일 개발', completed: 98, total: 125 },
        { category: '인공지능', completed: 76, total: 95 },
        { category: '클라우드', completed: 89, total: 110 },
      ]
    }

    setTimeout(() => {
      setReportData(mockReportData)
      setLoading(false)
    }, 1000)
  }, [selectedPeriod])

  const generatePDFReport = () => {
    alert('PDF 리포트가 생성되었습니다!')
  }

  const exportToExcel = () => {
    alert('Excel 파일로 내보내기가 완료되었습니다!')
  }

  if (loading || !reportData) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">리포트 데이터를 불러오는 중...</p>
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
                  <h1 className="text-lg font-bold text-gray-900">교육 시스템</h1>
                  <p className="text-xs text-gray-500">Education Management</p>
                </div>
              </div>

              <nav className="space-y-2">
                <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
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
                <Link href="/reports" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg">
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
                  <h2 className="text-2xl font-bold text-gray-900">리포트</h2>
                  <p className="text-sm text-gray-600">교육 시스템의 성과와 통계를 분석해보세요</p>
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

            {/* Reports Content */}
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
                      onClick={generatePDFReport}
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
                      <p className="text-sm font-medium text-gray-600">총 학생 수</p>
                      <p className="text-3xl font-bold text-blue-600">{reportData.totalStudents.toLocaleString()}</p>
                      <p className="text-sm text-green-600">활성: {reportData.activeStudents}명</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">총 강의 수</p>
                      <p className="text-3xl font-bold text-green-600">{reportData.totalCourses}</p>
                      <p className="text-sm text-green-600">진행중: {reportData.activeCourses}개</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">총 수강 등록</p>
                      <p className="text-3xl font-bold text-purple-600">{reportData.totalEnrollments.toLocaleString()}</p>
                      <p className="text-sm text-green-600">완료율: {reportData.completionRate}%</p>
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
                      <p className="text-3xl font-bold text-yellow-600">{reportData.averageRating}</p>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-4 h-4 ${i < Math.floor(reportData.averageRating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
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
                {/* Monthly Enrollments Chart */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">월별 수강 등록 추이</h3>
                  <div className="h-64 bg-gradient-to-t from-blue-50 to-white rounded-xl p-4 flex items-end justify-between">
                    <div className="flex items-end gap-3 w-full justify-around">
                      {reportData.monthlyEnrollments.map((data, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div 
                            className="w-8 bg-blue-500 rounded-t mb-2" 
                            style={{height: `${(data.count / Math.max(...reportData.monthlyEnrollments.map(d => d.count))) * 150}px`}}
                          ></div>
                          <span className="text-xs text-gray-600">{data.month}</span>
                          <span className="text-xs text-gray-500">{data.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Top Courses */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">인기 강의 TOP 5</h3>
                  <div className="space-y-4">
                    {reportData.topCourses.map((course, index) => (
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
                            <p className="font-medium text-gray-900">{course.name}</p>
                            <p className="text-sm text-gray-600">수강생: {course.enrollments}명</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-900">{course.rating}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Student Progress by Category */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">카테고리별 학습 진도</h3>
                <div className="space-y-6">
                  {reportData.studentProgress.map((category, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">{category.category}</span>
                        <span className="text-sm text-gray-600">
                          {category.completed}/{category.total} ({Math.round((category.completed / category.total) * 100)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500" 
                          style={{width: `${(category.completed / category.total) * 100}%`}}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">학생 활동</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">일일 평균 접속자</span>
                      <span className="text-sm font-medium text-gray-900">342명</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">평균 학습 시간</span>
                      <span className="text-sm font-medium text-gray-900">2.5시간</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">과제 제출률</span>
                      <span className="text-sm font-medium text-gray-900">78%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">수익 정보</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">이번 달 수익</span>
                      <span className="text-sm font-medium text-gray-900">₩45,670,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">평균 강의 가격</span>
                      <span className="text-sm font-medium text-gray-900">₩220,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">전년 대비 성장률</span>
                      <span className="text-sm font-medium text-green-600">+23.4%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">시스템 사용률</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">모바일 접속</span>
                      <span className="text-sm font-medium text-gray-900">67%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">데스크톱 접속</span>
                      <span className="text-sm font-medium text-gray-900">33%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">평균 세션 시간</span>
                      <span className="text-sm font-medium text-gray-900">28분</span>
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