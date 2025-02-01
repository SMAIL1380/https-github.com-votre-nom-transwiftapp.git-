import React from 'react';
import { FlatList, StyleSheet, View, RefreshControl } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { DeliveryCard } from './DeliveryCard';
import { EmptyState } from '../common/EmptyState';
import { ListItemTransition } from '../animations/transitions/ListItemTransition';
import { useTranslation } from 'react-i18next';
import { Delivery } from '../../features/delivery/services/DeliveryService';

interface DeliveryListProps {
  deliveries: Delivery[];
  refreshControl?: React.ReactElement;
  onDeliveryPress?: (delivery: Delivery) => void;
}

export const DeliveryList: React.FC<DeliveryListProps> = ({
  deliveries,
  refreshControl,
  onDeliveryPress,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const renderItem = ({ item, index }: { item: Delivery; index: number }) => (
    <ListItemTransition delay={index * 100}>
      <DeliveryCard
        delivery={item}
        onPress={() => onDeliveryPress?.(item)}
        style={styles.card}
      />
    </ListItemTransition>
  );

  if (deliveries.length === 0) {
    return (
      <EmptyState
        icon="local-shipping"
        title={t('deliveries.empty.title')}
        description={t('deliveries.empty.description')}
        refreshControl={refreshControl}
      />
    );
  }

  return (
    <FlatList
      data={deliveries}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
      refreshControl={refreshControl}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  card: {
    marginVertical: 4,
  },
  separator: {
    height: 8,
  },
});
