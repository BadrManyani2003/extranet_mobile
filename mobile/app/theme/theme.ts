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
  borderLight:  '#F1F5F9',
  
  success:      '#10B981',
  warning:      '#F59E0B',
  error:        '#EF4444',
  
  successBg:    '#ECFDF5',
  warningBg:    '#FFFBEB',
  errorBg:      '#FEF2F2',
  
  info:         '#3B82F6',
  infoBg:       '#EFF6FF',
  
  purple:       '#8B5CF6',
  purpleBg:     '#F5F3FF',
  
  backgroundGray:'#F1F5F9',
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
    
    info: palette.info,
    infoBg: palette.infoBg,
    infoLight: palette.infoBg,
    
    purple: palette.purple,
    purpleBg: palette.purpleBg,
    
    backgroundGray: palette.backgroundGray,
    backgroundLight: palette.backgroundGray,
    
    transparent: 'transparent',
    white: palette.white,
    buttonSecondaryBg: palette.backgroundGray,
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
    cardTitle: {
      fontSize: rsp.normalize(16),
      fontWeight: '700',
    },
    button: {
      fontSize: rsp.normalize(15),
      fontWeight: '600',
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
    label: {
      fontSize: rsp.normalize(12),
      fontWeight: '500',
    },
    labelBold: {
      fontSize: rsp.normalize(12),
      fontWeight: '700',
    },
  },
});

export type Theme = typeof lightTheme;
export type ThemeType = 'light';

export { lightTheme };
