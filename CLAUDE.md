# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Design System Generator** - a Next.js web application that generates TailwindCSS-based React components from JSON theme configurations. Users can input JSON themes and automatically generate a complete design system with reusable React components.

**Core Workflow**: JSON Theme Input → Component Selection → Auto-Generated React Components → ZIP Download

## Development Commands

```bash
# Development
npm run dev          # Start development server (localhost:3000)
npm run build        # Production build with Next.js optimization
npm run start        # Start production server
npm run lint         # Run ESLint for code quality

# Type checking
npx tsc --noEmit     # TypeScript compilation check without output (CRITICAL for development)

# Git workflow
# Use mcp__github-mcp__git-* commands for git operations when available
# Standard git commands work as fallback: git add, git commit, git push
```

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State**: React Context for auth, local state for theme management
- **Styling**: TailwindCSS with CSS custom properties for dynamic theming

### Key Directories
```
app/                     # Next.js pages (App Router)
├── page.tsx            # Main dashboard with component preview
├── auth/               # Authentication pages  
├── design-system/      # JSON theme editor with real-time preview
└── dashboard/          # User dashboard

components/             # React components
├── auth/              # Authentication components
└── preview/           # Component preview canvas

lib/                   # Core business logic
├── supabase/          # Database queries and auth
├── component-templates.ts    # Main component template aggregator
├── additional-component-templates.ts  # Extended component library
├── chart-component-templates.ts       # Chart.js based components
├── enhanced-component-templates.ts    # Enhanced UI components
├── extended-component-templates.ts    # Advanced UI components
├── image-component-templates.ts       # Image handling components
├── component-generator.ts    # Theme → React component generation (to be implemented)
├── theme-utils.ts    # Theme parsing and CSS variable generation
├── theme-manager.ts  # Theme state management utilities
└── utils.ts          # Shared utilities

types/
└── database.ts       # TypeScript interfaces for all data models
```

### Component Template System

The core architecture revolves around a **template-based component generation system**:

1. **Component Templates** (`lib/*-component-templates.ts`): Define React component code templates with CSS custom property placeholders (`hsl(var(--color-primary-500))`)
2. **Theme Data** (`types/database.ts` - `ThemeData`): JSON structure defining colors, typography, spacing, border radius
3. **Theme Processing** (`lib/theme-utils.ts`): Parses JSON theme data, generates CSS variables, applies dynamic styling
4. **Component Generator** (`lib/component-generator.ts`): Processes templates + theme data → final React components
5. **Code Generator** (`lib/code-generator.ts`): Advanced generation with framework options (React/Vue/HTML) and output formats
6. **Database Storage**: Templates stored in `component_templates` table, generated components in `generated_components`

**CSS Variable System**: Components use CSS custom properties for theming (e.g., `hsl(var(--color-primary-500))`) which are dynamically generated from theme JSON and applied via `applyCssVariables()` function.

**Template Categories**: The system includes 40+ components across multiple specialized files:
- Basic UI (`component-templates.ts`): Buttons, inputs, cards, modals
- Enhanced (`enhanced-component-templates.ts`): Advanced UI patterns
- Charts (`chart-component-templates.ts`): Chart.js based data visualizations
- Images (`image-component-templates.ts`): Image handling and processing
- Extended (`extended-component-templates.ts`): Complex component patterns

### Database Schema (Supabase)

**Core Tables:**
- `themes` - User theme configurations (JSONB theme_data)
- `component_templates` - Reusable component templates with props schema
- `generated_components` - Generated component code linked to themes
- `projects` - User project containers
- `downloads` - File download history

**Key Relationships:**
- User → Projects → Themes → Generated Components
- Component Templates (shared) → Generated Components (user-specific)

### Authentication Flow
- Supabase Auth with email/password
- Context provider in `contexts/AuthContext.tsx`
- Protected routes via `components/auth/ProtectedRoute.tsx`
- Row Level Security (RLS) policies for data access
- Client configuration in `lib/supabase/client.ts` with enhanced environment variable detection

## Development Patterns

### Component Template Development
When adding new component templates:

1. **Add to appropriate template file** (`lib/*-component-templates.ts`)
2. **Follow template structure**:
   ```typescript
   export const NEW_COMPONENT_TEMPLATE = `import React from 'react'
   // Component code with theme variable placeholders
   // Use hsl(var(--color-primary-500)) for theme colors
   `
   
   // Add to templates array with proper metadata
   export const templateArray: ComponentTemplate[] = [
     {
       id: 'unique-id',
       name: 'Display Name', 
       category: 'essential' | 'optional',
       template_code: NEW_COMPONENT_TEMPLATE,
       props_schema: { /* TypeScript prop definitions */ },
       description: 'Component description',
       is_active: true,
       created_at: new Date().toISOString()
     }
   ]
   ```

3. **Theme Integration**: Use CSS custom properties format `hsl(var(--color-primary-500))` for dynamic theming
4. **Props Schema**: Define all component props with types, defaults, and options (must be `string[]` for options)
5. **Template Aggregation**: All templates are collected in `component-templates.ts` via `allComponentTemplates` array

