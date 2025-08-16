# 디자인 시스템 자동 생성기 PRD (Product Requirements Document)

## 1. 프로젝트 개요

### 1.1 프로젝트 명
**Design System Generator** - 테마 기반 자동 디자인 시스템 생성 웹 애플리케이션

### 1.2 프로젝트 목표
JSON 형태의 테마 설정을 입력받아 TailwindCSS 기반의 재사용 가능한 React 컴포넌트들을 자동으로 생성하고, 사용자별 테마 관리 및 히스토리를 제공하는 웹 애플리케이션 개발

### 1.3 핵심 가치 제안
- **효율성**: 수동 디자인 시스템 구축 시간을 90% 단축
- **일관성**: 테마 기반 자동 생성으로 디자인 일관성 보장
- **확장성**: 모듈형 컴포넌트 구조로 쉬운 확장 및 커스터마이징
- **협업**: 팀 단위 테마 공유 및 버전 관리

## 2. 기술 스택 및 아키텍처

### 2.1 Frontend
- **Framework**: Next.js 14+ (App Router)
- **Styling**: TailwindCSS 3.4+
- **Language**: TypeScript
- **State Management**: Zustand
- **Code Editor**: Monaco Editor (VS Code 기반)

### 2.2 Backend & Database
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (생성된 파일 저장)
- **Real-time**: Supabase Realtime (협업 기능)

### 2.3 개발 도구
- **IDE**: Claude Code
- **Version Control**: GitHub (GitHub MCP 활용)
- **Database Tool**: Supabase MCP

### 2.4 프로젝트 구조
```
design-system-generator/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── auth/              # 인증 관련 페이지
│   │   ├── dashboard/         # 대시보드
│   │   └── globals.css
│   ├── components/             # UI 컴포넌트
│   │   ├── ui/                # 기본 UI 컴포넌트
│   │   ├── editor/            # JSON 에디터 관련
│   │   ├── preview/           # 미리보기 관련
│   │   ├── generator/         # 코드 생성 관련
│   │   └── auth/              # 인증 관련 컴포넌트
│   ├── lib/                   # 유틸리티 및 설정
│   │   ├── supabase/          # Supabase 클라이언트 및 쿼리
│   │   ├── theme-parser.ts    # 테마 JSON 파싱
│   │   ├── component-generator.ts # 컴포넌트 생성 로직
│   │   └── utils.ts
│   ├── types/                 # TypeScript 타입 정의
│   ├── stores/               # Zustand 스토어
│   ├── templates/            # 컴포넌트 템플릿
│   └── hooks/                # Custom hooks
├── supabase/
│   ├── migrations/           # 데이터베이스 마이그레이션
│   └── seed.sql             # 초기 데이터
├── public/
└── package.json
```

## 3. 데이터베이스 설계

### 3.1 테이블 구조

