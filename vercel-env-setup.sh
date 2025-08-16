#!/bin/bash

# Vercel 환경변수 자동 설정 스크립트
# 사용법: ./vercel-env-setup.sh [project-name]

PROJECT_NAME=${1:-"ed-system-new"}

echo "🚀 Vercel 환경변수 설정을 시작합니다..."
echo "프로젝트: $PROJECT_NAME"

# Vercel CLI 설치 확인
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI가 설치되지 않았습니다."
    echo "📦 설치: npm i -g vercel"
    exit 1
fi

echo "✅ Vercel CLI 확인됨"

# 환경변수 설정
echo "🔧 환경변수 설정 중..."

# Production 환경
echo "Production 환경 설정..."
vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "https://nktjoldoylvwtkzboyaf.supabase.co"
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rdGpvbGRveWx2d3RremJveWFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNDUyODUsImV4cCI6MjA3MDcyMTI4NX0.ZGX25pgubs4PD8H8zY5wUi5cEKL500fiLjp1TY5PPyo"
vercel env add SUPABASE_SERVICE_ROLE_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rdGpvbGRveWx2d3RremJveWFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE0NTI4NSwiZXhwIjoyMDcwNzIxMjg1fQ.RKNTdZq2OIZX2Gq3fVIUP-hrj3IKvIne52i-gHUgC_g"

# Preview 환경
echo "Preview 환경 설정..."
vercel env add NEXT_PUBLIC_SUPABASE_URL preview <<< "https://nktjoldoylvwtkzboyaf.supabase.co"
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rdGpvbGRveWx2d3RremJveWFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNDUyODUsImV4cCI6MjA3MDcyMTI4NX0.ZGX25pgubs4PD8H8zY5wUi5cEKL500fiLjp1TY5PPyo"
vercel env add SUPABASE_SERVICE_ROLE_KEY preview <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rdGpvbGRveWx2d3RremJveWFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE0NTI4NSwiZXhwIjoyMDcwNzIxMjg1fQ.RKNTdZq2OIZX2Gq3fVIUP-hrj3IKvIne52i-gHUgC_g"

# Development 환경
echo "Development 환경 설정..."
vercel env add NEXT_PUBLIC_SUPABASE_URL development <<< "https://nktjoldoylvwtkzboyaf.supabase.co"
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY development <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rdGpvbGRveWx2d3RremJveWFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNDUyODUsImV4cCI6MjA3MDcyMTI4NX0.ZGX25pgubs4PD8H8zY5wUi5cEKL500fiLjp1TY5PPyo"
vercel env add SUPABASE_SERVICE_ROLE_KEY development <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rdGpvbGRveWx2d3RremJveWFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE0NTI4NSwiZXhwIjoyMDcwNzIxMjg1fQ.RKNTdZq2OIZX2Gq3fVIUP-hrj3IKvIne52i-gHUgC_g"

echo "✅ 환경변수 설정 완료!"
echo ""
echo "📋 설정된 환경변수:"
echo "  - NEXT_PUBLIC_SUPABASE_URL"
echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY" 
echo "  - SUPABASE_SERVICE_ROLE_KEY"
echo ""
echo "🔄 다음 단계:"
echo "1. vercel --prod 명령으로 배포"
echo "2. Supabase에서 Site URL 업데이트"
echo "3. 배포된 앱에서 회원가입/로그인 테스트"
echo ""
echo "🌐 Supabase 설정 업데이트 필요:"
echo "  Site URL: https://your-app.vercel.app"
echo "  Redirect: https://your-app.vercel.app/auth/callback"