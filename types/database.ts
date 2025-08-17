export interface User {
  id: string
  username?: string
  full_name?: string
  avatar_url?: string
  plan_type: 'free' | 'premium'
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  user_id: string
  name: string
  description?: string
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface Theme {
  id: string
  project_id?: string
  user_id?: string
  name: string
  theme_data: ThemeData
  selected_components?: string[]
  component_settings?: ComponentSettings
  version: number
  is_template: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ThemeData {
  name: string
  colors: {
    primary: ColorPalette
    secondary: ColorPalette
    success?: ColorPalette
    warning?: ColorPalette
    error?: ColorPalette
  }
  typography: {
    fontFamily: {
      sans: string[]
      mono: string[]
    }
    fontSize: {
      xs: string
      sm: string
      base: string
      lg: string
      xl: string
      '2xl': string
      '3xl': string
      '4xl': string
    }
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
    '2xl': string
  }
  borderRadius: {
    none: string
    sm: string
    md: string
    lg: string
    full: string
  }
}

export interface ColorPalette {
  '50': string
  '100': string
  '200': string
  '300': string
  '400': string
  '500': string
  '600': string
  '700': string
  '800': string
  '900': string
}

export interface ComponentTemplate {
  id: string
  name: string
  category: 'essential' | 'optional'
  template_code: string
  props_schema: ComponentPropsSchema
  description?: string
  is_active: boolean
  created_at: string
}

export interface ComponentPropsSchema {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'function'
    required?: boolean
    default?: any
    options?: string[]
    description?: string
  }
}

export interface ComponentSettings {
  [componentId: string]: {
    [propKey: string]: any
  }
}

export interface GeneratedComponent {
  id: string
  theme_id: string
  component_type: string
  component_name: string
  component_code: string
  props_schema?: ComponentPropsSchema
  is_selected: boolean
  created_at: string
}

export interface Download {
  id: string
  user_id: string
  theme_id: string
  file_url?: string
  file_size?: number
  download_count: number
  created_at: string
}

export interface ThemeShare {
  id: string
  theme_id: string
  shared_by: string
  shared_with: string
  permission_level: 'view' | 'edit'
  created_at: string
}