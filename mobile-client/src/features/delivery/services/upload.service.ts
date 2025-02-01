import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { API_URL } from '../../../config';

interface UploadResponse {
  url: string;
  type: string;
  name: string;
}

class UploadService {
  private readonly MAX_IMAGE_SIZE = 1024 * 1024; // 1MB
  private readonly COMPRESSION_QUALITY = 0.7;

  async uploadImage(uri: string): Promise<UploadResponse> {
    try {
      // Vérifier la taille du fichier
      const fileInfo = await FileSystem.getInfoAsync(uri);
      let imageUri = uri;

      // Compresser l'image si elle est trop grande
      if (fileInfo.size && fileInfo.size > this.MAX_IMAGE_SIZE) {
        const manipResult = await manipulateAsync(
          uri,
          [{ resize: { width: 1024 } }],
          {
            compress: this.COMPRESSION_QUALITY,
            format: SaveFormat.JPEG,
          }
        );
        imageUri = manipResult.uri;
      }

      // Créer le FormData
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      } as any);

      // Envoyer au serveur
      const response = await axios.post<UploadResponse>(
        `${API_URL}/chat/attachments`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  }

  async validateImage(uri: string): Promise<boolean> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      
      // Vérifier si le fichier existe
      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }

      // Vérifier le type de fichier (doit être une image)
      const extension = uri.split('.').pop()?.toLowerCase();
      const validExtensions = ['jpg', 'jpeg', 'png', 'heic'];
      
      if (!extension || !validExtensions.includes(extension)) {
        throw new Error('Invalid file type');
      }

      return true;
    } catch (error) {
      console.error('Error validating image:', error);
      return false;
    }
  }
}

export const uploadService = new UploadService();
