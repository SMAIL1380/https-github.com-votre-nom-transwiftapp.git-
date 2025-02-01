import React, { useState } from 'react';
import { Alert } from 'react-native';
import styled from 'styled-components/native';
import { SignaturePad } from '../components/SignaturePad';
import { SignaturePreview } from '../components/SignaturePreview';
import { signatureService } from '../services/SignatureService';
import { useTranslation } from '../../../i18n/hooks/useTranslation';
import { AccessibleText } from '../../../components/accessible/AccessibleText';
import { LoadingAnimation } from '../../../components/animations/LoadingAnimation';

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.md}px;
`;

const Title = styled(AccessibleText)`
  font-size: ${({ theme }) => theme.typography.h2.fontSize}px;
  font-weight: bold;
  margin-bottom: ${({ theme }) => theme.spacing.lg}px;
  color: ${({ theme }) => theme.colors.text};
`;

interface SignatureScreenProps {
  route: {
    params?: {
      deliveryId?: string;
    };
  };
  navigation: any;
}

export const SignatureScreen: React.FC<SignatureScreenProps> = ({
  route,
  navigation,
}) => {
  const { t } = useTranslation();
  const [signature, setSignature] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const deliveryId = route.params?.deliveryId;

  const handleSave = async (signatureData: string) => {
    try {
      setLoading(true);
      const savedSignature = await signatureService.saveSignature(
        signatureData,
        deliveryId
      );
      setSignature(savedSignature.imageUri);
      Alert.alert(
        t('signature.success.title'),
        t('signature.success.message'),
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        t('signature.error.title'),
        t('signature.error.message')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSignature(null);
  };

  if (loading) {
    return <LoadingAnimation />;
  }

  return (
    <Container>
      <Title>{t('signature.title')}</Title>
      {signature ? (
        <SignaturePreview
          signature={signature}
          date={new Date()}
        />
      ) : (
        <SignaturePad
          onSave={handleSave}
          onClear={handleClear}
        />
      )}
    </Container>
  );
};
