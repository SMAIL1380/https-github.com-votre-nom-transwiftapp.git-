import React, { useState } from 'react';
import { Alert } from 'react-native';
import styled from 'styled-components/native';
import { PhotoCapture } from './PhotoCapture';
import { photoService } from '../services/PhotoService';
import { useTranslation } from '../../../i18n/hooks/useTranslation';
import { AccessibleText } from '../../../components/accessible/AccessibleText';
import { LoadingAnimation } from '../../../components/animations/LoadingAnimation';

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Instructions = styled(AccessibleText)`
  padding: ${({ theme }) => theme.spacing.md}px;
  font-size: ${({ theme }) => theme.typography.body.fontSize}px;
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
`;

interface RequiredPhotoCaptureProps {
  deliveryId: string;
  type: 'pickup_ground' | 'delivery_ground';
  onPhotoTaken: () => void;
}

export const RequiredPhotoCapture: React.FC<RequiredPhotoCaptureProps> = ({
  deliveryId,
  type,
  onPhotoTaken,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const handlePhotoTaken = async (uri: string) => {
    try {
      setLoading(true);
      await photoService.savePhoto(
        uri,
        type,
        deliveryId,
        t(type === 'pickup_ground' 
          ? 'photo.description.pickup_ground' 
          : 'photo.description.delivery_ground')
      );
      onPhotoTaken();
    } catch (error) {
      Alert.alert(
        t('photo.error.title'),
        t('photo.error.save')
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingAnimation />;
  }

  return (
    <Container>
      <Instructions>
        {type === 'pickup_ground'
          ? t('photo.instructions.pickup_ground')
          : t('photo.instructions.delivery_ground')}
      </Instructions>
      <PhotoCapture
        onPhotoTaken={handlePhotoTaken}
        maxWidth={2048}
        maxHeight={2048}
        quality={90}
      />
    </Container>
  );
};
