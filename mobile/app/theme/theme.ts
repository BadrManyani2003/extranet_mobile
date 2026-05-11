import { createTheme } from '@shopify/restyle';
import { rsp } from '../utils/responsive';

/**
 * Palette de Couleurs - Clean & Simple Light Mode
 */
const palette = {
  primary:      '#0077B6', 
  primaryLight: '#00B4D8',
  primaryBg:    '#F0F9FF',
  
  text:         '#0F172A',
  textSecondary:'#475569',
  textTertiary: '#94A3B8',
  
  white:        '#FFFFFF',
  background:   '#F8FAFC',
  cardBg:       '#FFFFFF',
  border:       '#E2E8F0',
  
  success:      '#10B981',
  warning:      '#F59E0B',
  error:        '#EF4444',
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
    
    success: palette.success,
    warning: palette.warning,
    error: palette.error,
    
    transparent: 'transparent',
    white: palette.white,
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
  },
  borderRadii: {
    xs: 4,
    s: 8,
    m: 12,
    l: 16,
    xl: 20,
    round: 999,
    none: 0,
  },
  textVariants: {
    defaults: {
      fontSize: rsp.normalize(15),
      color: 'text',
    },
    header: {
      fontSize: rsp.normalize(24),
      fontWeight: '700',
    },
    title: {
      fontSize: rsp.normalize(18),
      fontWeight: '700',
    },
    body: {
      fontSize: rsp.normalize(15),
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
  },
});

export type Theme = typeof lightTheme;
export type ThemeType = 'light';

export { lightTheme };
