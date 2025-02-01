import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  ActivityIndicator,
  AccessibilityProps,
} from 'react-native';
import styled from 'styled-components/native';
import { AccessibleText } from './AccessibleText';

interface AccessibleButtonProps extends TouchableOpacityProps, AccessibilityProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const ButtonContainer = styled.TouchableOpacity<AccessibleButtonProps>`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: ${({ theme, size = 'medium' }) => {
    switch (size) {
      case 'small':
        return theme.spacing.sm;
      case 'large':
        return theme.spacing.lg;
      default:
        return theme.spacing.md;
    }
  }}px;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  background-color: ${({ theme, variant = 'primary', disabled }) => {
    if (disabled) return theme.colors.border;
    switch (variant) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.secondary;
      case 'outline':
      case 'text':
        return 'transparent';
      default:
        return theme.colors.primary;
    }
  }};
  border-width: ${({ variant }) => (variant === 'outline' ? 1 : 0)}px;
  border-color: ${({ theme }) => theme.colors.primary};
`;

const ButtonContent = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const IconContainer = styled.View`
  margin-right: ${({ theme }) => theme.spacing.xs}px;
`;

export const AccessibleButton: React.FC<AccessibleButtonProps & { children: React.ReactNode }> = ({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
  accessible = true,
  accessibilityRole = 'button',
  accessibilityLabel,
  accessibilityHint,
  ...props
}) => {
  const getTextColor = () => {
    switch (variant) {
      case 'primary':
      case 'secondary':
        return '#FFFFFF';
      case 'outline':
      case 'text':
        return theme.colors.primary;
      default:
        return '#FFFFFF';
    }
  };

  return (
    <ButtonContainer
      variant={variant}
      size={size}
      disabled={disabled || loading}
      fullWidth={fullWidth}
      accessible={accessible}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel || (typeof children === 'string' ? children : undefined)}
      accessibilityHint={accessibilityHint}
      accessibilityState={{
        disabled: disabled || loading,
        busy: loading,
      }}
      {...props}
    >
      <ButtonContent>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'primary' ? '#FFFFFF' : theme.colors.primary}
          />
        ) : (
          <>
            {icon && <IconContainer>{icon}</IconContainer>}
            <AccessibleText
              variant="body"
              color={getTextColor()}
              accessible={false}
            >
              {children}
            </AccessibleText>
          </>
        )}
      </ButtonContent>
    </ButtonContainer>
  );
};
