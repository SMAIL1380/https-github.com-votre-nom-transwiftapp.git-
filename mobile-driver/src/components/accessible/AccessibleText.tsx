import React from 'react';
import { Text, TextProps, AccessibilityProps } from 'react-native';
import styled from 'styled-components/native';

interface AccessibleTextProps extends TextProps, AccessibilityProps {
  variant?: 'h1' | 'h2' | 'body' | 'caption';
  color?: string;
}

const StyledText = styled.Text<AccessibleTextProps>`
  color: ${({ theme, color }) => color || theme.colors.text};
  font-size: ${({ theme, variant = 'body' }) =>
    theme.typography[variant].fontSize}px;
  font-weight: ${({ theme, variant = 'body' }) =>
    theme.typography[variant].fontWeight};
`;

export const AccessibleText: React.FC<AccessibleTextProps> = ({
  children,
  variant = 'body',
  color,
  accessible = true,
  accessibilityRole = 'text',
  accessibilityLabel,
  ...props
}) => {
  // Si aucun accessibilityLabel n'est fourni, utiliser le texte comme label
  const finalAccessibilityLabel = accessibilityLabel || (
    typeof children === 'string' ? children : undefined
  );

  // Définir le rôle d'accessibilité en fonction de la variante
  const finalAccessibilityRole = variant.startsWith('h')
    ? 'header'
    : accessibilityRole;

  return (
    <StyledText
      variant={variant}
      color={color}
      accessible={accessible}
      accessibilityRole={finalAccessibilityRole}
      accessibilityLabel={finalAccessibilityLabel}
      {...props}
    >
      {children}
    </StyledText>
  );
};
