import { ImageStyle, ViewStyle, TextStyle } from 'react-native';
import { AccessibilityRole } from 'react-native';
import { CustomTheme } from '../../theme/types';

export interface AccessibleFormProps {
  style?: ViewStyle;
  children: React.ReactNode;
  onSubmit?: () => void;
  loading?: boolean;
  error?: string;
  testID?: string;
}

export interface AccessibleImageProps {
  source: number | { uri: string };
  style?: ImageStyle | ImageStyle[];
  accessibilityLabel?: string;
  accessibilityRole?: AccessibilityRole;
  id?: string;
  testID?: string;
}

export interface StyleProps {
  theme: CustomTheme;
}

export interface LoadingAnimationProps {
  color?: string;
  size?: number;
}

export interface ListItemTransitionProps {
  children: React.ReactElement;
}
