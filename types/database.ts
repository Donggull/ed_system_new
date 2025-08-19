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
    fontWeight?: {
      [key: string]: string
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

// Enhanced Design System interfaces for save/share functionality
export interface DesignSystem {
  id: string
  user_id: string
  name: string
  description?: string
  theme_data: ThemeData
  selected_components: string[]
  component_settings?: ComponentSettings
  tags: string[]
  version: number
  is_public: boolean
  is_featured: boolean
  share_token?: string
  like_count: number
  download_count: number
  view_count: number
  created_at: string
  updated_at: string
}

export interface DesignSystemVersion {
  id: string
  design_system_id: string
  version_number: number
  name: string
  description?: string
  theme_data: ThemeData
  selected_components: string[]
  component_settings?: ComponentSettings
  change_notes?: string
  created_at: string
}

export interface SharedDesignSystem {
  id: string
  design_system_id: string
  shared_by_user_id: string
  shared_with_user_id?: string // null for public shares
  share_token: string
  permission_level: 'view' | 'edit' | 'clone'
  is_public: boolean
  expires_at?: string
  access_count: number
  created_at: string
  updated_at: string
}

export interface UserFavorite {
  id: string
  user_id: string
  design_system_id: string
  created_at: string
}

export interface DesignSystemLike {
  id: string
  user_id: string
  design_system_id: string
  created_at: string
}

export interface DesignSystemComment {
  id: string
  user_id: string
  design_system_id: string
  content: string
  parent_comment_id?: string
  created_at: string
  updated_at: string
}

export interface DesignSystemTag {
  id: string
  name: string
  color: string
  created_at: string
}

export interface DesignSystemCategory {
  id: string
  name: string
  description?: string
  icon?: string
  sort_order: number
  created_at: string
}

export interface Collection {
  id: string
  user_id: string
  name: string
  description?: string
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface CollectionItem {
  id: string
  collection_id: string
  design_system_id: string
  sort_order: number
  created_at: string
}