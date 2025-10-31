/**
 * Shared UI Theme Tokens
 * Centralized design tokens for colors, typography, and spacing
 * Following El Bruto's visual aesthetic
 */

export const COLORS = {
  // Primary palette
  primary: '#8B4513',      // Saddle Brown - main branding
  primaryDark: '#654321',  // Dark brown
  primaryLight: '#A0522D', // Sienna
  secondary: '#6c757d',    // Gray for secondary buttons

  // UI colors
  background: '#1a1a1a',   // Dark background
  surface: '#2d2d2d',      // Surface/panel color
  border: '#404040',       // Border color
  inputBg: '#2d2d2d',      // Input field background
  overlay: '#000000',      // Modal overlay backdrop

  // Text colors
  textPrimary: '#ffffff',
  textSecondary: '#b3b3b3',
  textDisabled: '#666666',

  // Semantic colors
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  info: '#2196F3',

  // Combat colors
  damage: '#ff3333',       // Red for damage numbers
  critical: '#ff6600',     // Orange for critical hits
  dodge: '#888888',        // Gray for dodge/miss
  heal: '#00ff00',         // Green for healing

  // HP bar colors
  hpFull: '#4CAF50',
  hpMid: '#FFC107',
  hpLow: '#F44336',
} as const;

export const TYPOGRAPHY = {
  // Font families
  fontFamily: {
    primary: 'Arial, sans-serif',
    mono: 'Courier New, monospace',
  },

  // Font sizes (in pixels)
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 20,
    xl: 24,
    '2xl': 32,
    '3xl': 48,
  },

  // Font weights
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;

export const SPACING = {
  // Spacing scale (in pixels)
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

export const LAYOUT = {
  // Common layout dimensions
  buttonHeight: 48,
  inputHeight: 40,
  headerHeight: 60,
  sidebarWidth: 240,

  // Border radius
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999,
  },

  // Z-index layers
  zIndex: {
    base: 0,
    dropdown: 1000,
    modal: 2000,
    tooltip: 3000,
    notification: 4000,
  },
} as const;

// Animation durations (in milliseconds)
export const ANIMATION = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;

// Game-specific constants
export const GAME_CONFIG = {
  // Canvas dimensions
  width: 1280,
  height: 720,

  // Target frame rate
  fps: 60,
} as const;
