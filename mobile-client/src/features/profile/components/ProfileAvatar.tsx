import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { AccessibleText } from '../../../components/accessible';
import { ProfileService } from '../services/profile.service';

interface ProfileAvatarProps {
  avatarUrl?: string;
  size?: number;
  onAvatarChange?: (url: string) => void;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  avatarUrl,
  size = 120,
  onAvatarChange,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      setLoading(true);
      const formData = new FormData();
      const filename = uri.split('/').pop() || 'avatar.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('avatar', {
        uri,
        name: filename,
        type,
      } as any);

      const response = await ProfileService.uploadAvatar(formData);
      if (onAvatarChange) {
        onAvatarChange(response.avatarUrl);
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={pickImage}
      disabled={loading}
      style={[styles.container, { width: size, height: size }]}
    >
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          style={[styles.avatar, { width: size, height: size }]}
        />
      ) : (
        <View style={[styles.placeholder, { width: size, height: size }]}>
          <AccessibleText style={styles.placeholderText}>
            {t('profile.addPhoto')}
          </AccessibleText>
        </View>
      )}
      {loading && (
        <View style={[styles.loading, { width: size, height: size }]} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 60,
    overflow: 'hidden',
    alignSelf: 'center',
    marginVertical: 16,
  },
  avatar: {
    borderRadius: 60,
  },
  placeholder: {
    backgroundColor: '#E1E1E1',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 60,
  },
  placeholderText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    padding: 8,
  },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
