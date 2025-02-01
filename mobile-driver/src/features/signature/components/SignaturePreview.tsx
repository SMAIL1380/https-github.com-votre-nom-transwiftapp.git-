import React from 'react';
import { Image, StyleSheet } from 'react-native';
import styled from 'styled-components/native';
import { AccessibleImage } from '../../../components/accessible/AccessibleImage';
import { AccessibleText } from '../../../components/accessible/AccessibleText';
import { useTranslation } from '../../../i18n/hooks/useTranslation';

const Container = styled.View`
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
`;

const DateText = styled(AccessibleText)`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: ${({ theme }) => theme.spacing.sm}px;
`;

interface SignaturePreviewProps {
  signature: string;
  date: Date;
}

export const SignaturePreview: React.FC<SignaturePreviewProps> = ({
  signature,
  date,
}) => {
  const { t } = useTranslation();

  return (
    <Container>
      <AccessibleImage
        source={{ uri: signature }}
        style={styles.signature}
        description={t('signature.preview.description')}
      />
      <DateText>
        {t('signature.preview.date', {
          date: date.toLocaleDateString(),
          time: date.toLocaleTimeString(),
        })}
      </DateText>
    </Container>
  );
};

const styles = StyleSheet.create({
  signature: {
    width: '100%',
    height: 150,
    resizeMode: 'contain',
  },
});
