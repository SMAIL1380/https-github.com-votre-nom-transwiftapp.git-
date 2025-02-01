import React from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  ViewProps,
  AccessibilityProps,
} from 'react-native';
import styled from 'styled-components/native';
import { AccessibleText } from './AccessibleText';

// Composants de formulaire accessibles
const FormContainer = styled.View`
  width: 100%;
`;

const InputContainer = styled.View`
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

const StyledInput = styled.TextInput`
  padding: ${({ theme }) => theme.spacing.sm}px;
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text};
  background-color: ${({ theme }) => theme.colors.surface};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
`;

const ErrorText = styled(AccessibleText)`
  color: ${({ theme }) => theme.colors.error};
  margin-top: ${({ theme }) => theme.spacing.xs}px;
`;

interface AccessibleInputProps extends TextInputProps, AccessibilityProps {
  label: string;
  error?: string;
  touched?: boolean;
}

export const AccessibleInput: React.FC<AccessibleInputProps> = ({
  label,
  error,
  touched,
  accessible = true,
  accessibilityLabel,
  accessibilityHint,
  ...props
}) => {
  const hasError = touched && error;

  return (
    <InputContainer>
      <AccessibleText
        variant="body"
        accessible={accessible}
        accessibilityRole="text"
        style={{ marginBottom: 4 }}
      >
        {label}
      </AccessibleText>
      <StyledInput
        accessible={accessible}
        accessibilityLabel={accessibilityLabel || label}
        accessibilityHint={accessibilityHint}
        accessibilityRole="adjustable"
        accessibilityState={{
          error: !!hasError,
        }}
        {...props}
      />
      {hasError && (
        <ErrorText
          variant="caption"
          accessible={accessible}
          accessibilityRole="alert"
        >
          {error}
        </ErrorText>
      )}
    </InputContainer>
  );
};

interface AccessibleFormProps extends ViewProps {
  onSubmit?: () => void;
}

export const AccessibleForm: React.FC<AccessibleFormProps & { children: React.ReactNode }> = ({
  children,
  onSubmit,
  ...props
}) => {
  return (
    <FormContainer
      accessible={true}
      accessibilityRole="form"
      {...props}
    >
      {children}
    </FormContainer>
  );
};
