import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AccessibleText } from '../../../components/accessible';
import { PriceEstimate } from '../types/delivery.types';
import { formatCurrency } from '../../../utils/currency';

interface PricingSummaryProps {
  estimate: PriceEstimate;
}

export const PricingSummary: React.FC<PricingSummaryProps> = ({ estimate }) => {
  const { t } = useTranslation();

  const renderPriceRow = (label: string, amount: number) => (
    <View style={styles.row}>
      <AccessibleText style={styles.label}>{label}</AccessibleText>
      <AccessibleText style={styles.amount}>
        {formatCurrency(amount, estimate.currency)}
      </AccessibleText>
    </View>
  );

  return (
    <View style={styles.container}>
      <AccessibleText style={styles.title}>
        {t('delivery.pricingSummary')}
      </AccessibleText>

      {renderPriceRow(t('delivery.basePrice'), estimate.basePrice)}
      {renderPriceRow(t('delivery.distancePrice'), estimate.distancePrice)}
      {renderPriceRow(t('delivery.weightPrice'), estimate.weightPrice)}
      
      {estimate.specialHandling > 0 && 
        renderPriceRow(t('delivery.specialHandling'), estimate.specialHandling)
      }

      <View style={styles.divider} />

      <View style={styles.row}>
        <AccessibleText style={styles.totalLabel}>
          {t('delivery.totalPrice')}
        </AccessibleText>
        <AccessibleText style={styles.totalAmount}>
          {formatCurrency(estimate.total, estimate.currency)}
        </AccessibleText>
      </View>

      <AccessibleText style={styles.estimatedTime}>
        {t('delivery.estimatedDuration', {
          duration: Math.round(estimate.estimatedDuration / 60),
        })}
      </AccessibleText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    opacity: 0.7,
  },
  amount: {
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  estimatedTime: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 12,
    opacity: 0.7,
  },
});
