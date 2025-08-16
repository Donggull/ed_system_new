# Supabase 설정 가이드

ed_system_new 프로젝트의 Supabase가 이미 설정되어 있습니다!

## ✅ 확인된 사항
- ✅ Supabase 프로젝트 `ed_system_new` 존재
- ✅ 데이터베이스 테이블 생성 완료:
  - `user_profiles` - 사용자 프로필
  - `projects` - 프로젝트 정보
  - `themes` - 테마 템플릿 (2개 템플릿 존재)
  - `component_templates` - 컴포넌트 템플릿 (3개 템플릿 존재)
  - `generated_components` - 생성된 컴포넌트

## 🔧 설정 방법

### 1. Supabase 대시보드에서 API 정보 확인
1. [Supabase 대시보드](https://supabase.com/dashboard)에 로그인
2. `ed_system_new` 프로젝트 선택
3. 좌측 메뉴에서 **Settings** → **API** 클릭
4. 다음 정보를 복사:
   - **Project URL** (예: `https://abcdefghijklmn.supabase.co`)
   - **anon public** key

### 2. 환경변수 설정
`.env.local` 파일을 열고 다음 값들을 실제 값으로 교체:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key
```

### 3. 이메일 인증 설정
1. Supabase 대시보드에서 **Authentication** → **Settings** 메뉴로 이동
2. **Site URL**을 설정:
   - 개발: `http://localhost:3000`
   - 프로덕션: 실제 배포 URL
3. **Redirect URLs**에 추가:
   - `http://localhost:3000/auth/callback`
   - `your-production-url.com/auth/callback`

### 4. 테스트
1. 개발 서버 실행: `npm run dev`
2. `http://localhost:3000`에서 회원가입 테스트
3. 이메일 확인 후 로그인 테스트

## 📝 참고 사항
- 환경변수 변경 후 개발 서버 재시작 필요
- 이메일 인증이 활성화되어 있으므로 실제 이메일 주소 사용 필요
- 모든 테이블에 RLS(Row Level Security)가 활성화되어 있음