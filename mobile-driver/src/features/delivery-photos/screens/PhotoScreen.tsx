import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import styled from 'styled-components/native';
import { PhotoCapture } from '../components/PhotoCapture';
import { PhotoGallery } from '../components/PhotoGallery';
import { photoService, Photo } from '../services/PhotoService';
import { useTranslation } from '../../../i18n/hooks/useTranslation';
import { AccessibleText } from '../../../components/accessible/AccessibleText';
import { LoadingAnimation } from '../../../components/animations/LoadingAnimation';

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Header = styled.View`
  padding: ${({ theme }) => theme.spacing.md}px;
  background-color: ${({ theme }) => theme.colors.surface};
`;

const Title = styled(AccessibleText)`
  font-size: ${({ theme }) => theme.typography.h2.fontSize}px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
`;

interface PhotoScreenProps {
  route: {
    params?: {
      deliveryId?: string;
      type?: 'delivery' | 'incident';
    };
  };
  navigation: any;
}

export const PhotoScreen: React.FC<PhotoScreenProps> = ({
  route,
  navigation,
}) => {
  const { t } = useTranslation();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);

  const deliveryId = route.params?.deliveryId;
  const type = route.params?.type || 'delivery';

  useEffect(() => {
    loadPhotos();
  }, [deliveryId]);

  const loadPhotos = () => {
    if (deliveryId) {
      setPhotos(photoService.getPhotosByDeliveryId(deliveryId));
    } else {
      setPhotos(photoService.getPhotosByType(type));
    }
  };

  const handlePhotoTaken = async (uri: string) => {
    try {
      setLoading(true);
      const photo = await photoService.savePhoto(uri, type, deliveryId);
      setPhotos((prev) => [...prev, photo]);
      Alert.alert(
        t('photo.success.title'),
        t('photo.success.message')
      );
    } catch (error) {
      Alert.alert(
        t('photo.error.title'),
        t('photo.error.save')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    Alert.alert(
      t('photo.delete.title'),
      t('photo.delete.message'),
      [
        {
          text: t('common.cancel'),
          style: 'cancel',
        },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await photoService.deletePhoto(photoId);
              setPhotos((prev) => prev.filter((p) => p.id !== photoId));
            } catch (error) {
              Alert.alert(
                t('photo.error.title'),
                t('photo.error.delete')
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleViewPhoto = (photo: Photo) => {
    navigation.navigate('PhotoViewer', { photo });
  };

  if (loading) {
    return <LoadingAnimation />;
  }

  return (
    <Container>
      <Header>
        <Title>
          {type === 'delivery'
            ? t('photo.delivery.title')
            : t('photo.incident.title')}
        </Title>
      </Header>

      <PhotoCapture onPhotoTaken={handlePhotoTaken} />

      <PhotoGallery
        photos={photos}
        onDeletePhoto={handleDeletePhoto}
        onViewPhoto={handleViewPhoto}
      />
    </Container>
  );
};
