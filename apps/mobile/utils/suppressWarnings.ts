import { Platform } from 'react-native';

// Suppress React Native Web deprecation warnings in development
export const suppressRNWebWarnings = () => {
  if (Platform.OS === 'web' && __DEV__) {
    const originalWarn = console.warn;
    const originalError = console.error;

    const warningsToSuppress = [
      '"shadow*" style props are deprecated. Use "boxShadow"',
      'props.pointerEvents is deprecated. Use style.pointerEvents',
      '"falcon" is not a valid icon name',
    ];

    console.warn = (...args) => {
      const message = args[0];
      if (typeof message === 'string' && warningsToSuppress.some(warning => message.includes(warning))) {
        return;
      }
      originalWarn.apply(console, args);
    };

    console.error = (...args) => {
      const message = args[0];
      if (typeof message === 'string' && warningsToSuppress.some(warning => message.includes(warning))) {
        return;
      }
      originalError.apply(console, args);
    };
  }
};

// Web-compatible shadow styles helper
export const createWebShadow = (
  color: string = '#000000',
  offsetX: number = 0,
  offsetY: number = 4,
  blurRadius: number = 8,
  opacity: number = 0.3
) => {
  if (Platform.OS === 'web') {
    return {
      boxShadow: `${offsetX}px ${offsetY}px ${blurRadius}px rgba(${hexToRgb(color)}, ${opacity})`,
    };
  }
  
  return {
    shadowColor: color,
    shadowOffset: { width: offsetX, height: offsetY },
    shadowOpacity: opacity,
    shadowRadius: blurRadius,
    elevation: Math.max(offsetY, blurRadius / 2),
  };
};

// Helper function to convert hex color to RGB
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 0, 0';
};
