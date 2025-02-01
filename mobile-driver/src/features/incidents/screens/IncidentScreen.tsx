import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { IncidentForm } from '../components/IncidentForm';
import { IncidentList } from '../components/IncidentList';
import { incidentService, Incident } from '../services/IncidentService';
import { useTranslation } from '../../../i18n/hooks/useTranslation';
import { AccessibleText } from '../../../components/accessible/AccessibleText';
import { AccessibleButton } from '../../../components/accessible/AccessibleButton';
import { LoadingAnimation } from '../../../components/animations/LoadingAnimation';

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Header = styled.View`
  padding: ${({ theme }) => theme.spacing.md}px;
  background-color: ${({ theme }) => theme.colors.surface};
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled(AccessibleText)`
  font-size: ${({ theme }) => theme.typography.h2.fontSize}px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
`;

const TabContainer = styled.View`
  flex-direction: row;
  padding: ${({ theme }) => theme.spacing.sm}px;
  background-color: ${({ theme }) => theme.colors.surface};
`;

const Tab = styled.TouchableOpacity<{ active: boolean }>`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.sm}px;
  align-items: center;
  border-bottom-width: 2px;
  border-bottom-color: ${({ theme, active }) =>
    active ? theme.colors.primary : 'transparent'};
`;

const TabText = styled(AccessibleText)<{ active: boolean }>`
  color: ${({ theme, active }) =>
    active ? theme.colors.primary : theme.colors.textSecondary};
`;

interface IncidentScreenProps {
  route: {
    params?: {
      deliveryId?: string;
    };
  };
  navigation: any;
}

type Tab = 'list' | 'create';

export const IncidentScreen: React.FC<IncidentScreenProps> = ({
  route,
  navigation,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('list');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  const deliveryId = route.params?.deliveryId;

  useEffect(() => {
    loadIncidents();
  }, [deliveryId]);

  const loadIncidents = () => {
    setLoading(true);
    const loadedIncidents = deliveryId
      ? incidentService.getIncidentsByDeliveryId(deliveryId)
      : incidentService.getIncidents();
    setIncidents(loadedIncidents);
    setLoading(false);
  };

  const handleIncidentCreated = () => {
    setActiveTab('list');
    loadIncidents();
  };

  const handleIncidentPress = (incident: Incident) => {
    navigation.navigate('IncidentDetails', { incidentId: incident.id });
  };

  if (loading) {
    return <LoadingAnimation />;
  }

  return (
    <Container>
      <Header>
        <Title>
          {deliveryId
            ? t('incident.delivery_incidents')
            : t('incident.all_incidents')}
        </Title>
        {activeTab === 'list' && (
          <AccessibleButton
            onPress={() => setActiveTab('create')}
            variant="primary"
            size="small"
            accessibilityLabel={t('incident.create')}
          >
            {t('incident.create')}
          </AccessibleButton>
        )}
      </Header>

      <TabContainer>
        <Tab
          active={activeTab === 'list'}
          onPress={() => setActiveTab('list')}
          accessibilityRole="tab"
          accessibilityLabel={t('incident.tab.list')}
          accessibilityState={{ selected: activeTab === 'list' }}
        >
          <TabText active={activeTab === 'list'}>
            {t('incident.tab.list')}
          </TabText>
        </Tab>
        <Tab
          active={activeTab === 'create'}
          onPress={() => setActiveTab('create')}
          accessibilityRole="tab"
          accessibilityLabel={t('incident.tab.create')}
          accessibilityState={{ selected: activeTab === 'create' }}
        >
          <TabText active={activeTab === 'create'}>
            {t('incident.tab.create')}
          </TabText>
        </Tab>
      </TabContainer>

      {activeTab === 'list' ? (
        <IncidentList
          incidents={incidents}
          onIncidentPress={handleIncidentPress}
        />
      ) : (
        <IncidentForm
          deliveryId={deliveryId}
          onIncidentCreated={handleIncidentCreated}
        />
      )}
    </Container>
  );
};
