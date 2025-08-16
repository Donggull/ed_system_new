import { ThemeData, ColorPalette } from '@/types/database'

export const defaultTheme: ThemeData = {
  name: 'Default Theme',
  colors: {
    primary: {
      '50': '#eff6ff',
      '100': '#dbeafe',
      '200': '#bfdbfe',
      '300': '#93c5fd',
      '400': '#60a5fa',
      '500': '#3b82f6',
      '600': '#2563eb',
      '700': '#1d4ed8',
      '800': '#1e40af',
      '900': '#1e3a8a',
    },
    secondary: {
      '50': '#f8fafc',
      '100': '#f1f5f9',
      '200': '#e2e8f0',
      '300': '#cbd5e1',
      '400': '#94a3b8',
      '500': '#64748b',
      '600': '#475569',
      '700': '#334155',
      '800': '#1e293b',
      '900': '#0f172a',
    },
    success: {
      '50': '#f0fdf4',
      '100': '#dcfce7',
      '200': '#bbf7d0',
      '300': '#86efac',
      '400': '#4ade80',
      '500': '#22c55e',
      '600': '#16a34a',
      '700': '#15803d',
      '800': '#166534',
      '900': '#14532d',
    }
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'ui-monospace', 'monospace']
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem'
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    full: '9999px'
  }
}

export function generateTailwindClasses(theme: ThemeData) {
  const classes: { [key: string]: string } = {}
  
  // Generate color classes
  Object.entries(theme.colors).forEach(([colorName, palette]) => {
    Object.entries(palette).forEach(([shade, value]) => {
      classes[`${colorName}-${shade}`] = value
    })
  })
  
  return classes
}

export function validateThemeData(data: any): data is ThemeData {
  if (!data || typeof data !== 'object') return false
  if (!data.name || typeof data.name !== 'string') return false
  if (!data.colors || typeof data.colors !== 'object') return false
  if (!data.colors.primary || !data.colors.secondary) return false
  
  return true
}

export function mergeThemeWithDefaults(partialTheme: Partial<ThemeData>): ThemeData {
  return {
    ...defaultTheme,
    ...partialTheme,
    colors: {
      ...defaultTheme.colors,
      ...partialTheme.colors
    },
    typography: {
      ...defaultTheme.typography,
      ...partialTheme.typography
    },
    spacing: {
      ...defaultTheme.spacing,
      ...partialTheme.spacing
    },
    borderRadius: {
      ...defaultTheme.borderRadius,
      ...partialTheme.borderRadius
    }
  }
}