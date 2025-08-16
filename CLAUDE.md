# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Education System built with Next.js 14, TypeScript, and TailwindCSS. The application provides a modern interface for managing educational content including students, courses, dashboards, and reports.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev          # Runs on http://localhost:3000

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Architecture

### Technology Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Font**: Inter (Google Fonts)

### Project Structure
```
app/
├── layout.tsx       # Root layout with metadata and Inter font
├── page.tsx         # Home page with navigation grid
└── globals.css      # Global TailwindCSS styles
```

### Key Features
- **Home Page**: Grid navigation to main sections (Dashboard, Students, Courses, Reports)
- **Responsive Design**: TailwindCSS utilities for mobile-first design
- **Dark Mode**: Built-in dark mode styles with TailwindCSS
- **Korean Language**: Default language set to Korean ("ko")

## Code Patterns

### Component Structure
- Uses functional components with TypeScript
- Consistent use of TailwindCSS utility classes
- Responsive design with mobile-first approach
- Hover effects and transitions on interactive elements

### Styling Conventions
- Follows TailwindCSS utility-first approach
- Uses semantic color schemes (gray-300, neutral-800, etc.)
- Implements dark mode variants (dark:bg-zinc-800/30, etc.)
- Consistent spacing and typography scale

## Development Notes

- App Router is used instead of Pages Router
- All components are server components by default
- Korean text is used throughout the application
- Inter font is preloaded for performance

## Navigation Structure

The application's main navigation includes:
- `/dashboard` - Educational statistics and status overview
- `/students` - Student information management and tracking
- `/courses` - Course and curriculum management
- `/reports` - Performance analysis and report generation

## Future Development

When adding new features, follow these conventions:
- Use App Router file-based routing
- Maintain TypeScript strict mode
- Follow TailwindCSS utility-first approach
- Keep components simple and focused
- Use Korean language for user-facing text