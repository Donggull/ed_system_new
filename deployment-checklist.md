# 🚀 Vercel 배포 체크리스트

## ✅ 배포 전 확인사항

### 코드 준비
- [ ] 모든 변경사항이 GitHub에 푸시됨
- [ ] `npm run build` 로컬에서 성공
- [ ] TypeScript 컴파일 오류 없음
- [ ] `.env.local`에 실제 Supabase 키 설정됨

### Supabase 설정
- [ ] 프로젝트 URL: `https://nktjoldoylvwtkzboyaf.supabase.co`
- [ ] Anon Key: 설정됨
- [ ] Service Role Key: 설정됨
- [ ] 데이터베이스 테이블 존재 확인 (5개 테이블)

## 🔧 Vercel 배포 단계

### 1. 프로젝트 생성
- [ ] Vercel Dashboard에서 New Project
- [ ] GitHub `Donggull/ed_system_new` 연결
- [ ] Framework: Next.js 자동 감지

### 2. 환경변수 설정
```
NEXT_PUBLIC_SUPABASE_URL=https://nktjoldoylvwtkzboyaf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-key]
```

- [ ] Production 환경 설정
- [ ] Preview 환경 설정  
- [ ] Development 환경 설정

### 3. 배포 실행
- [ ] Deploy 버튼 클릭
- [ ] 빌드 로그 확인
- [ ] 배포 성공 확인

## 🧪 배포 후 테스트

### 기본 기능
- [ ] 홈페이지 접속 가능
- [ ] 사이드바에 "✅ Supabase 연결됨" 표시
- [ ] 템플릿 데이터 로딩 (테마 2개, 컴포넌트 3개)

### 인증 테스트
- [ ] `/auth/signup` 페이지 접속
- [ ] 이메일 회원가입 (실제 이메일 사용)
- [ ] 이메일 확인 링크 수신
- [ ] 이메일 확인 후 자동 로그인
- [ ] 헤더에 사용자 이메일 표시
- [ ] 로그아웃 버튼 작동

### Supabase 연동
- [ ] 회원가입 시 `user_profiles` 테이블에 데이터 생성
- [ ] 인증 상태가 실시간으로 업데이트
- [ ] 로그아웃 후 로그인 페이지로 리디렉션

## 🔄 Supabase 추가 설정

### Authentication Settings
1. Supabase Dashboard → Authentication → Settings
2. Site URL 업데이트:
   ```
   https://your-app-name.vercel.app
   ```
3. Redirect URLs 추가:
   ```
   https://your-app-name.vercel.app/auth/callback
   ```

### Email Templates (선택사항)
- [ ] 회원가입 확인 이메일 커스터마이징
- [ ] 비밀번호 재설정 이메일 커스터마이징

## 🎯 성공 기준

모든 항목이 체크되면 배포 완료:

- ✅ 빌드 및 배포 성공
- ✅ Supabase 연결 정상
- ✅ 회원가입/로그인 플로우 작동
- ✅ 실시간 인증 상태 업데이트
- ✅ 데이터베이스 연동 정상

## 🐛 문제 해결

### 배포 실패 시
1. Vercel Build 로그 확인
2. 환경변수 오타 확인
3. GitHub 코드 최신화 확인

### 인증 실패 시
1. Supabase Site URL 확인
2. Redirect URLs 설정 확인
3. 이메일 인증 활성화 확인

### 연결 실패 시
1. 환경변수 값 정확성 확인
2. Supabase 프로젝트 상태 확인
3. 네트워크 연결 확인