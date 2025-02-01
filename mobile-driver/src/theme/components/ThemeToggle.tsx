import React, { useContext } from 'react';
import { View } from 'react-native';
import styled from 'styled-components/native';
import { ThemePreferenceContext } from '../ThemeProvider';
import { useTheme } from '../hooks/useTheme';

const Container = styled.View`
  padding: ${({ theme }) => theme.spacing.md}px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
`;

const OptionButton = styled.TouchableOpacity<{ isSelected: boolean }>`
  flex-direction: row;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm}px;
  background-color: ${({ theme, isSelected }) =>
    isSelected ? theme.colors.primary + '20' : 'transparent'};
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  margin-bottom: ${({ theme }) => theme.spacing.xs}px;
`;

const Label = styled.Text`
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  margin-left: ${({ theme }) => theme.spacing.sm}px;
`;

const Icon = styled.Text`
  font-size: 20px;
`;

const themeOptions = [
  { value: 'light', label: 'Mode Clair', icon: '☀️' },
  { value: 'dark', label: 'Mode Sombre', icon: '🌙' },
  { value: 'auto', label: 'Mode Automatique', icon: '⏱' },
  { value: 'system', label: 'Système', icon: '⚙️' },
] as const;

export const ThemeToggle: React.FC = () => {
  const { themePreference, setThemePreference } = useContext(ThemePreferenceContext);
  const { isDarkMode } = useTheme();

  return (
    <Container>
      {themeOptions.map((option) => (
        <OptionButton
          key={option.value}
          isSelected={themePreference === option.value}
          onPress={() => setThemePreference(option.value)}
        >
          <Icon>{option.icon}</Icon>
          <Label>{option.label}</Label>
        </OptionButton>
      ))}
    </Container>
  );
};
