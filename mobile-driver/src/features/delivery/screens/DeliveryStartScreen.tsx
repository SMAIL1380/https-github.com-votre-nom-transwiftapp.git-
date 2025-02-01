import React from 'react';
import { Alert } from 'react-native';
import styled from 'styled-components/native';
import { RequiredPhotoCapture } from '../../delivery-photos/components/RequiredPhotoCapture';
import { useDeliveryStatus } from '../hooks/useDeliveryStatus';
import { useTranslation } from '../../../i18n/hooks/useTranslation';
import { AccessibleText } from '../../../components/accessible/AccessibleText';
import { AccessibleButton } from '../../../components/accessible/AccessibleButton';

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Content = styled.View`
  padding: ${({ theme }) => theme.spacing.md}px;
`;

const WarningText = styled(AccessibleText)`
  color: ${({ theme }) => theme.colors.error};
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  text-align: center;
`;

interface DeliveryStartScreenProps {
  route: {
    params: {
      deliveryId: string;
    };
  };
  navigation: any;
}

export const DeliveryStartScreen: React.FC<DeliveryStartScreenProps> = ({
  route,
  navigation,
}) => {
  const { t } = useTranslation();
  const { deliveryId } = route.params;
  const { canStart, missingPickupPhoto, refreshStatus } = useDeliveryStatus(deliveryId);

  const handlePhotoTaken = () => {
    refreshStatus();
  };

  const handleStartDelivery = () => {
    if (!canStart) {
      Alert.alert(
        t('delivery.error.title'),
        t('delivery.error.missing_pickup_photo')
      );
      return;
    }

    // Ici, ajoutez votre logique pour démarrer la livraison
    navigation.navigate('DeliveryInProgress', { deliveryId });
  };

  return (
    <Container>
      {missingPickupPhoto ? (
        <>
          <WarningText>
            {t('delivery.warning.required_pickup_photo')}
          </WarningText>
          <RequiredPhotoCapture
            deliveryId={deliveryId}
            type="pickup_ground"
            onPhotoTaken={handlePhotoTaken}
          />
        </>
      ) : (
        <Content>
          <AccessibleButton
            onPress={handleStartDelivery}
            variant="primary"
            accessibilityLabel={t('delivery.start')}
          >
            {t('delivery.start')}
          </AccessibleButton>
        </Content>
      )}
    </Container>
  );
};
