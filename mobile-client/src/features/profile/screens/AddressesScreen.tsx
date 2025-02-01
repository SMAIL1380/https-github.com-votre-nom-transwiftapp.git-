import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { AccessibleText, AccessibleButton } from '../../../components/accessible';
import { AddressForm } from '../components/AddressForm';
import { ProfileService } from '../services/profile.service';
import { Address } from '../types/profile.types';
import { CustomTheme } from '../../../theme/types';

export const AddressesScreen: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme() as CustomTheme;
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const data = await ProfileService.getAddresses();
      setAddresses(data);
    } catch (err) {
      setError(t('address.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (address: Address) => {
    try {
      const newAddress = await ProfileService.addAddress(address);
      setAddresses([...addresses, newAddress]);
      setShowAddForm(false);
    } catch (err) {
      setError(t('address.addError'));
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      await ProfileService.setDefaultAddress(addressId);
      const updatedAddresses = addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId,
      }));
      setAddresses(updatedAddresses);
    } catch (err) {
      setError(t('address.defaultError'));
    }
  };

  const handleDelete = async (addressId: string) => {
    try {
      await ProfileService.deleteAddress(addressId);
      setAddresses(addresses.filter(addr => addr.id !== addressId));
    } catch (err) {
      setError(t('address.deleteError'));
    }
  };

  const renderAddress = ({ item }: { item: Address }) => (
    <View style={[styles.addressCard, { backgroundColor: theme.colors.card }]}>
      <View style={styles.addressHeader}>
        <AccessibleText style={styles.addressLabel}>{item.label}</AccessibleText>
        {item.isDefault && (
          <AccessibleText style={styles.defaultBadge}>
            {t('address.default')}
          </AccessibleText>
        )}
      </View>
      <AccessibleText style={styles.addressText}>{item.street}</AccessibleText>
      <AccessibleText style={styles.addressText}>
        {`${item.city}, ${item.postalCode}`}
      </AccessibleText>
      <AccessibleText style={styles.addressText}>{item.country}</AccessibleText>
      {item.additionalInfo && (
        <AccessibleText style={styles.additionalInfo}>
          {item.additionalInfo}
        </AccessibleText>
      )}
      <View style={styles.actions}>
        {!item.isDefault && (
          <AccessibleButton
            onPress={() => handleSetDefault(item.id)}
            title={t('address.setDefault')}
            variant="secondary"
          />
        )}
        <AccessibleButton
          onPress={() => handleDelete(item.id)}
          title={t('address.delete')}
          variant="danger"
        />
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {error ? (
        <AccessibleText style={styles.error}>{error}</AccessibleText>
      ) : null}
      
      {!showAddForm ? (
        <>
          <FlatList
            data={addresses}
            renderItem={renderAddress}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
          />
          <AccessibleButton
            onPress={() => setShowAddForm(true)}
            title={t('address.addNew')}
            style={styles.addButton}
          />
        </>
      ) : (
        <>
          <AddressForm onSubmit={handleAddAddress} />
          <AccessibleButton
            onPress={() => setShowAddForm(false)}
            title={t('common.cancel')}
            variant="secondary"
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    padding: 16,
  },
  addressCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  defaultBadge: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  addressText: {
    fontSize: 16,
    marginBottom: 4,
  },
  additionalInfo: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 8,
  },
  addButton: {
    margin: 16,
  },
  error: {
    color: '#f44336',
    padding: 16,
    textAlign: 'center',
  },
});