### Supabase Integration Patterns
- **Client**: Use `lib/supabase/client.ts` for client-side operations
- **Queries**: Organized by feature in `lib/supabase/` (auth.ts, themes.ts, components.ts)
- **Types**: All database interfaces in `types/database.ts`
- **Error Handling**: Always check for Supabase client availability with null checks

### State Management
- **Authentication**: React Context (`contexts/AuthContext.tsx`) with Supabase Auth
- **Theme State**: Local state in main app (`app/page.tsx`), persisted to Supabase via `saveTheme()`
- **Component Selection**: Local state with `selectedComponents` array and `componentSettings` object
- **Real-time Preview**: Theme changes trigger CSS variable regeneration and immediate UI updates
- **Generated Components**: Fetched from database on demand
- **Design System State**: Managed via `useDesignSystem` hook in `lib/hooks/useDesignSystem.ts`

### Error Handling and Environment
- **Supabase Client**: Robust null-checking throughout codebase for offline/invalid environment scenarios
- **Environment Variables**: Enhanced detection in `lib/supabase/client.ts` with production fallbacks
- **TypeScript**: Strict mode enabled with comprehensive type checking via `npx tsc --noEmit`

## Current Implementation Status

**✅ Completed:**
- Authentication system with Supabase Auth and protected routes
- Main dashboard with component selection and real-time theme preview (`app/page.tsx`)
- JSON theme editor with live CSS variable generation (`/design-system`, `/design-system-v2`)
- Comprehensive component template library (40+ components across multiple files)
- Theme parsing and CSS variable generation (`lib/theme-utils.ts`)
- Database schema and CRUD operations for themes, components, users
- TypeScript type system with comprehensive interfaces
- Component selection state management and settings configuration
- Design system sharing and discovery features (`components/design-system/`)
- Advanced code generation framework (`lib/code-generator.ts`)

**🚧 In Progress:**
- Component generation engine implementation (`lib/component-generator.ts`)
- ZIP file generation and download system (JSZip dependency ready)

**🎯 Next Priority:**
- Complete the core generation workflow connecting templates to downloadable components
- Enhanced component customization UI
- Theme template management and version control

## Environment Setup

**Required Environment Variables:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # For admin operations
```

**Database**: Tables are defined and can be created via Supabase migrations or SQL scripts in the existing CLAUDE.md PRD section.

## Key Files to Understand

1. **`app/page.tsx`** - Main dashboard with component selection, theme management, and real-time preview
2. **`app/design-system/page.tsx`** - Dedicated JSON theme editor with live preview
3. **`app/design-system-v2/page.tsx`** - Enhanced theme editor with simplified interface
4. **`lib/component-templates.ts`** - Main component template aggregator importing all template libraries
5. **`lib/theme-utils.ts`** - Core theme processing: JSON parsing, CSS variable generation, theme application
6. **`lib/code-generator.ts`** - Advanced code generation with multi-framework support
7. **`lib/component-generator.ts`** - Core template-to-component generation engine
8. **`types/database.ts`** - Complete TypeScript interfaces for all data models
9. **`contexts/AuthContext.tsx`** - Authentication state management with Supabase
10. **`lib/supabase/client.ts`** - Supabase client with enhanced environment detection
11. **`components/design-system/`** - Design system management UI components

## Development Focus

The application follows a **main-page-centric approach** - all core functionality should be implemented on the main dashboard before expanding to sub-pages. The primary development focus should be connecting the JSON theme editor to the component generation system for the core user workflow.

## Critical Development Patterns

### Template System Integration
- When working with templates, always test with `npx tsc --noEmit` before committing
- Template code must use CSS custom properties (`hsl(var(--color-primary-500))`) for dynamic theming
- All template modifications must update the corresponding aggregator in `component-templates.ts`

### Supabase Integration Requirements  
- Always check `if (!supabase)` before database operations due to environment-dependent client creation
- Use type-safe database operations with the Database types in `lib/supabase/client.ts`
- Leverage the existing query patterns in `lib/supabase/` for consistency

### Component Generation Workflow
1. Templates (`lib/*-component-templates.ts`) define base component code
2. Theme data gets processed via `lib/theme-utils.ts` to generate CSS variables
3. `lib/component-generator.ts` merges templates with theme variables
4. `lib/code-generator.ts` handles advanced output formatting and multi-framework support
5. ZIP generation uses JSZip for downloadable component packages

## Dependencies and Libraries

**Core Dependencies:**
- `@supabase/supabase-js` & `@supabase/ssr` - Database and authentication
- `jszip` & `@types/jszip` - ZIP file generation for component downloads  
- `html2canvas` - Component screenshot generation
- `clsx` & `tailwind-merge` - Conditional CSS class utilities
- `zod` - Runtime type validation

**Development Stack:**
- Next.js 14 with App Router (file-based routing in `app/` directory)
- TypeScript 5.5+ (strict mode enabled)
- TailwindCSS 3.4+ with PostCSS and Autoprefixer
- ESLint with Next.js configuration