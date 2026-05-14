import { Platform } from 'react-native';
import { createTheme } from '@shopify/restyle';
import { rsp } from '../utils/responsive';

/**
 * Palette de Couleurs - Premium Inspiration from Client Frontend
 */
const palette = {
  // Brand colors - Insurance Sky Blue Theme (Professional/Expert)
  primary:      '#075985', // Sky 800 - Deep professional blue
  primaryLight: '#0EA5E9', // Sky 500 - Vibrant sky blue
  primaryBg:    '#F0F9FF', // Sky 50
  
  secondary:    '#0284C7', // Sky 600
  secondaryBg:  '#E0F2FE', // Sky 100
  
  // UI Colors
  background:   '#FFFFFF', 
  cardBg:       '#FFFFFF',
  white:        '#FFFFFF',
  
  // Text (Expert Typography Palette - All Navy/Blue Shades)
  text:         '#082F49', // Sky 950 - Deepest Navy
  textSecondary:'#0C4A6E', // Sky 900 - Deep Navy
  textTertiary: '#075985', // Sky 800 - Professional Blue
  textMuted:    '#0369A1', // Sky 700 - Brand Blue
  
  // Accents
  accent:       '#0284C7', // Sky 600
  accentBg:     '#E0F2FE', // Sky 100
  
  // Semantic (Converted to Blue Shades)
  success:      '#0284C7', // Sky 600 - Reliable Blue
  warning:      '#0EA5E9', // Sky 500 - Alert Blue
  error:        '#075985', // Sky 800 - Serious Blue
  
  successBg:    '#F0F9FF', // Sky 50
  warningBg:    '#E0F2FE', // Sky 100
  errorBg:      '#BAE6FD', // Sky 200
  
  border:       '#BAE6FD', // Sky 200
  borderLight:  '#E0F2FE', // Sky 100
  
  shadowColor:  '#075985', 
};

export const shadows = {
  none: {
    shadowOpacity: 0,
    elevation: 0,
    boxShadow: 'none',
  },
  small: {
    shadowColor: palette.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    // @ts-ignore
    boxShadow: `0 4px 10px rgba(7, 89, 133, 0.04)`,
  },
  medium: {
    shadowColor: palette.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 4,
    // @ts-ignore
    boxShadow: `0 8px 20px rgba(7, 89, 133, 0.06)`,
  },
  premium: {
    shadowColor: palette.primary,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.1,
    shadowRadius: 32,
    elevation: 8,
    // @ts-ignore
    boxShadow: `0 16px 32px rgba(7, 89, 133, 0.1)`,
  }
};

const lightTheme = createTheme({
  colors: {
    primary: palette.primary,
    primaryLight: palette.primaryLight,
    primaryBg: palette.primaryBg,
    
    secondary: palette.secondary,
    secondaryBg: palette.secondaryBg,
    
    background: palette.background,
    cardBackground: palette.cardBg,
    
    text: palette.text,
    textSecondary: palette.textSecondary,
    textTertiary: palette.textTertiary,
    textMuted: palette.textMuted,
    textInverse: palette.white,
    
    border: palette.border,
    borderLight: palette.borderLight,
    
    success: palette.success,
    successBg: palette.successBg,
    
    warning: palette.warning,
    warningBg: palette.warningBg,
    
    error: palette.error,
    errorBg: palette.errorBg,
    
    info: palette.accent,
    infoBg: palette.accentBg,
    
    accent: palette.accent,
    white: palette.white,
    transparent: 'transparent',
    transparentBlue: 'rgba(14, 165, 233, 0.15)',
    transparentNavy: 'rgba(7, 89, 133, 0.5)',
    buttonSecondaryBg: palette.secondaryBg,
    backgroundLight: palette.primaryBg,
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
      fontFamily: 'Inter-Regular',
    },
    display: {
      fontSize: rsp.normalize(44),
      fontFamily: 'Inter-ExtraBold',
      color: 'primary',
      letterSpacing: -2,
    },
    header: {
      fontSize: rsp.normalize(32),
      fontFamily: 'Inter-ExtraBold',
      color: 'primary',
      letterSpacing: -1,
    },
    subheader: {
      fontSize: rsp.normalize(22),
      fontFamily: 'Inter-Bold',
      color: 'primary',
      letterSpacing: -0.5,
    },
    title: {
      fontSize: rsp.normalize(18),
      fontFamily: 'Inter-Bold',
      color: 'text',
    },
    premiumLabel: {
      fontSize: rsp.normalize(12),
      fontFamily: 'Inter-ExtraBold',
      textTransform: 'uppercase',
      letterSpacing: 2,
      color: 'textMuted',
    },
    button: {
      fontSize: rsp.normalize(15),
      fontFamily: 'Inter-Bold',
      color: 'white',
    },
    buttonLarge: {
      fontSize: rsp.normalize(16),
      fontFamily: 'Inter-ExtraBold',
      letterSpacing: 0.5,
      color: 'white',
    },
    body: {
      fontSize: rsp.normalize(16),
      lineHeight: 24,
      fontFamily: 'Inter-Regular',
      color: 'textSecondary',
    },
    bodyMedium: {
      fontSize: rsp.normalize(15),
      fontFamily: 'Inter-SemiBold',
      color: 'text',
    },
    bodySmall: {
      fontSize: rsp.normalize(14),
      fontFamily: 'Inter-Medium',
      color: 'textSecondary',
    },
    caption: {
      fontSize: rsp.normalize(12),
      fontFamily: 'Inter-SemiBold',
      color: 'textTertiary',
    },
    labelBold: {
      fontSize: rsp.normalize(12),
      fontFamily: 'Inter-ExtraBold',
      textTransform: 'uppercase',
      letterSpacing: 1,
      color: 'primary',
    },
  },

});

export type Theme = typeof lightTheme;
export type ThemeType = 'light';

export { lightTheme };
