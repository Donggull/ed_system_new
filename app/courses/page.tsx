'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import Link from 'next/link'

interface Course {
  id: number
  title: string
  description: string
  instructor: string
  category: string
  duration: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  status: 'active' | 'draft' | 'archived'
  enrolledStudents: number
  rating: number
  price: number
  thumbnail: string
  createdDate: string
}

export default function Courses() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 가상의 강의 데이터
    const mockCourses: Course[] = [
      {
        id: 1,
        title: '웹 개발 기초',
        description: 'HTML, CSS, JavaScript를 활용한 기본적인 웹 개발을 배우는 강의입니다.',
        instructor: '김개발',
        category: '웹 개발',
        duration: '8주',
        difficulty: 'beginner',
        status: 'active',
        enrolledStudents: 245,
        rating: 4.8,
        price: 150000,
        thumbnail: '/images/web-basics.jpg',
        createdDate: '2024-01-15'
      },
      {
        id: 2,
        title: '리액트 마스터클래스',
        description: 'React를 사용한 현대적인 웹 애플리케이션 개발을 심화 학습합니다.',
        instructor: '이리액트',
        category: '웹 개발',
        duration: '12주',
        difficulty: 'intermediate',
        status: 'active',
        enrolledStudents: 198,
        rating: 4.9,
        price: 250000,
        thumbnail: '/images/react-master.jpg',
        createdDate: '2024-02-01'
      },
      {
        id: 3,
        title: '파이썬 데이터 분석',
        description: 'Pandas, NumPy, Matplotlib을 활용한 데이터 분석 기법을 학습합니다.',
        instructor: '박데이터',
        category: '데이터 사이언스',
        duration: '10주',
        difficulty: 'intermediate',
        status: 'active',
        enrolledStudents: 176,
        rating: 4.6,
        price: 200000,
        thumbnail: '/images/python-data.jpg',
        createdDate: '2024-01-20'
      },
      {
        id: 4,
        title: '모바일 앱 개발 (Flutter)',
        description: 'Flutter를 사용한 크로스 플랫폼 모바일 앱 개발을 배웁니다.',
        instructor: '최모바일',
        category: '모바일 개발',
        duration: '14주',
        difficulty: 'advanced',
        status: 'active',
        enrolledStudents: 154,
        rating: 4.5,
        price: 300000,
        thumbnail: '/images/flutter-app.jpg',
        createdDate: '2024-02-15'
      },
      {
        id: 5,
        title: 'AI 머신러닝 입문',
        description: '머신러닝의 기본 개념부터 실제 모델 구축까지 단계별로 학습합니다.',
        instructor: '정인공지능',
        category: '인공지능',
        duration: '16주',
        difficulty: 'advanced',
        status: 'draft',
        enrolledStudents: 0,
        rating: 0,
        price: 350000,
        thumbnail: '/images/ai-ml.jpg',
        createdDate: '2024-03-01'
      },
      {
        id: 6,
        title: '클라우드 컴퓨팅 기초',
        description: 'AWS, GCP를 활용한 클라우드 서비스 구축 및 운영을 학습합니다.',
        instructor: '한클라우드',
        category: '클라우드',
        duration: '12주',
        difficulty: 'intermediate',
        status: 'archived',
        enrolledStudents: 132,
        rating: 4.4,
        price: 220000,
        thumbnail: '/images/cloud-computing.jpg',
        createdDate: '2023-12-01'
      }
    ]

    setTimeout(() => {
      setCourses(mockCourses)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || course.category === filterCategory
    const matchesDifficulty = filterDifficulty === 'all' || course.difficulty === filterDifficulty
    return matchesSearch && matchesCategory && matchesDifficulty
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-blue-100 text-blue-800'
      case 'intermediate':
        return 'bg-purple-100 text-purple-800'
      case 'advanced':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '초급'
      case 'intermediate':
        return '중급'
      case 'advanced':
        return '고급'
      default:
        return '알 수 없음'
    }
  }

  const categories = [...new Set(courses.map(course => course.category))]

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
                <Link href="/courses" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg">
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
                  <h2 className="text-2xl font-bold text-gray-900">강의 관리</h2>
                  <p className="text-sm text-gray-600">등록된 강의들을 관리하고 새로운 강의를 만들어보세요</p>
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
                        placeholder="강의명, 강사명으로 검색..."
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
                      value={filterDifficulty}
                      onChange={(e) => setFilterDifficulty(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="all">모든 난이도</option>
                      <option value="beginner">초급</option>
                      <option value="intermediate">중급</option>
                      <option value="advanced">고급</option>
                    </select>
                  </div>
                  <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium shadow-lg transition-all">
                    새 강의 추가
                  </button>
                </div>
              </div>

              {/* Course Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">전체 강의</p>
                      <p className="text-2xl font-bold text-gray-900">{courses.length}개</p>
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
                      <p className="text-sm font-medium text-gray-600">진행중</p>
                      <p className="text-2xl font-bold text-green-600">
                        {courses.filter(c => c.status === 'active').length}개
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
                      <p className="text-sm font-medium text-gray-600">총 수강생</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {courses.reduce((acc, c) => acc + c.enrolledStudents, 0).toLocaleString()}명
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
                        {(courses.filter(c => c.rating > 0).reduce((acc, c) => acc + c.rating, 0) / courses.filter(c => c.rating > 0).length).toFixed(1)}
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

              {/* Courses Grid */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">강의 정보를 불러오는 중...</p>
                </div>
              ) : filteredCourses.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">검색 조건에 맞는 강의가 없습니다.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map((course) => (
                    <div key={course.id} className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 overflow-hidden">
                      {/* Course Thumbnail */}
                      <div className="h-48 bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <p className="text-sm font-medium text-gray-700">{course.category}</p>
                        </div>
                      </div>

                      {/* Course Content */}
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-bold text-gray-900 flex-1 mr-2">{course.title}</h3>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(course.status)}`}>
                            {getStatusText(course.status)}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>

                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                            </svg>
                            <span className="text-sm text-gray-600">{course.instructor}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm text-gray-600">{course.duration}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(course.difficulty)}`}>
                            {getDifficultyText(course.difficulty)}
                          </span>
                          {course.rating > 0 && (
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span className="text-sm font-medium text-gray-900">{course.rating}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-sm text-gray-600">수강생</p>
                            <p className="text-lg font-bold text-gray-900">{course.enrolledStudents}명</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">가격</p>
                            <p className="text-lg font-bold text-blue-600">₩{course.price.toLocaleString()}</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button className="flex-1 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                            수정
                          </button>
                          <button className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                            상세보기
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