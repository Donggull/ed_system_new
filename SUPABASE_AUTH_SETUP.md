# Supabase 인증 설정 가이드

## 🚨 중요: 이메일 확인 비활성화 설정

Vercel 환경에서 회원가입이 즉시 작동하도록 하려면 Supabase Dashboard에서 이메일 확인을 비활성화해야 합니다.

### 1. Supabase Dashboard 설정

1. **Supabase Dashboard 접속**
   - https://supabase.com/dashboard 접속
   - `ed_system_new` 프로젝트 선택

2. **Authentication 설정**
   - 왼쪽 메뉴에서 **Authentication** 클릭
   - **Settings** 클릭

3. **Email 확인 비활성화**
   ```
   Authentication > Settings > General
   
   ✅ Enable email confirmations: OFF (비활성화)
   ```
   - "Enable email confirmations" 옵션을 **비활성화**
   - **Save** 버튼 클릭

### 2. Site URL 설정

```
Authentication > Settings > General

Site URL: https://your-vercel-app.vercel.app
Additional redirect URLs:
- https://your-vercel-app.vercel.app/auth/callback
- http://localhost:3000 (개발용)
- http://localhost:3000/auth/callback (개발용)
```

### 3. Email Templates 설정 (선택사항)

나중에 이메일 확인을 활성화하려면:

```
Authentication > Settings > Email Templates

Confirm signup:
- Subject: 회원가입을 완료해주세요
- Body: 기본 템플릿 사용 또는 커스터마이징
```

## 🔧 데이터베이스 설정

### user_profiles 테이블 트리거 (이미 설정됨)

```sql
-- 자동으로 user_profiles 생성하는 트리거
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, full_name, plan_type)
  VALUES (new.id, null, new.raw_user_meta_data->>'full_name', 'free');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

### RLS 정책 (이미 설정됨)

```sql
-- 사용자가 자신의 프로필만 조회/수정 가능
CREATE POLICY "Users can view own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);
```

## 🧪 테스트 방법

### 1. 로컬 테스트
```bash
npm run dev
# http://localhost:3000/auth 접속
# 새 이메일로 회원가입 시도
```

### 2. 프로덕션 테스트
```bash
# Vercel 배포 후
# https://your-app.vercel.app/auth 접속
# 새 이메일로 회원가입 시도
```

### 3. 데이터베이스 확인
```sql
-- Supabase SQL Editor에서 실행
SELECT * FROM auth.users ORDER BY created_at DESC LIMIT 5;
SELECT * FROM public.user_profiles ORDER BY created_at DESC LIMIT 5;
```

## 🐛 문제 해결

### 회원가입은 되지만 로그인 안됨
- **원인**: 이메일 확인이 활성화되어 있음
- **해결**: Authentication > Settings에서 "Enable email confirmations" 비활성화

### user_profiles에 데이터가 없음
- **원인**: 트리거가 작동하지 않음
- **해결**: 
  ```sql
  -- 트리거 상태 확인
  SELECT * FROM information_schema.triggers 
  WHERE trigger_name = 'on_auth_user_created';
  
  -- 수동으로 프로필 생성
  INSERT INTO public.user_profiles (id, plan_type)
  SELECT id, 'free' FROM auth.users 
  WHERE id NOT IN (SELECT id FROM public.user_profiles);
  ```

### RLS 오류 (Row Level Security)
- **원인**: RLS 정책이 올바르지 않음
- **해결**: 위의 RLS 정책 재실행

## 📋 체크리스트

### Supabase Dashboard 설정
- [ ] Authentication > Settings > "Enable email confirmations" **비활성화**
- [ ] Site URL에 Vercel 도메인 추가
- [ ] Redirect URLs 설정

### 데이터베이스 설정
- [ ] user_profiles 테이블 존재
- [ ] handle_new_user() 함수 생성
- [ ] on_auth_user_created 트리거 생성
- [ ] RLS 정책 설정

### 테스트
- [ ] 로컬 환경에서 회원가입/로그인 테스트
- [ ] Vercel 환경에서 회원가입/로그인 테스트
- [ ] 데이터베이스에 사용자 데이터 저장 확인

---

💡 **중요**: 이메일 확인을 비활성화하면 보안이 약해집니다. 프로덕션에서는 이메일 확인을 활성화하고 적절한 이메일 템플릿을 설정하는 것을 권장합니다.