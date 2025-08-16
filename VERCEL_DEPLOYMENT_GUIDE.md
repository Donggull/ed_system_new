# Vercel 배포 가이드 - Supabase 연동

## 🚀 빠른 시작

### 1. 자동 환경변수 설정
```bash
# Vercel CLI 설치 (한 번만)
npm i -g vercel

# 프로젝트에 로그인
vercel login

# 환경변수 자동 설정
node scripts/setup-vercel-env.js
```

### 2. 배포 실행
```bash
# 프로덕션 배포
vercel --prod
```

### 3. 배포 검증
배포 완료 후 `https://your-app.vercel.app/debug` 페이지에서 연동 상태를 확인하세요.

## 🔧 수동 설정 방법

### Vercel Dashboard에서 환경변수 설정

1. **Vercel Dashboard 접속**
   - https://vercel.com/dashboard
   - 해당 프로젝트 선택

2. **환경변수 추가**
   - Settings → Environment Variables
   - 다음 3개 변수를 추가:

```bash
# Production, Preview, Development 모든 환경에 추가 (정정된 올바른 값)
NEXT_PUBLIC_SUPABASE_URL=https://yzfxwxbopoeuinvbxuvj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6Znh3eGJvcG9ldWludmJ4dXZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyOTExOTgsImV4cCI6MjA3MDg2NzE5OH0.hEIFJcE5yZN4nvUWJOIpYM7cIJ6m_pkhHfE0pKNvfF4
NEXT_PUBLIC_SITE_URL=https://ed-system-new.vercel.app
```

3. **배포 재실행**
   - 환경변수 추가 후 자동으로 재배포되거나
   - Deployments 탭에서 "Redeploy" 클릭

## 🔗 Supabase Dashboard 설정

배포 완료 후 Supabase Dashboard에서 다음 설정을 업데이트하세요:

### Authentication Settings
1. **Supabase Dashboard 접속**
   - https://supabase.com/dashboard
   - ed_system_new 프로젝트 선택

2. **Site URL 설정**
   - Authentication → Settings → General
   - Site URL: `https://your-app.vercel.app`

3. **Redirect URLs 추가**
   - Authentication → Settings → URL Configuration
   - Redirect URLs에 추가:
     - `https://your-app.vercel.app/auth/callback`
     - `https://your-app.vercel.app/`

## 🐛 문제 해결

### 일반적인 문제들

#### 1. "Supabase client not available" 오류
**원인**: Vercel 환경변수가 설정되지 않음
**해결책**:
- `/debug` 페이지에서 환경변수 상태 확인
- Vercel Dashboard에서 환경변수 재설정
- 배포 재실행

#### 2. 로컬은 작동하지만 프로덕션에서 실패
**원인**: 환경변수가 프로덕션 환경에 적용되지 않음
**해결책**:
```bash
# 환경변수 확인
vercel env ls

# 없으면 자동 설정 스크립트 실행
node scripts/setup-vercel-env.js
```

#### 3. 인증 리디렉션 실패
**원인**: Supabase Dashboard의 URL 설정 문제
**해결책**:
- Supabase Dashboard → Authentication → Settings
- Site URL과 Redirect URLs 확인
- 정확한 Vercel 도메인 사용

### 디버그 도구 활용

#### 1. Debug 페이지 사용
- 배포된 앱에서 `/debug` 경로 접속
- 실시간 환경변수 상태 확인
- 데이터베이스 연결 테스트

#### 2. Vercel 로그 확인
```bash
# 배포 로그 확인
vercel logs

# 특정 배포의 로그
vercel logs [deployment-url]
```

#### 3. 브라우저 콘솔 확인
- F12 → Console 탭
- Supabase 초기화 로그 확인
- 네트워크 탭에서 API 요청 상태 확인

## 📋 체크리스트

### 배포 전 확인사항
- [ ] `.env.local` 파일에 올바른 Supabase 자격증명 설정
- [ ] 로컬 환경에서 정상 작동 확인
- [ ] Git에 최신 변경사항 커밋 및 푸시

### 배포 후 확인사항
- [ ] Vercel 환경변수 설정 완료
- [ ] `/debug` 페이지에서 연결 상태 ✅ 확인
- [ ] Supabase Dashboard의 Site URL 업데이트
- [ ] 회원가입/로그인 기능 테스트
- [ ] 데이터베이스 읽기/쓰기 테스트

## 🆘 추가 지원

문제가 지속되면 다음을 확인하세요:

1. **Vercel 상태 페이지**: https://www.vercel-status.com/
2. **Supabase 상태 페이지**: https://status.supabase.com/
3. **로그 분석**: `vercel logs` 명령어 사용
4. **Environment Debug**: `/debug` 페이지의 상세 정보 확인

---

💡 **Tip**: 자동 설정 스크립트(`scripts/setup-vercel-env.js`)를 사용하면 수동 설정 과정을 건너뛸 수 있습니다.