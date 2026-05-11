import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: W, height: H } = Dimensions.get('window');

// iPhone 14 Pro reference sizes
const guidelineBaseWidth = 390;
const guidelineBaseHeight = 844;

/**
 * Expert Responsive Scaling (Horizontal)
 * Scale with optional clamp to avoid excessively large/small sizes.
 */
const scale = (size: number, min?: number, max?: number) => {
  const scaled = (W / guidelineBaseWidth) * size;
  const result = Math.round(scaled);
  if (min !== undefined && result < min) return min;
  if (max !== undefined && result > max) return max;
  return result;
};

/**
 * Vertical Scaling
 */
const verticalScale = (size: number) => Math.round((H / guidelineBaseHeight) * size);

/**
 * Moderate Scaling
 */
const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

/**
 * Expert Font Normalization
 */
const normalize = (size: number) => {
  const newSize = (W / guidelineBaseWidth) * size;
  return Math.round(PixelRatio.getFontScale() * newSize);
};

// Device Categories
const isSmallDevice = W < 360;                     // iPhone SE, small Androids
const isMediumDevice = W >= 360 && W < 414;         // iPhone 14, Pixel 6
const isLargeDevice = W >= 414 && W < 768;         // iPhone Plus/Max, large Androids
const isTablet = W >= 768;                         // Tablets

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
  // Helper for grid layouts
  grid: (columns: number, margin = 16) => {
    const totalMargin = margin * 2 + (columns - 1) * 12;
    return (W - totalMargin) / columns;
  }
};
