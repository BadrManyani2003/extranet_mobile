import { createTheme } from '@shopify/restyle';
import { rsp } from '../utils/responsive';

/**
 * Palette de Couleurs (Custom Deep Blue / Ocean)
 * Fournie par l'utilisateur pour une identité visuelle premium
 */
const palette = {
  // Echelle de bleus demandée
  deepBlue:     '#03045E', // Titres / Dark Background
  mediumBlue:   '#0077B6', // Actions Primaires
  brightBlue:   '#00B4D8', // Accents / Highlights
  lightBlue:    '#90E0EF', // Soft surfaces
  veryLightBlue:'#CAF0F8', // Backgrounds / Secondary actions

  // Neutres complémentaires
  white:        '#FFFFFF',
  black:        '#02031A', // Un noir bleuté pour le texte
  gray50:       '#F8FAFC',
  gray100:      '#E2E8F0',
  gray500:      '#64748B',
  gray800:      '#1E293B',
  gray900:      '#0F172A',
  
  // Fonctionnelles (harmonisées avec le bleu)
  success:      '#059669',
  successSoft:  '#ECFDF5',
  warning:      '#D97706',
  warningSoft:  '#FFFBEB',
  error:        '#DC2626',
  errorSoft:    '#FEF2F2',
  purple:       '#7C3AED',
  purpleSoft:   '#F5F3FF',

  // Transparents
  transparentPrimary: 'rgba(0, 119, 182, 0.1)',
  transparentWhite:   'rgba(255, 255, 255, 0.15)',
};

/**
 * Thème Light - Refonte Oceanique Premium
 */
const lightTheme = createTheme({
  colors: {
    // Principales
    primary: palette.mediumBlue,
    primaryLight: palette.brightBlue,
    primaryDark: palette.deepBlue,
    primaryBg: palette.veryLightBlue,
    
    // Arrière-plans
    background: palette.gray50,
    backgroundLight: palette.white,
    backgroundGray: palette.veryLightBlue,
    cardBackground: palette.white,
    neutralBg: palette.gray50,
    inputBackground: palette.white,
    buttonSecondaryBg: palette.veryLightBlue,
    white: palette.white,
    
    // Textes
    text: palette.deepBlue,
    textSecondary: '#475569',
    textTertiary: '#94A3B8',
    textInverse: palette.white,
    textOnPrimary: palette.white,
    inputText: palette.deepBlue,
    placeholderText: palette.gray500,
    neutral: palette.gray500,
    
    // Bordures
    border: palette.lightBlue,
    borderLight: palette.veryLightBlue,
    borderDark: palette.mediumBlue,
    inputBorder: palette.lightBlue,
    
    // Fonctionnelles
    success: palette.success,
    successLight: palette.successSoft,
    successDark: '#065F46',
    successBg: palette.successSoft,
    warning: palette.warning,
    warningLight: palette.warningSoft,
    warningDark: '#92400E',
    warningBg: palette.warningSoft,
    error: palette.error,
    errorLight: palette.errorSoft,
    errorDark: '#991B1B',
    errorBg: palette.errorSoft,
    info: palette.brightBlue,
    infoLight: palette.veryLightBlue,
    infoDark: palette.deepBlue,
    infoBg: palette.veryLightBlue,
    purple: palette.purple,
    purpleLight: palette.purpleSoft,
    purpleDark: '#5B21B6',
    purpleBg: palette.purpleSoft,
    
    // Transparents
    transparent: 'transparent',
    transparentPrimary: palette.transparentPrimary,
    transparentSuccess: 'rgba(5, 150, 105, 0.1)',
    transparentWarning: 'rgba(217, 119, 6, 0.1)',
    transparentError:   'rgba(220, 38, 38, 0.1)',
    transparentInfo:    'rgba(0, 180, 216, 0.1)',
    transparentPurple:  'rgba(124, 58, 237, 0.1)',
    transparentGray:    'rgba(0, 0, 0, 0.05)',
    transparentWhite:   palette.transparentWhite,
    
    disabled: palette.gray100,
    disabledBg: palette.gray50,
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
    m: 14,
    l: 18,
    xl: 24,
    xxl: 36,
    round: 999,
  },
  textVariants: {
    defaults: {
      fontSize: rsp.normalize(15),
      lineHeight: rsp.normalize(22),
      color: 'text',
      fontWeight: '400',
    },
    largeTitle: {
      fontSize: rsp.normalize(30),
      lineHeight: rsp.normalize(38),
      fontWeight: '800',
      color: 'text',
      letterSpacing: -1,
    },
    header: {
      fontSize: rsp.normalize(24),
      lineHeight: rsp.normalize(32),
      fontWeight: '700',
      color: 'text',
      letterSpacing: -0.5,
    },
    subheader: {
      fontSize: rsp.normalize(20),
      lineHeight: rsp.normalize(28),
      fontWeight: '700',
      color: 'text',
    },
    title: {
      fontSize: rsp.normalize(18),
      lineHeight: rsp.normalize(24),
      fontWeight: '700',
      color: 'text',
    },
    bodyLarge: {
      fontSize: rsp.normalize(17),
      lineHeight: rsp.normalize(24),
      color: 'text',
    },
    body: {
      fontSize: rsp.normalize(15),
      lineHeight: rsp.normalize(22),
      color: 'text',
    },
    bodyMedium: {
      fontSize: rsp.normalize(14),
      lineHeight: rsp.normalize(20),
      color: 'textSecondary',
    },
    bodySmall: {
      fontSize: rsp.normalize(13),
      lineHeight: rsp.normalize(18),
      color: 'textSecondary',
    },
    caption: {
      fontSize: rsp.normalize(12),
      lineHeight: rsp.normalize(16),
      color: 'textTertiary',
    },
    labelBold: {
      fontSize: rsp.normalize(12),
      lineHeight: rsp.normalize(16),
      fontWeight: '700',
      color: 'textSecondary',
    },
    button: {
      fontSize: rsp.normalize(16),
      lineHeight: rsp.normalize(24),
      fontWeight: '700',
      color: 'textInverse',
    },
    cardTitle: {
      fontSize: rsp.normalize(16),
      lineHeight: rsp.normalize(22),
      fontWeight: '700',
      color: 'text',
    },
    input: {
      fontSize: rsp.normalize(15),
      lineHeight: rsp.normalize(22),
      color: 'inputText',
    },
  },
});

