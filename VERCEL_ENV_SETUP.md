# Vercel 환경변수 설정 가이드

## 🚨 긴급 해결책 - 수동 설정

Vercel Dashboard에서 직접 환경변수를 설정하는 방법입니다.

### 1. Vercel Dashboard 접속
1. https://vercel.com/dashboard 접속
2. `ed_system_new` 프로젝트 선택
3. **Settings** 탭 클릭
4. 왼쪽 메뉴에서 **Environment Variables** 클릭

### 2. 환경변수 추가
다음 3개 환경변수를 **Production**, **Preview**, **Development** 모든 환경에 추가:

#### 첫 번째 변수
- **Name**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://nktjoldoylvwtkzboyaf.supabase.co`
- **Environment**: Production, Preview, Development 모두 체크

#### 두 번째 변수
- **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rdGpvbGRveWx2d3RremJveWFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxNDUyODUsImV4cCI6MjA3MDcyMTI4NX0.ZGX25pgubs4PD8H8zY5wUi5cEKL500fiLjp1TY5PPyo`
- **Environment**: Production, Preview, Development 모두 체크

#### 세 번째 변수
- **Name**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rdGpvbGRveWx2d3RremJveWFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTE0NTI4NSwiZXhwIjoyMDcwNzIxMjg1fQ.RKNTdZq2OIZX2Gq3fVIUP-hrj3IKvIne52i-gHUgC_g`
- **Environment**: Production, Preview, Development 모두 체크

### 3. 배포 재실행
환경변수 추가 후:
1. **Deployments** 탭으로 이동
2. 최신 배포에서 **⋯** 메뉴 클릭
3. **Redeploy** 선택
4. **Use existing Build Cache** 체크 해제
5. **Redeploy** 버튼 클릭

---

## 🔧 CLI를 통한 자동 설정 (선택사항)

### 1. Vercel CLI 로그인
```bash
vercel login
```
브라우저에서 GitHub 계정으로 로그인

### 2. 자동 스크립트 실행
```bash
node scripts/setup-vercel-env.js
```

---

## ✅ 설정 확인

### 1. 배포된 사이트에서 확인
배포 완료 후 `https://your-app.vercel.app/debug` 접속하여:
- 환경변수가 모두 **SET**으로 표시되는지 확인
- Supabase Client가 **INITIALIZED**로 표시되는지 확인
- Connection Test가 **성공**으로 표시되는지 확인

### 2. 로그인 기능 테스트
- 회원가입 시도
- 로그인 시도
- 오류 메시지 없이 정상 작동하는지 확인

---

## 🐛 여전히 문제가 있다면

### 브라우저에서 F12 → Console 확인
```javascript
// 브라우저 콘솔에서 직접 실행해보세요:
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
```

### Vercel 함수 로그 확인
1. Vercel Dashboard → Functions 탭
2. 최근 실행된 함수 로그 확인
3. 환경변수 관련 오류 메시지 찾기

---

## 📸 스크린샷 가이드

### Vercel Dashboard Environment Variables 페이지
```
Settings > Environment Variables
┌─────────────────────────────────────────────────────────────┐
│ Add New                                                      │
│ ┌─────────────────┐ ┌──────────────────────────────────────┐ │
│ │ Name            │ │ Value                                │ │
│ └─────────────────┘ └──────────────────────────────────────┘ │
│ Environment: ☑ Production ☑ Preview ☑ Development           │
│                                                 [Add] 버튼   │
└─────────────────────────────────────────────────────────────┘
```

### 설정해야 할 환경변수 목록
```
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY  
✅ SUPABASE_SERVICE_ROLE_KEY
```

---

## 💡 추가 팁

1. **Cache 문제**: 환경변수 변경 후 반드시 새로운 배포 필요
2. **브라우저 캐시**: 배포 후 브라우저 새로고침 (Ctrl+F5)
3. **시간 지연**: 환경변수 적용까지 1-2분 소요될 수 있음