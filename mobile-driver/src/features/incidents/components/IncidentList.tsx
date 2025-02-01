import React from 'react';
import { FlatList } from 'react-native';
import styled from 'styled-components/native';
import { Incident, IncidentStatus } from '../services/IncidentService';
import { useTranslation } from '../../../i18n/hooks/useTranslation';
import { AccessibleText } from '../../../components/accessible/AccessibleText';
import { AccessibleButton } from '../../../components/accessible/AccessibleButton';

const IncidentCard = styled.View`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  padding: ${({ theme }) => theme.spacing.md}px;
  margin: ${({ theme }) => theme.spacing.sm}px;
  border-left-width: 4px;
  border-left-color: ${({ theme, severity }) => {
    switch (severity) {
      case 'critical':
        return theme.colors.error;
      case 'high':
        return theme.colors.warning;
      case 'medium':
        return theme.colors.info;
      default:
        return theme.colors.success;
    }
  }};
`;

const Title = styled(AccessibleText)`
  font-size: ${({ theme }) => theme.typography.subtitle.fontSize}px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

const Description = styled(AccessibleText)`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.sm}px;
`;

const StatusBadge = styled.View`
  background-color: ${({ theme, status }) => {
    switch (status) {
      case 'resolved':
        return theme.colors.success;
      case 'in_review':
        return theme.colors.warning;
      case 'closed':
        return theme.colors.textSecondary;
      default:
        return theme.colors.error;
    }
  }};
  padding: ${({ theme }) => theme.spacing.xs}px ${({ theme }) => theme.spacing.sm}px;
  border-radius: ${({ theme }) => theme.borderRadius.sm}px;
  align-self: flex-start;
`;

const StatusText = styled(AccessibleText)`
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
`;

const TimeText = styled(AccessibleText)`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  margin-top: ${({ theme }) => theme.spacing.xs}px;
`;

interface IncidentListProps {
  incidents: Incident[];
  onIncidentPress: (incident: Incident) => void;
}

export const IncidentList: React.FC<IncidentListProps> = ({
  incidents,
  onIncidentPress,
}) => {
  const { t } = useTranslation();

  const renderIncident = ({ item: incident }: { item: Incident }) => (
    <IncidentCard severity={incident.severity}>
      <Title>
        {t(`incident.type.${incident.type}`)}
      </Title>
      <Description numberOfLines={2}>
        {incident.description}
      </Description>
      <StatusBadge status={incident.status}>
        <StatusText>
          {t(`incident.status.${incident.status}`)}
        </StatusText>
      </StatusBadge>
      <TimeText>
        {new Date(incident.timestamp).toLocaleString()}
      </TimeText>
      <AccessibleButton
        onPress={() => onIncidentPress(incident)}
        variant="text"
        style={{ marginTop: 8 }}
        accessibilityLabel={t('incident.view_details')}
      >
        {t('incident.view_details')}
      </AccessibleButton>
    </IncidentCard>
  );

  if (incidents.length === 0) {
    return (
      <Description style={{ textAlign: 'center', padding: 20 }}>
        {t('incident.no_incidents')}
      </Description>
    );
  }

  return (
    <FlatList
      data={incidents}
      renderItem={renderIncident}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 8 }}
    />
  );
};
