export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  error: string;
  text: string;
  textSecondary: string;
  disabled: string;
  placeholder: string;
  backdrop: string;
  onSurface: string;
  notification: string;
}

export interface ThemeFonts {
  regular: string;
  medium: string;
  bold: string;
}

export interface ThemeSizes {
  tiny: number;
  small: number;
  medium: number;
  large: number;
  xlarge: number;
  xxlarge: number;
}

export interface ThemeSpacing {
  tiny: number;
  small: number;
  medium: number;
  large: number;
  xlarge: number;
}

export interface Theme {
  dark: boolean;
  mode?: 'exact' | 'adaptive';
  colors: ThemeColors;
  fonts: ThemeFonts;
  sizes: ThemeSizes;
  spacing: ThemeSpacing;
  roundness: number;
}

export interface ThemeType {
  light: Theme;
  dark: Theme;
}
