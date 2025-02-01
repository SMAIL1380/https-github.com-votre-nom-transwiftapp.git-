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

const InfoText = styled(AccessibleText)`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  text-align: center;
`;

interface DeliveryCompleteScreenProps {
  route: {
    params: {
      deliveryId: string;
    };
  };
  navigation: any;
}

export const DeliveryCompleteScreen: React.FC<DeliveryCompleteScreenProps> = ({
  route,
  navigation,
}) => {
  const { t } = useTranslation();
  const { deliveryId } = route.params;
  const { canComplete, missingDeliveryPhoto, refreshStatus } = useDeliveryStatus(deliveryId);

  const handlePhotoTaken = () => {
    refreshStatus();
  };

  const handleCompleteDelivery = () => {
    if (!canComplete) {
      Alert.alert(
        t('delivery.error.title'),
        t('delivery.error.missing_delivery_photo')
      );
      return;
    }

    // Ici, ajoutez votre logique pour finaliser la livraison
    navigation.navigate('DeliverySummary', { deliveryId });
  };

  return (
    <Container>
      {missingDeliveryPhoto ? (
        <>
          <WarningText>
            {t('delivery.warning.required_delivery_photo')}
          </WarningText>
          <RequiredPhotoCapture
            deliveryId={deliveryId}
            type="delivery_ground"
            onPhotoTaken={handlePhotoTaken}
          />
        </>
      ) : (
        <Content>
          <InfoText>
            {t('delivery.info.photos_complete')}
          </InfoText>
          <AccessibleButton
            onPress={handleCompleteDelivery}
            variant="primary"
            accessibilityLabel={t('delivery.complete')}
          >
            {t('delivery.complete')}
          </AccessibleButton>
        </Content>
      )}
    </Container>
  );
};
