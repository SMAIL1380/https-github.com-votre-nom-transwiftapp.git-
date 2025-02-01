import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { AccessibleForm, AccessibleButton, AccessibleInput } from '../../../components/accessible';
import { ProfileAvatar } from '../components/ProfileAvatar';
import { AddressForm } from '../components/AddressForm';
import { NotificationSettings } from '../components/NotificationSettings';
import { useProfile } from '../hooks/useProfile';
import { CustomTheme } from '../../../theme/types';
import { useNavigation } from '@react-navigation/native';

export const ProfileScreen: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme() as CustomTheme;
  const navigation = useNavigation();
  const { profile, updateProfile } = useProfile();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpdate = async (data: any) => {
    try {
      setLoading(true);
      setError('');
      await updateProfile(data);
    } catch (err) {
      setError(t('profile.updateError'));
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (avatarUrl: string) => {
    handleUpdate({ avatarUrl });
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <ProfileAvatar
        avatarUrl={profile?.avatarUrl}
        onAvatarChange={handleAvatarChange}
        size={120}
      />
      
      <AccessibleForm
        style={styles.form}
        onSubmit={handleUpdate}
        loading={loading}
        error={error}
      >
        <AccessibleInput
          value={profile?.name}
          onChangeText={(text) => handleUpdate({ name: text })}
          placeholder={t('profile.namePlaceholder')}
        />
        <AccessibleInput
          value={profile?.phone}
          onChangeText={(text) => handleUpdate({ phone: text })}
          placeholder={t('profile.phonePlaceholder')}
          keyboardType="phone-pad"
        />
        <AddressForm
          address={profile?.address}
          onUpdate={(address) => handleUpdate({ address })}
        />
        <NotificationSettings
          settings={profile?.notificationSettings}
          onUpdate={(settings) => handleUpdate({ notificationSettings: settings })}
        />
      </AccessibleForm>

      <View style={styles.section}>
        <AccessibleButton
          onPress={() => navigation.navigate('Addresses')}
          title={t('profile.manageAddresses')}
          variant="secondary"
          style={styles.sectionButton}
        />
        <AccessibleButton
          onPress={() => navigation.navigate('OrderHistory')}
          title={t('profile.viewOrderHistory')}
          variant="secondary"
          style={styles.sectionButton}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  form: {
    width: '100%',
  },
  section: {
    marginTop: 24,
  },
  sectionButton: {
    marginVertical: 8,
  },
});