#### 3.1.1 users (Supabase Auth 확장)
```sql
-- Supabase Auth의 auth.users를 확장
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  plan_type VARCHAR(20) DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3.1.2 projects
```sql
CREATE TABLE public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3.1.3 themes
```sql
CREATE TABLE public.themes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  theme_data JSONB NOT NULL,
  version INTEGER DEFAULT 1,
  is_template BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3.1.4 generated_components
```sql
CREATE TABLE public.generated_components (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  theme_id UUID REFERENCES public.themes(id) ON DELETE CASCADE,
  component_type VARCHAR(50) NOT NULL,
  component_name VARCHAR(100) NOT NULL,
  component_code TEXT NOT NULL,
  props_schema JSONB,
  is_selected BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3.1.5 component_templates
```sql
CREATE TABLE public.component_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'essential' | 'optional'
  template_code TEXT NOT NULL,
  props_schema JSONB NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3.1.6 downloads
```sql
CREATE TABLE public.downloads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  theme_id UUID REFERENCES public.themes(id) ON DELETE CASCADE,
  file_url TEXT,
  file_size BIGINT,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3.1.7 theme_shares
```sql
CREATE TABLE public.theme_shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  theme_id UUID REFERENCES public.themes(id) ON DELETE CASCADE,
  shared_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_level VARCHAR(20) DEFAULT 'view', -- 'view' | 'edit'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.2 인덱스 및 제약조건
```sql
-- 성능 최적화를 위한 인덱스
CREATE INDEX idx_themes_user_id ON public.themes(user_id);
CREATE INDEX idx_themes_project_id ON public.themes(project_id);
CREATE INDEX idx_generated_components_theme_id ON public.generated_components(theme_id);
CREATE INDEX idx_downloads_user_id ON public.downloads(user_id);

-- RLS (Row Level Security) 정책
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theme_shares ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 데이터만 접근 가능
CREATE POLICY "Users can only access their own data" ON public.user_profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can only access their own projects" ON public.projects
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can access their themes and shared themes" ON public.themes
  FOR ALL USING (
    auth.uid() = user_id OR 
    is_template = true OR
    id IN (SELECT theme_id FROM public.theme_shares WHERE shared_with = auth.uid())
  );
```

### 3.3 초기 데이터 (seed.sql)
```sql
-- 기본 컴포넌트 템플릿 데이터
INSERT INTO public.component_templates (name, category, template_code, props_schema, description) VALUES
('Button', 'essential', '/* Button template code */', '{"variant": "string", "size": "string"}', 'Primary UI button component'),
('Input', 'essential', '/* Input template code */', '{"type": "string", "placeholder": "string"}', 'Form input component'),
('Card', 'essential', '/* Card template code */', '{"title": "string", "content": "string"}', 'Content card component'),
('Modal', 'essential', '/* Modal template code */', '{"isOpen": "boolean", "onClose": "function"}', 'Modal dialog component'),
('Navigation', 'essential', '/* Navigation template code */', '{"items": "array"}', 'Navigation menu component'),
('Alert', 'essential', '/* Alert template code */', '{"type": "string", "message": "string"}', 'Alert notification component'),
('Loading', 'essential', '/* Loading template code */', '{"type": "string"}', 'Loading indicator component');

-- 기본 테마 템플릿
INSERT INTO public.themes (name, theme_data, is_template, user_id) VALUES
('Modern Blue', '{"name": "Modern Blue Theme", "colors": {"primary": {"50": "#eff6ff", "500": "#3b82f6", "900": "#1e3a8a"}}}', true, NULL),
('Classic Gray', '{"name": "Classic Gray Theme", "colors": {"primary": {"50": "#f8fafc", "500": "#64748b", "900": "#0f172a"}}}', true, NULL),
('Vibrant Purple', '{"name": "Vibrant Purple Theme", "colors": {"primary": {"50": "#faf5ff", "500": "#8b5cf6", "900": "#581c87"}}}', true, NULL);
```

## 4. 핵심 기능 요구사항

### 4.1 인증 시스템
#### 기능 설명
Supabase Auth를 이용한 사용자 인증 및 프로필 관리

#### 세부 요구사항
- **로그인/회원가입**: 이메일/비밀번호, OAuth (Google, GitHub)
- **프로필 관리**: 사용자명, 프로필 이미지, 계정 설정
- **권한 관리**: 무료/프리미엄 플랜 구분

### 4.2 프로젝트 관리 시스템
#### 기능 설명
사용자별 프로젝트 생성 및 관리

#### 세부 요구사항
- **프로젝트 CRUD**: 생성, 조회, 수정, 삭제
- **프로젝트 공유**: 팀원과 프로젝트 공유 및 권한 관리
- **프로젝트 대시보드**: 최근 프로젝트, 통계 정보

### 4.3 테마 입력 시스템
#### 기능 설명
사용자가 JSON 형태로 디자인 테마를 정의하고 저장할 수 있는 인터페이스

#### 세부 요구사항
- **JSON 에디터**: 구문 강조, 자동완성, 오류 검출 기능
- **테마 검증**: 입력된 JSON의 유효성 검사
- **테마 저장**: 데이터베이스에 테마 저장 및 버전 관리
- **사전 정의 템플릿**: Material, Bootstrap, Ant Design 스타일 템플릿 제공
- **실시간 미리보기**: JSON 수정 시 즉시 스타일 반영

#### JSON 스키마 예시
```json
{
  "name": "Modern Blue Theme",
  "colors": {
    "primary": {
      "50": "#eff6ff",
      "500": "#3b82f6",
      "900": "#1e3a8a"
    },
    "secondary": {
      "50": "#f8fafc",
      "500": "#64748b",
      "900": "#0f172a"
    }
  },
  "typography": {
    "fontFamily": {
      "sans": ["Inter", "sans-serif"],
      "mono": ["JetBrains Mono", "monospace"]
    },
    "fontSize": {
      "xs": "0.75rem",
      "sm": "0.875rem",
      "base": "1rem",
      "lg": "1.125rem"
    }
  },
  "spacing": {
    "xs": "0.25rem",
    "sm": "0.5rem",
    "md": "1rem",
    "lg": "1.5rem"
  },
  "borderRadius": {
    "none": "0",
    "sm": "0.125rem",
    "md": "0.375rem",
    "lg": "0.5rem"
  }
}
```

### 4.4 컴포넌트 생성 시스템
#### 필수 컴포넌트 (자동 생성)
1. **Button**: Primary, Secondary, Ghost, Danger 변형
2. **Input**: Text, Email, Password, Search 타입
3. **Card**: 기본 카드, 이미지 카드, 액션 카드
4. **Modal**: 확인, 경고, 정보 모달
5. **Navigation**: Header, Sidebar, Breadcrumb
6. **Alert**: Success, Warning, Error, Info
7. **Loading**: Spinner, Skeleton, Progress Bar

#### 선택적 컴포넌트 (사용자 선택)
1. **Form Components**: Select, Checkbox, Radio, Switch
2. **Data Display**: Table, Badge, Avatar, Tooltip
3. **Layout**: Grid, Container, Divider
4. **Media**: Image, Video, Carousel
5. **Chart**: Bar, Line, Pie, Donut (Chart.js 기반)
6. **Advanced**: DatePicker, FileUpload, Search

### 4.5 코드 생성 엔진
#### 출력 형식
- **React + TypeScript**: 함수형 컴포넌트
- **TailwindCSS**: 유틸리티 클래스 기반 스타일링
- **Props Interface**: 완전한 타입 정의
- **Storybook Ready**: args 및 controls 포함

#### 생성 코드 예시
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  children,
  onClick
}) => {
  const baseClasses = 'font-medium rounded-md transition-colors';
  const variantClasses = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600',
    secondary: 'bg-secondary-500 text-white hover:bg-secondary-600',
    // ... 테마 기반 클래스 자동 생성
  };
  
  return (
    <button
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size])}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
```

### 4.6 파일 저장 시스템
#### 기능 설명
생성된 디자인 시스템을 Supabase Storage에 저장하고 관리

#### 세부 요구사항
- **ZIP 파일 생성**: 전체 디자인 시스템을 ZIP으로 패키징
- **클라우드 저장**: Supabase Storage에 자동 업로드
- **다운로드 이력**: 사용자별 다운로드 기록 관리
- **파일 공유**: 생성된 파일의 공개 링크 제공

## 5. 사용자 경험 플로우

### 5.1 메인 워크플로우
1. **로그인/회원가입**: Supabase Auth를 통한 인증
2. **프로젝트 생성**: 새 프로젝트 생성 또는 기존 프로젝트 선택
3. **테마 입력**: JSON 에디터에서 테마 정의 또는 템플릿 선택
4. **컴포넌트 선택**: 필수 컴포넌트 + 원하는 선택적 컴포넌트 체크
5. **미리보기**: 실시간으로 생성된 컴포넌트들 확인
6. **저장**: 테마 및 선택사항을 데이터베이스에 저장
7. **코드 생성**: 완성된 컴포넌트들의 소스 코드 확인
8. **다운로드**: ZIP 파일로 전체 디자인 시스템 다운로드

### 5.2 UI 레이아웃
```
┌─────────────────────────────────────────────────────────┐
│              Header (Auth + Navigation)                 │
├─────────────────┬─────────────────────┬─────────────────┤
│                 │                     │                 │
│   Theme Editor  │   Component List    │   Live Preview  │
│   (JSON Input)  │   (Checkboxes)      │   (Rendered)    │
│   + Save Button │   + Auto-save       │   + Auto-update │
│                 │                     │                 │
├─────────────────┴─────────────────────┴─────────────────┤
│                  Generated Code View                     │
│             (Monaco Editor + Download)                   │
└─────────────────────────────────────────────────────────┘
```

## 6. 개발 로드맵 (Claude Code 기반)

### Phase 0: 환경 설정 및 데이터베이스 구축 (1일)
#### 목표
Supabase 프로젝트 생성, 데이터베이스 스키마 구축, GitHub 레포지토리 설정

#### 구현 내용
1. **Supabase 프로젝트 생성**
   - Supabase MCP를 통한 프로젝트 생성
   - 데이터베이스 테이블 생성 (위의 스키마 기준)
   - RLS 정책 설정
   - 초기 시드 데이터 삽입

2. **GitHub 레포지토리 설정**
   - GitHub MCP를 통한 레포지토리 생성
   - 기본 브랜치 보호 규칙 설정
   - README.md 초기 작성

3. **데이터베이스 연결 테스트**
   - 기본 CRUD 작업 테스트
   - 인증 시스템 동작 확인

#### Deliverable
- ✅ Supabase 프로젝트 및 데이터베이스 구축 완료
- ✅ GitHub 레포지토리 생성 및 설정 완료
- ✅ 데이터베이스 연결 및 기본 작업 검증 완료
- ✅ 초기 커밋 및 푸시 완료

### Phase 1: 프로젝트 초기 설정 및 인증 시스템 (2일)
#### 목표
Next.js 프로젝트 생성, Supabase 연동, 기본 인증 시스템 구현

#### 구현 내용
1. **프로젝트 생성**
   ```bash
   npx create-next-app@latest design-system-generator --typescript --tailwind --eslint --app
   ```

2. **Dependencies 설치**
   ```json
   {
     "dependencies": {
       "@supabase/supabase-js": "^2.38.0",
       "@supabase/auth-helpers-nextjs": "^0.8.0",
       "@monaco-editor/react": "^4.6.0",
       "zustand": "^4.4.1",
       "clsx": "^2.0.0",
       "tailwind-merge": "^1.14.0",
       "lucide-react": "^0.263.1"
     }
   }
   ```

3. **Supabase 클라이언트 설정** (`src/lib/supabase/`)
   - client.ts: Supabase 클라이언트 초기화
   - auth.ts: 인증 관련 함수들
   - queries.ts: 데이터베이스 쿼리 함수들

4. **기본 인증 시스템**
   - 로그인/회원가입 페이지
   - 프로필 관리 페이지
   - 보호된 라우트 구현

5. **기본 타입 정의** (`src/types/`)
   ```typescript
   export interface User {
     id: string;
     username?: string;
     full_name?: string;
     avatar_url?: string;
     plan_type: 'free' | 'premium';
   }
   
   export interface Project {
     id: string;
     user_id: string;
     name: string;
     description?: string;
     is_public: boolean;
     created_at: string;
     updated_at: string;
   }
   
   export interface Theme {
     id: string;
     project_id: string;
     user_id: string;
     name: string;
     theme_data: any;
     version: number;
     is_template: boolean;
     is_active: boolean;
     created_at: string;
     updated_at: string;
   }
   ```

#### Deliverable
- ✅ Next.js 프로젝트 생성 및 Supabase 연동 완료
- ✅ 기본 인증 시스템 구현 완료
- ✅ 데이터베이스 CRUD 작업 검증 완료
- ✅ GitHub 커밋 및 푸시 완료

### Phase 2: 테마 시스템 구축 (2일)
#### 목표
테마 관리 시스템, JSON 파싱 및 검증, 데이터베이스 연동

#### 구현 내용
1. **테마 파서** (`src/lib/theme-parser.ts`)
   - JSON 스키마 검증
   - TailwindCSS 클래스 매핑
   - 오류 처리 및 기본값 설정

2. **테마 데이터베이스 연동** (`src/lib/supabase/themes.ts`)
   ```typescript
   export async function createTheme(theme: Partial<Theme>) {
     // 테마 생성 로직
   }
   
   export async function updateTheme(id: string, updates: Partial<Theme>) {
     // 테마 업데이트 로직
   }
   
   export async function deleteTheme(id: string) {
     // 테마 삭제 로직
   }
   
   export async function getThemesByProject(projectId: string) {
     // 프로젝트별 테마 조회
   }
   ```

3. **테마 스토어** (`src/stores/theme-store.ts`)
   ```typescript
   interface ThemeStore {
     themes: Theme[];
     currentTheme: Theme | null;
     setCurrentTheme: (theme: Theme) => void;
     createTheme: (theme: Partial<Theme>) => Promise<void>;
     updateTheme: (id: string, updates: Partial<Theme>) => Promise<void>;
     deleteTheme: (id: string) => Promise<void>;
   }
   ```

4. **테마 템플릿 관리**
   - 데이터베이스에서 템플릿 조회
   - 사용자 정의 테마 저장
   - 테마 버전 관리

#### Deliverable
- ✅ 테마 파싱 및 검증 시스템 완성
- ✅ 데이터베이스 테마 CRUD 연동 완료
- ✅ 테마 템플릿 시스템 구현
- ✅ GitHub 커밋 및 푸시 완료

### Phase 3: UI 인터페이스 구축 (3일)
#### 목표
사용자 인터페이스 컴포넌트 개발, 실시간 데이터 연동

#### 구현 내용
1. **메인 레이아웃** (`src/app/dashboard/`)
   - 프로젝트 대시보드
   - 3단 레이아웃 (Editor | Components | Preview)
   - 반응형 디자인

2. **프로젝트 관리 UI** (`src/components/projects/`)
   - 프로젝트 생성/수정/삭제 폼
   - 프로젝트 목록 및 카드 뷰
   - 프로젝트 공유 관리

3. **JSON 에디터** (`src/components/editor/ThemeEditor.tsx`)
   - Monaco Editor 통합
   - 실시간 JSON 검증
   - 구문 강조 및 자동완성
   - 자동 저장 기능

4. **컴포넌트 선택 UI** (`src/components/generator/ComponentSelector.tsx`)
   - 데이터베이스에서 템플릿 조회
   - 카테고리별 컴포넌트 리스트
   - 체크박스 기반 선택
   - 선택 상태 자동 저장

#### Deliverable
- ✅ 반응형 메인 레이아웃 완성
- ✅ 프로젝트 관리 UI 구현
- ✅ Monaco Editor 및 자동 저장 기능 완료
- ✅ 컴포넌트 선택 UI 및 DB 연동 완료
- ✅ GitHub 커밋 및 푸시 완료

### Phase 4: 컴포넌트 생성 엔진 (3일)
#### 목표
테마 기반 React 컴포넌트 자동 생성 시스템, 생성 결과 저장

#### 구현 내용
1. **컴포넌트 템플릿 관리** (`src/lib/supabase/component-templates.ts`)
   - 데이터베이스에서 템플릿 조회
   - 템플릿 버전 관리
   - 커스텀 템플릿 추가

2. **코드 생성기** (`src/lib/component-generator.ts`)
   ```typescript
   interface ComponentGenerator {
     generateComponent(templateId: string, theme: Theme): GeneratedComponent;
     generateAll(selectedTemplates: string[], theme: Theme): GeneratedComponent[];
     saveGeneratedComponents(themeId: string, components: GeneratedComponent[]): Promise<void>;
   }
   ```

3. **스타일 매핑** (`src/lib/style-mapper.ts`)
   - 테마 → TailwindCSS 클래스 변환
   - 동적 클래스 생성
   - 반응형 클래스 처리

4. **생성 결과 저장**
   - generated_components 테이블에 결과 저장
   - 사용자별 생성 히스토리 관리
   - 생성 통계 및 분석

#### Deliverable
- ✅ 데이터베이스 기반 템플릿 시스템 완성
- ✅ 테마 기반 코드 생성 로직 구현
- ✅ 생성 결과 저장 및 관리 완료
- ✅ TypeScript 타입 안전성 보장
- ✅ GitHub 커밋 및 푸시 완료

### Phase 5: 미리보기 및 파일 관리 시스템 (3일)
#### 목표
실시간 미리보기, 파일 저장 및 다운로드, Supabase Storage 연동

#### 구현 내용
1. **실시간 미리보기** (`src/components/preview/ComponentPreview.tsx`)
   - 생성된 컴포넌트 실시간 렌더링
   - 다양한 상태 시뮬레이션
   - 반응형 테스트
   - 데이터베이스에서 생성 결과 실시간 로드

2. **코드 뷰어** (`src/components/generator/CodeViewer.tsx`)
   - 생성된 코드 표시
   - 복사 기능
   - 파일별 탭 구성
   - 코드 하이라이팅

3. **파일 저장 시스템** (`src/lib/file-manager.ts`)
   ```typescript
   interface FileManager {
     generateZipFile(themeId: string): Promise<Blob>;
     uploadToStorage(file: Blob, filename: string): Promise<string>;
     createDownloadRecord(userId: string, themeId: string, fileUrl: string): Promise<void>;
     getDownloadHistory(userId: string): Promise<Download[]>;
   }
   ```

4. **Supabase Storage 연동** (`src/lib/supabase/storage.ts`)
   - ZIP 파일 업로드
   - 파일 공개 URL 생성
   - 파일 삭제 및 정리
   - 용량 제한 관리

5. **다운로드 관리** (`src/components/downloads/`)
   - 다운로드 이력 조회
   - 파일 재다운로드
   - 공유 링크 생성

#### Deliverable
- ✅ 실시간 컴포넌트 미리보기 완성
- ✅ 코드 뷰어 및 복사 기능 구현
- ✅ Supabase Storage 연동 완료
- ✅ ZIP 파일 생성 및 다운로드 기능 완료
- ✅ 다운로드 이력 관리 시스템 구현
- ✅ GitHub 커밋 및 푸시 완료

### Phase 6: 협업 기능 및 최적화 (2일)
#### 목표
팀 협업 기능, 성능 최적화, 최종 테스트

#### 구현 내용
1. **테마 공유 시스템** (`src/components/sharing/`)
   - 테마 공유 초대 시스템
   - 권한 레벨 관리 (view/edit)
   - 공유 테마 목록 및 관리

2. **실시간 협업** (Supabase Realtime)
   ```typescript
   // 실시간 테마 변경 알림
   useEffect(() => {
     const channel = supabase
       .channel('theme-changes')
       .on('postgres_changes', {
         event: 'UPDATE',
         schema: 'public',
         table: 'themes',
         filter: `id=eq.${themeId}`
       }, (payload) => {
         // 실시간 업데이트 처리
       })
       .subscribe();
     
     return () => supabase.removeChannel(channel);
   }, [themeId]);
   ```

3. **성능 최적화**
   - 코드 분할 및 지연 로딩
   - 이미지 최적화
   - 캐싱 전략 구현
   - 번들 크기 최적화

4. **최종 테스트 및 배포 준비**
   - E2E 테스트 시나리오 작성
   - 성능 테스트
   - 보안 검토
   - 배포 설정

#### Deliverable
- ✅ 팀 협업 기능 완성
- ✅ 실시간 협업 시스템 구현
- ✅ 성능 최적화 완료
- ✅ 최종 테스트 및 배포 준비 완료
- ✅ GitHub 최종 커밋 및 푸시 완료

## 7. GitHub 워크플로우

### 7.1 브랜치 전략
```
main
├── develop
├── feature/phase-0-setup
├── feature/phase-1-auth
├── feature/phase-2-themes
├── feature/phase-3-ui
├── feature/phase-4-generator
├── feature/phase-5-files
└── feature/phase-6-collaboration
```

### 7.2 커밋 컨벤션
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅, 세미콜론 누락 등
refactor: 코드 리팩토링
test: 테스트 코드 추가
chore: 빌드 업무 수정, 패키지 매니저 수정

예시:
feat(auth): implement Supabase authentication system
feat(themes): add theme parser and validation
fix(db): resolve RLS policy issue for themes table
```

### 7.3 각 Phase별 GitHub 작업
1. **Phase 시작**: 새 feature 브랜치 생성
2. **작업 중**: 중간 저장 커밋 (WIP: work in progress)
3. **Phase 완료**: 최종 커밋 후 develop에 merge
4. **전체 완료**: develop을 main에 merge

## 8. Supabase MCP 활용 계획

### 8.1 데이터베이스 관리
- **테이블 생성**: 각 Phase에서 필요한 테이블 순차 생성
- **마이그레이션**: 스키마 변경 시 마이그레이션 파일 생성
- **시드 데이터**: 개발/테스트용 초기 데이터 관리
- **백업**: 주요 마일스톤마다 데이터베이스 백업

### 8.2 실시간 데이터 모니터링
- **성능 모니터링**: 쿼리 성능 및 인덱스 사용률 확인
- **사용량 추적**: API 호출량, 스토리지 사용량 모니터링
- **오류 추적**: 데이터베이스 오류 및 연결 문제 모니터링

### 8.3 보안 관리
- **RLS 정책**: 행 레벨 보안 정책 설정 및 테스트
- **API 키 관리**: 환경별 API 키 분리 관리
- **접근 권한**: 데이터베이스 접근 권한 최소화

## 9. 성능 및 제약사항

### 9.1 성능 요구사항
- **초기 로딩**: 3초 이내
- **테마 변경 반영**: 500ms 이내
- **코드 생성**: 2초 이내 (10개 컴포넌트 기준)
- **미리보기 업데이트**: 실시간 (디바운싱 300ms)
- **데이터베이스 쿼리**: 평균 100ms 이내

### 9.2 Supabase 제약사항
- **무료 플랜**: 500MB 데이터베이스, 1GB 스토리지
- **API 호출**: 시간당 제한 있음
- **동시 연결**: 최대 60개 연결
- **파일 크기**: 최대 50MB per file

### 9.3 기술적 제약사항
- **브라우저 지원**: Chrome 90+, Firefox 88+, Safari 14+
- **파일 크기**: 생성되는 ZIP 파일 최대 10MB
- **컴포넌트 수**: 최대 50개 동시 생성
- **JSON 크기**: 최대 1MB 테마 설정
- **동시 사용자**: 프리미엄 플랜 기준 팀당 10명

## 10. 보안 요구사항

### 10.1 데이터 보안
- **암호화**: 민감한 데이터 암호화 저장
- **접근 제어**: RLS를 통한 사용자별 데이터 격리
- **API 보안**: API 키 및 토큰 보안 관리
- **파일 보안**: 업로드 파일 검증 및 스캔

### 10.2 사용자 인증
- **강력한 비밀번호**: 비밀번호 복잡도 요구사항
- **2단계 인증**: 프리미엄 사용자 대상 2FA 제공
- **세션 관리**: 안전한 세션 관리 및 자동 로그아웃
- **OAuth 보안**: 소셜 로그인 보안 설정

## 11. 테스트 전략

### 11.1 단위 테스트
- 테마 파서 로직
- 컴포넌트 생성기 함수
- 유틸리티 함수들
- Supabase 쿼리 함수들

### 11.2 통합 테스트
- 데이터베이스 CRUD 작업
- 인증 플로우
- 파일 업로드/다운로드
- JSON 입력 → 코드 생성 전체 플로우

### 11.3 E2E 테스트
- 사용자 회원가입부터 다운로드까지 전체 시나리오
- 다양한 브라우저 호환성 테스트
- 반응형 디자인 테스트
- 성능 테스트

## 12. 배포 및 DevOps

### 12.1 배포 환경
- **Production**: Vercel (Next.js 최적화)
- **Staging**: Vercel Preview Deployments
- **Development**: Local + Supabase Dev

### 12.2 CI/CD 파이프라인
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test
      - run: npm run build
      
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### 12.3 환경 변수 관리
```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 13. 모니터링 및 분석

### 13.1 사용자 분석
- 테마 생성 패턴 분석
- 가장 인기 있는 컴포넌트 추적
- 사용자 이탈 지점 분석
- 다운로드 통계

### 13.2 성능 모니터링
- Core Web Vitals 추적
- 데이터베이스 쿼리 성능
- API 응답 시간
- 오류율 및 예외 추적

### 13.3 비즈니스 지표
- 사용자 등록률
- 유료 플랜 전환율
- 일일/월간 활성 사용자
- 테마 공유 및 협업 사용률

## 14. 성공 지표 (KPI)

### 14.1 사용성 지표
- **완성도**: 테마 입력 → 다운로드 완료율 80% 이상
- **만족도**: 생성된 컴포넌트 품질 평가 4.5/5 이상
- **효율성**: 기존 수동 작업 대비 시간 단축 90% 이상
- **재사용률**: 사용자별 평균 테마 재사용 횟수 3회 이상

### 14.2 기술적 지표
- **성능**: Core Web Vitals 모든 지표 Green
- **안정성**: 99.9% 가동 시간
- **오류율**: 1% 미만
- **응답 시간**: 데이터베이스 쿼리 평균 100ms 이내

### 14.3 비즈니스 지표
- **사용자 증가**: 월 20% 이상 신규 사용자 증가
- **협업 사용**: 팀 기능 사용률 60% 이상
- **데이터 품질**: 유효한 테마 생성률 95% 이상

## 15. 향후 확장 계획

### 15.1 Version 2.0 (3개월 후)
- **다중 프레임워크 지원**: Vue.js, Angular 컴포넌트 생성
- **AI 테마 생성**: GPT를 활용한 자동 테마 추천
- **고급 컴포넌트**: 복잡한 UI 패턴 지원

### 15.2 Version 2.1 (6개월 후)
- **디자인 도구 연동**: Figma, Sketch 플러그인
- **테마 마켓플레이스**: 커뮤니티 테마 공유 플랫폼
- **버전 관리**: Git 스타일 테마 버전 관리

### 15.3 Version 3.0 (1년 후)
- **엔터프라이즈 기능**: SSO, 고급 권한 관리
- **화이트라벨**: 기업용 커스터마이징
- **API 제공**: 서드파티 통합을 위한 RESTful API

---

## Claude Code 개발 진행 방식

### 개발 환경 설정
1. **Claude Code 설치 및 설정**
2. **Supabase MCP 및 GitHub MCP 활성화**
3. **프로젝트 폴더 생성 및 권한 설정**

### 각 Phase별 작업 순서
1. **Phase 0부터 순차적 진행**
2. **각 Phase 완료 시 GitHub 커밋 및 푸시**
3. **Supabase 데이터베이스 변경사항 적용**
4. **기능 테스트 후 다음 Phase 진행**

### 체크리스트
- [ ] Phase 0: 환경 설정 및 데이터베이스 구축
- [ ] Phase 1: 프로젝트 초기 설정 및 인증 시스템  
- [ ] Phase 2: 테마 시스템 구축
- [ ] Phase 3: UI 인터페이스 구축
- [ ] Phase 4: 컴포넌트 생성 엔진
- [ ] Phase 5: 미리보기 및 파일 관리 시스템
- [ ] Phase 6: 협업 기능 및 최적화

각 Phase는 독립적으로 테스트 가능하며, 점진적으로 기능을 확장해나가는 방식으로 안정적인 개발이 가능합니다.