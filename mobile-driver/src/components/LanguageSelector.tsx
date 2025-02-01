import React from 'react';
import styled from 'styled-components/native';
import { useTranslation } from '../i18n/hooks/useTranslation';
import { AccessibleButton } from './accessible/AccessibleButton';
import { AccessibleText } from './accessible/AccessibleText';

const Container = styled.View`
  padding: ${({ theme }) => theme.spacing.md}px;
`;

const LanguageButton = styled(AccessibleButton)<{ isSelected: boolean }>`
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
  background-color: ${({ theme, isSelected }) =>
    isSelected ? theme.colors.primary : theme.colors.surface};
`;

const ButtonText = styled(AccessibleText)<{ isSelected: boolean }>`
  color: ${({ theme, isSelected }) =>
    isSelected ? '#FFFFFF' : theme.colors.text};
`;

const LanguageCode = styled(AccessibleText)`
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-left: ${({ theme }) => theme.spacing.sm}px;
`;

export const LanguageSelector: React.FC = () => {
  const { getCurrentLanguage, changeLanguage, getAvailableLanguages } = useTranslation();
  const currentLanguage = getCurrentLanguage();
  const languages = getAvailableLanguages();

  const handleLanguageChange = async (languageCode: string) => {
    await changeLanguage(languageCode);
  };

  return (
    <Container>
      {languages.map((language) => (
        <LanguageButton
          key={language.code}
          isSelected={currentLanguage === language.code}
          onPress={() => handleLanguageChange(language.code)}
          variant={currentLanguage === language.code ? 'primary' : 'outline'}
          accessibilityLabel={`Changer la langue en ${language.name}`}
          accessibilityState={{ selected: currentLanguage === language.code }}
        >
          <ButtonText isSelected={currentLanguage === language.code}>
            {language.name}
            <LanguageCode>({language.code})</LanguageCode>
          </ButtonText>
        </LanguageButton>
      ))}
    </Container>
  );
};
