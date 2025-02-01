import { Theme } from '@react-navigation/native';

export interface CustomTheme extends Theme {
  colors: {
    primary: string;
    background: string;
    card: string;
    text: string;
    border: string;
    notification: string;
    success: string;
    error: string;
    warning: string;
  };
}

export type ThemeColors = CustomTheme['colors'];
