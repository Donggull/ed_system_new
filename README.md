# DesignSystem Generator

Next.js, TypeScript, TailwindCSS, Supabase로 구축된 현대적인 디자인 시스템 생성기입니다.

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Database**: Supabase
- **Authentication**: Supabase Auth
- **Runtime**: Node.js

## 시작하기

### 필수 조건

- Node.js 18.17 이상
- npm 또는 yarn
- Supabase 계정 (인증 기능 사용 시)

### 설치 및 실행

1. 저장소 클론:
```bash
git clone https://github.com/Donggull/ed_system_new.git
cd ed_system_new
```

2. 의존성 설치:
```bash
npm install
```

3. 환경변수 설정:
```bash
cp .env.example .env.local
```

4. `.env.local` 파일에서 Supabase 설정:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

5. 개발 서버 실행:
```bash
npm run dev
```

6. 브라우저에서 [http://localhost:3000](http://localhost:3000) 열기

## Supabase 설정

### 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 가입하고 새 프로젝트를 생성
2. 프로젝트 이름과 데이터베이스 비밀번호 설정
3. 지역 선택 (Korea Central 권장)

### 2. API 키 가져오기

1. Supabase 대시보드에서 Settings → API 메뉴로 이동
2. Project URL과 anon public key 복사
3. `.env.local` 파일에 붙여넣기

### 3. 이메일 인증 설정

1. Supabase 대시보드에서 Authentication → Settings 메뉴로 이동
2. "Enable email confirmations" 체크
3. Site URL을 `http://localhost:3000` (개발) 또는 배포 URL로 설정
4. Redirect URLs에 `http://localhost:3000/auth/callback` 추가

### 4. 데이터베이스 스키마 설정

필요한 테이블들이 자동으로 생성됩니다:
- `user_profiles` - 사용자 프로필
- `projects` - 프로젝트 정보
- `themes` - 테마 템플릿
- `component_templates` - 컴포넌트 템플릿
- `generated_components` - 생성된 컴포넌트

### 빌드

```bash
npm run build
npm start
```

## 프로젝트 구조

```
ed_system_new/
├── app/                 # Next.js App Router
│   ├── globals.css     # 전역 스타일 (TailwindCSS)
│   ├── layout.tsx      # 루트 레이아웃
│   └── page.tsx        # 홈페이지
├── public/             # 정적 파일
├── next.config.js      # Next.js 설정
├── tailwind.config.js  # TailwindCSS 설정
├── tsconfig.json       # TypeScript 설정
└── package.json        # 의존성 및 스크립트
```

## 사용 가능한 스크립트

- `npm run dev` - 개발 서버 실행
- `npm run build` - 프로덕션 빌드
- `npm run start` - 프로덕션 서버 실행
- `npm run lint` - ESLint 실행

## 개발 정보

이 프로젝트는 Next.js의 App Router를 사용하며, TailwindCSS로 스타일링되어 있습니다. TypeScript를 통해 타입 안정성을 보장합니다.
