# Vercel 배포 가이드

ed_system_new 프로젝트를 Vercel에 배포하고 Supabase 환경변수를 설정하는 방법입니다.

## 📋 사전 준비사항

✅ GitHub 저장소: `https://github.com/Donggull/ed_system_new`  
✅ Supabase 프로젝트: `nktjoldoylvwtkzboyaf`  
✅ 로컬 개발 환경 테스트 완료

## 🚀 Vercel 배포 단계

### 1. Vercel 프로젝트 연결

1. [Vercel Dashboard](https://vercel.com/dashboard)에 로그인
2. **"New Project"** 버튼 클릭
3. GitHub 저장소 `Donggull/ed_system_new` 선택
4. **Import** 클릭

### 2. 환경변수 설정

프로젝트 임포트 시 또는 설정에서 다음 환경변수를 추가:

#### 🔑 필수 환경변수

| 변수명 | 값 | 설명 |
|--------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://nktjoldoylvwtkzboyaf.supabase.co` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Supabase 익명 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Supabase 서비스 역할 키 |

#### 📝 Vercel에서 환경변수 추가 방법

1. **Project Settings** → **Environment Variables** 메뉴로 이동
2. 각 변수명과 값을 입력
3. **Environment**: `Production`, `Preview`, `Development` 모두 선택
4. **Add** 버튼 클릭

### 3. 배포 설정

#### Build Settings (자동으로 감지됨)
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

#### Root Directory
- `.` (프로젝트 루트)

### 4. Supabase 배포 URL 설정

배포 완료 후 Supabase에서 추가 설정 필요:

1. [Supabase Dashboard](https://supabase.com/dashboard) → `ed_system_new` 프로젝트
2. **Authentication** → **Settings** 메뉴
3. **Site URL** 설정:
   - Production: `https://your-vercel-app.vercel.app`
4. **Redirect URLs** 추가:
   - `https://your-vercel-app.vercel.app/auth/callback`

### 5. 배포 확인

배포 완료 후 확인사항:

- [ ] 홈페이지 로딩 정상
- [ ] Supabase 연결 상태 (사이드바 녹색 상태)
- [ ] 회원가입/로그인 기능
- [ ] 이메일 인증 작동
- [ ] 테마 및 컴포넌트 템플릿 로딩

## 🔧 문제 해결

### 배포 실패 시

1. **Build 로그 확인**: Vercel Dashboard → Project → Functions 탭
2. **환경변수 확인**: 모든 환경변수가 올바르게 설정되었는지 확인
3. **GitHub 동기화**: 최신 코드가 푸시되었는지 확인

### 인증 문제 시

1. **Supabase Site URL**: 배포된 도메인으로 정확히 설정
2. **Redirect URLs**: `/auth/callback` 경로 포함 확인
3. **Email Auth**: Supabase에서 이메일 인증이 활성화되어 있는지 확인

### 데이터베이스 연결 문제 시

1. **환경변수**: `NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 확인
2. **RLS 정책**: Supabase에서 Row Level Security 정책 확인
3. **네트워크**: Vercel과 Supabase 간 네트워크 연결 확인

## 📊 성공 지표

배포가 성공적으로 완료되면:

- ✅ 메인 페이지에서 녹색 "Supabase 연결됨" 상태 표시
- ✅ 템플릿 데이터 로딩 (테마: 2개, 컴포넌트: 3개)
- ✅ 회원가입 → 이메일 확인 → 로그인 플로우 정상 작동
- ✅ 사용자 이메일이 헤더에 표시
- ✅ 로그아웃 기능 정상 작동

## 🔄 지속적 배포

GitHub에 푸시하면 Vercel이 자동으로 재배포됩니다:

```bash
git add .
git commit -m "your changes"
git push origin main
```

## 📞 지원

문제가 있을 경우:
1. Vercel Dashboard의 Build 로그 확인
2. Supabase Dashboard의 Auth 설정 확인  
3. 브라우저 개발자 도구 콘솔 확인