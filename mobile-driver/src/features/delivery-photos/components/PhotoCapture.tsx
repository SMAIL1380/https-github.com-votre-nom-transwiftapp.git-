import React, { useState } from 'react';
import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import ImageResizer from 'react-native-image-resizer';
import styled from 'styled-components/native';
import { useTranslation } from '../../../i18n/hooks/useTranslation';
import { AccessibleButton } from '../../../components/accessible/AccessibleButton';
import { AccessibleImage } from '../../../components/accessible/AccessibleImage';

const Container = styled.View`
  padding: ${({ theme }) => theme.spacing.md}px;
`;

const PreviewContainer = styled.View`
  margin-top: ${({ theme }) => theme.spacing.md}px;
  border-radius: ${({ theme }) => theme.borderRadius.md}px;
  overflow: hidden;
`;

const ButtonContainer = styled.View`
  flex-direction: row;
  justify-content: space-around;
  margin-top: ${({ theme }) => theme.spacing.md}px;
`;

interface PhotoCaptureProps {
  onPhotoTaken: (uri: string) => void;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export const PhotoCapture: React.FC<PhotoCaptureProps> = ({
  onPhotoTaken,
  maxWidth = 1024,
  maxHeight = 1024,
  quality = 80,
}) => {
  const { t } = useTranslation();
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const compressImage = async (uri: string): Promise<string> => {
    try {
      const response = await ImageResizer.createResizedImage(
        uri,
        maxWidth,
        maxHeight,
        'JPEG',
        quality,
        0,
        undefined,
        false,
        { mode: 'contain', onlyScaleDown: true }
      );
      return response.uri;
    } catch (error) {
      console.error('Error compressing image:', error);
      return uri;
    }
  };

  const handleTakePhoto = () => {
    const options: ImagePicker.CameraOptions = {
      mediaType: 'photo',
      quality: 1,
      saveToPhotos: true,
      cameraType: 'back',
    };

    ImagePicker.launchCamera(options, async (response) => {
      if (response.didCancel) {
        return;
      }

      if (response.errorCode) {
        Alert.alert(t('photo.error.title'), t('photo.error.camera'));
        return;
      }

      if (response.assets?.[0]?.uri) {
        const compressedUri = await compressImage(response.assets[0].uri);
        setPreviewUri(compressedUri);
        onPhotoTaken(compressedUri);
      }
    });
  };

  const handleChoosePhoto = () => {
    const options: ImagePicker.ImageLibraryOptions = {
      mediaType: 'photo',
      quality: 1,
    };

    ImagePicker.launchImageLibrary(options, async (response) => {
      if (response.didCancel) {
        return;
      }

      if (response.errorCode) {
        Alert.alert(t('photo.error.title'), t('photo.error.gallery'));
        return;
      }

      if (response.assets?.[0]?.uri) {
        const compressedUri = await compressImage(response.assets[0].uri);
        setPreviewUri(compressedUri);
        onPhotoTaken(compressedUri);
      }
    });
  };

  return (
    <Container>
      <ButtonContainer>
        <AccessibleButton
          onPress={handleTakePhoto}
          variant="primary"
          accessibilityLabel={t('photo.take')}
        >
          {t('photo.take')}
        </AccessibleButton>
        <AccessibleButton
          onPress={handleChoosePhoto}
          variant="outline"
          accessibilityLabel={t('photo.choose')}
        >
          {t('photo.choose')}
        </AccessibleButton>
      </ButtonContainer>

      {previewUri && (
        <PreviewContainer>
          <AccessibleImage
            source={{ uri: previewUri }}
            style={{ width: '100%', height: 300 }}
            description={t('photo.preview.description')}
          />
        </PreviewContainer>
      )}
    </Container>
  );
};
