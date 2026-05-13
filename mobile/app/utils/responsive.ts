import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: W, height: H } = Dimensions.get('window');

// Tailles de référence iPhone 14 Pro
const guidelineBaseWidth = 390;
const guidelineBaseHeight = 844;

/**
 * Mise à l'échelle responsive experte (Horizontale)
 * Échelle avec clamp optionnel pour éviter des tailles excessivement grandes/petites.
 */
const scale = (size: number, min?: number, max?: number) => {
  const scaled = (W / guidelineBaseWidth) * size;
  const result = Math.round(scaled);
  if (min !== undefined && result < min) return min;
  if (max !== undefined && result > max) return max;
  return result;
};

/**
 * Mise à l'échelle verticale
 */
const verticalScale = (size: number) => Math.round((H / guidelineBaseHeight) * size);

/**
 * Mise à l'échelle modérée
 */
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

/**
 * Normalisation experte des polices
 */
const normalize = (size: number) => {
  const newSize = (W / guidelineBaseWidth) * size;
  return Math.round(PixelRatio.getFontScale() * newSize);
};

// Catégories d'appareils
const isSmallDevice = W < 360;                     // iPhone SE, petits Androids
const isMediumDevice = W >= 360 && W < 414;         // iPhone 14, Pixel 6
const isLargeDevice = W >= 414 && W < 768;         // iPhone Plus/Max, grands Androids
const isTablet = W >= 768;                         // Tablettes

export const rsp = {
  width: W,
  height: H,
  scale,
  verticalScale,
  moderateScale,
  normalize,
  isSmallDevice,
  isMediumDevice,
  isLargeDevice,
  isTablet,
  // Utilitaire pour les mises en page en grille
  grid: (columns: number, margin = 16) => {
    const totalMargin = margin * 2 + (columns - 1) * 12;
    return (W - totalMargin) / columns;
  }
};
