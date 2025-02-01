import { Theme, ThemeType } from '../types/theme';

const baseTheme = {
  fonts: {
    regular: 'Roboto-Regular',
    medium: 'Roboto-Medium',
    bold: 'Roboto-Bold',
  },
  sizes: {
    tiny: 8,
    small: 12,
    medium: 16,
    large: 24,
    xlarge: 32,
    xxlarge: 48,
  },
  spacing: {
    tiny: 4,
    small: 8,
    medium: 16,
    large: 24,
    xlarge: 32,
  },
  roundness: 8,
};

export const theme: ThemeType = {
  light: {
    ...baseTheme,
    dark: false,
    mode: 'exact',
    colors: {
      primary: '#1976D2',
      secondary: '#43A047',
      accent: '#FF5722',
      background: '#FFFFFF',
      surface: '#FFFFFF',
      error: '#B00020',
      text: '#212121',
      textSecondary: '#757575',
      disabled: '#9E9E9E',
      placeholder: '#BDBDBD',
      backdrop: 'rgba(0, 0, 0, 0.5)',
      onSurface: '#000000',
      notification: '#FF4081',
    },
  },
  dark: {
    ...baseTheme,
    dark: true,
    mode: 'exact',
    colors: {
      primary: '#90CAF9',
      secondary: '#81C784',
      accent: '#FF8A65',
      background: '#121212',
      surface: '#121212',
      error: '#CF6679',
      text: '#FFFFFF',
      textSecondary: '#B0BEC5',
      disabled: '#757575',
      placeholder: '#6D6D6D',
      backdrop: 'rgba(0, 0, 0, 0.5)',
      onSurface: '#FFFFFF',
      notification: '#FF80AB',
    },
  },
};
