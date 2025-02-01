import React from 'react';
import { FlatList, Dimensions } from 'react-native';
import styled from 'styled-components/native';
import { useTranslation } from '../../../i18n/hooks/useTranslation';
import { AccessibleImage } from '../../../components/accessible/AccessibleImage';
import { AccessibleButton } from '../../../components/accessible/AccessibleButton';
import { Photo } from '../services/PhotoService';

const Container = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

const PhotoContainer = styled.View`
  margin: ${({ theme }) => theme.spacing.sm}px;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.surface};
`;

const PhotoActions = styled.View`
  flex-direction: row;
  justify-content: space-around;
  padding: ${({ theme }) => theme.spacing.sm}px;
`;

const DateText = styled.Text`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.caption.fontSize}px;
  text-align: center;
  padding: ${({ theme }) => theme.spacing.sm}px;
`;

interface PhotoGalleryProps {
  photos: Photo[];
  onDeletePhoto: (photoId: string) => void;
  onViewPhoto: (photo: Photo) => void;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos,
  onDeletePhoto,
  onViewPhoto,
}) => {
  const { t } = useTranslation();
  const screenWidth = Dimensions.get('window').width;
  const photoSize = (screenWidth - 48) / 2; // 2 colonnes avec marges

  const renderPhoto = ({ item: photo }: { item: Photo }) => (
    <PhotoContainer>
      <AccessibleButton
        onPress={() => onViewPhoto(photo)}
        accessibilityLabel={t('photo.gallery.view')}
      >
        <AccessibleImage
          source={{ uri: photo.uri }}
          style={{ width: photoSize, height: photoSize }}
          description={t('photo.gallery.description', {
            date: new Date(photo.timestamp).toLocaleDateString(),
          })}
        />
      </AccessibleButton>
      <DateText>
        {new Date(photo.timestamp).toLocaleDateString()}
      </DateText>
      <PhotoActions>
        <AccessibleButton
          onPress={() => onDeletePhoto(photo.id)}
          variant="danger"
          size="small"
          accessibilityLabel={t('photo.gallery.delete')}
        >
          {t('common.delete')}
        </AccessibleButton>
      </PhotoActions>
    </PhotoContainer>
  );

  return (
    <Container>
      <FlatList
        data={photos}
        renderItem={renderPhoto}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ padding: 8 }}
      />
    </Container>
  );
};
