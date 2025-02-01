import React, { useState } from 'react';
import { Alert } from 'react-native';
import styled from 'styled-components/native';
import { PhotoCapture } from '../../delivery-photos/components/PhotoCapture';
import { incidentService, IncidentType, IncidentSeverity } from '../services/IncidentService';
import { useTranslation } from '../../../i18n/hooks/useTranslation';
import { AccessibleText } from '../../../components/accessible/AccessibleText';
import { AccessibleButton } from '../../../components/accessible/AccessibleButton';
import * as Location from 'expo-location';

const Container = styled.ScrollView`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const FormSection = styled.View`
  padding: ${({ theme }) => theme.spacing.md}px;
`;

const Label = styled(AccessibleText)`
  font-size: ${({ theme }) => theme.typography.label.fontSize}px;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

const Input = styled.TextInput`
  background-color: ${({ theme }) => theme.colors.surface};
  padding: ${({ theme }) => theme.spacing.sm}px;
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
  color: ${({ theme }) => theme.colors.text};
`;

const Select = styled.Picker`
  background-color: ${({ theme }) => theme.colors.surface};
  margin-bottom: ${({ theme }) => theme.spacing.md}px;
`;

interface IncidentFormProps {
  deliveryId?: string;
  onIncidentCreated: () => void;
}

export const IncidentForm: React.FC<IncidentFormProps> = ({
  deliveryId,
  onIncidentCreated,
}) => {
  const { t } = useTranslation();
  const [type, setType] = useState<IncidentType>('other');
  const [severity, setSeverity] = useState<IncidentSeverity>('medium');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  const handlePhotoTaken = (uri: string) => {
    setPhotos(prev => [...prev, uri]);
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return null;
      }

      const location = await Location.getCurrentPositionAsync({});
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert(
        t('incident.error.title'),
        t('incident.error.description_required')
      );
      return;
    }

    try {
      const location = await getCurrentLocation();
      await incidentService.createIncident({
        deliveryId,
        type,
        severity,
        description: description.trim(),
        location,
        photos,
      });

      Alert.alert(
        t('incident.success.title'),
        t('incident.success.message'),
        [
          {
            text: 'OK',
            onPress: () => {
              setType('other');
              setSeverity('medium');
              setDescription('');
              setPhotos([]);
              onIncidentCreated();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        t('incident.error.title'),
        t('incident.error.creation_failed')
      );
    }
  };

  return (
    <Container>
      <FormSection>
        <Label>{t('incident.type.label')}</Label>
        <Select
          selectedValue={type}
          onValueChange={(value) => setType(value as IncidentType)}
        >
          <Select.Item label={t('incident.type.damage')} value="damage" />
          <Select.Item label={t('incident.type.delay')} value="delay" />
          <Select.Item label={t('incident.type.access_problem')} value="access_problem" />
          <Select.Item label={t('incident.type.weather')} value="weather" />
          <Select.Item label={t('incident.type.vehicle_issue')} value="vehicle_issue" />
          <Select.Item label={t('incident.type.other')} value="other" />
        </Select>

        <Label>{t('incident.severity.label')}</Label>
        <Select
          selectedValue={severity}
          onValueChange={(value) => setSeverity(value as IncidentSeverity)}
        >
          <Select.Item label={t('incident.severity.low')} value="low" />
          <Select.Item label={t('incident.severity.medium')} value="medium" />
          <Select.Item label={t('incident.severity.high')} value="high" />
          <Select.Item label={t('incident.severity.critical')} value="critical" />
        </Select>

        <Label>{t('incident.description.label')}</Label>
        <Input
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
          placeholder={t('incident.description.placeholder')}
          placeholderTextColor={({ theme }) => theme.colors.textSecondary}
        />

        <Label>{t('incident.photos.label')}</Label>
        <PhotoCapture onPhotoTaken={handlePhotoTaken} />

        {photos.length > 0 && (
          <AccessibleText>
            {t('incident.photos.count', { count: photos.length })}
          </AccessibleText>
        )}

        <AccessibleButton
          onPress={handleSubmit}
          variant="primary"
          style={{ marginTop: 20 }}
          accessibilityLabel={t('incident.submit')}
        >
          {t('incident.submit')}
        </AccessibleButton>
      </FormSection>
    </Container>
  );
};
