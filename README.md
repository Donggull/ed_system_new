# 교육 시스템 (Education System)

Next.js, TypeScript, TailwindCSS로 구축된 현대적인 교육 관리 시스템입니다.

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Runtime**: Node.js

## 시작하기

### 필수 조건

- Node.js 18.17 이상
- npm 또는 yarn

### 설치 및 실행

1. 의존성 설치:
```bash
npm install
```

2. 개발 서버 실행:
```bash
npm run dev
```

3. 브라우저에서 [http://localhost:3000](http://localhost:3000) 열기

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