/**
 * Thème Dark - Profondeurs Marines Premium
 */
const darkTheme = createTheme({
  colors: {
    ...lightTheme.colors,
    // Principales (Nuit Profonde)
    primary: palette.brightBlue,
    primaryBg: 'rgba(0, 180, 216, 0.15)',
    
    // Arrière-plans (Utilisation du Deep Blue fourni)
    background: '#02031A', // Un dérivé encore plus sombre du #03045E
    backgroundLight: palette.deepBlue,
    backgroundGray: '#050730',
    cardBackground: palette.deepBlue,
    neutralBg: '#02031A',
    inputBackground: palette.deepBlue,
    buttonSecondaryBg: 'rgba(144, 224, 239, 0.1)',
    
    // Textes
    text: palette.veryLightBlue,
    textSecondary: palette.lightBlue,
    textTertiary: palette.brightBlue,
    textInverse: palette.deepBlue,
    inputText: palette.white,
    placeholderText: 'rgba(144, 224, 239, 0.5)',
    
    // Bordures
    border: '#05074D',
    borderLight: 'rgba(144, 224, 239, 0.1)',
    borderDark: palette.mediumBlue,
    inputBorder: 'rgba(144, 224, 239, 0.2)',

    transparentGray: 'rgba(255, 255, 255, 0.05)',
  },
  spacing: lightTheme.spacing,
  borderRadii: lightTheme.borderRadii,
  textVariants: {
    ...lightTheme.textVariants,
    defaults: {
      ...lightTheme.textVariants.defaults,
      color: 'text',
    },
  },
});

export type Theme = typeof lightTheme;
export type ThemeType = 'light' | 'dark';

export { lightTheme, darkTheme };
