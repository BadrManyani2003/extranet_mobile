import { createTheme } from '@shopify/restyle';
import { rsp } from '../utils/responsive';

/**
 * Palette de Couleurs - Premium Inspiration from Client Frontend
 */
const palette = {
  // Brand colors
  primary:      '#0F172A', // Slate 900 (Client style)
  primaryLight: '#334155', // Slate 700
  primaryBg:    '#F1F5F9', // Slate 100
  
  // UI Colors
  background:   '#F8FAFC', // Slate 50
  cardBg:       '#FFFFFF',
  white:        '#FFFFFF',
  
  // Text
  text:         '#0F172A',
  textSecondary:'#475569',
  textTertiary: '#94A3B8',
  
  // Accents
  accent:       '#3B82F6', // Blue 500
  accentBg:     '#EFF6FF',
  
  // Semantic
  success:      '#10B981',
  warning:      '#F59E0B',
  error:        '#EF4444',
  
  successBg:    '#ECFDF5',
  warningBg:    '#FFFBEB',
  errorBg:      '#FEF2F2',
  
  border:       '#E2E8F0',
  borderLight:  '#F1F5F9',
  
};

const lightTheme = createTheme({
  colors: {
    primary: palette.primary,
    primaryBg: palette.primaryBg,
    
    background: palette.background,
    cardBackground: palette.cardBg,
    
    text: palette.text,
    textSecondary: palette.textSecondary,
    textTertiary: palette.textTertiary,
    textInverse: palette.white,
    
    border: palette.border,
    borderLight: palette.borderLight,
    
    success: palette.success,
    successBg: palette.successBg,
    successLight: palette.successBg,
    
    warning: palette.warning,
    warningBg: palette.warningBg,
    warningLight: palette.warningBg,
    
    error: palette.error,
    errorBg: palette.errorBg,
    errorLight: palette.errorBg,
    
    info: palette.accent,
    infoBg: palette.accentBg,
    
    white: palette.white,
    transparent: 'transparent',
  },
  spacing: {
    none: 0,
    xxs: rsp.scale(4),
    xs: rsp.scale(8),
    s: rsp.scale(12),
    m: rsp.scale(16),
    l: rsp.scale(20),
    xl: rsp.scale(28),
    xxl: rsp.scale(40),
    xxxl: rsp.scale(60),
  },
  borderRadii: {
    none: 0,
    xs: 4,
    s: 8,
    m: 12,
    l: 16,
    xl: 24,
    xxl: 32,
    '3xl': 40,
    round: 999,
  },
  breakpoints: {
    phone: 0,
    tablet: 768,
  },
  textVariants: {
    defaults: {
      fontSize: rsp.normalize(15),
      color: 'text',
      // fontFamily: 'System', // Placeholder for Outfit if needed
    },
    header: {
      fontSize: rsp.normalize(26),
      fontWeight: '900',
      color: 'primary',
      letterSpacing: -0.5,
    },
    subheader: {
      fontSize: rsp.normalize(20),
      fontWeight: '800',
      color: 'primary',
    },
    title: {
      fontSize: rsp.normalize(18),
      fontWeight: '700',
    },
    premiumLabel: {
      fontSize: rsp.normalize(10),
      fontWeight: '900',
      textTransform: 'uppercase',
      letterSpacing: 2,
      color: 'textTertiary',
    },
    button: {
      fontSize: rsp.normalize(14),
      fontWeight: '900',
      textTransform: 'uppercase',
      letterSpacing: 1.5,
      color: 'white',
    },
    body: {
      fontSize: rsp.normalize(15),
      lineHeight: 22,
    },
    bodyMedium: {
      fontSize: rsp.normalize(15),
      fontWeight: '500',
    },
    bodySmall: {
      fontSize: rsp.normalize(13),
      color: 'textSecondary',
    },
    caption: {
      fontSize: rsp.normalize(12),
      color: 'textTertiary',
    },
    labelBold: {
      fontSize: rsp.normalize(12),
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
  },
});

export type Theme = typeof lightTheme;
export type ThemeType = 'light';

export { lightTheme };
