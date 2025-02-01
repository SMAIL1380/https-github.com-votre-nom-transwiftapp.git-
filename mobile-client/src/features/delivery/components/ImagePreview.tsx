import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AccessibleText } from '../../../components/accessible';
import { CustomTheme } from '../../../theme/types';

interface ImagePreviewProps {
  uri: string;
  onClose: () => void;
  onConfirm: () => void;
  isUploading?: boolean;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  uri,
  onClose,
  onConfirm,
  isUploading = false,
}) => {
  const theme = useTheme() as CustomTheme;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View
          style={[styles.content, { backgroundColor: theme.colors.background }]}
        >
          <View style={styles.header}>
            <AccessibleText style={[styles.title, { color: theme.colors.text }]}>
              Aperçu de l'image
            </AccessibleText>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={theme.colors.text}
              />
            </Pressable>
          </View>

          <View style={styles.imageContainer}>
            <Image source={{ uri }} style={styles.image} resizeMode="contain" />
          </View>

          <View style={styles.footer}>
            <Pressable
              style={[styles.button, { backgroundColor: theme.colors.error }]}
              onPress={onClose}
            >
              <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
              <AccessibleText style={styles.buttonText}>Annuler</AccessibleText>
            </Pressable>

            <Pressable
              style={[
                styles.button,
                {
                  backgroundColor: isUploading
                    ? theme.colors.border
                    : theme.colors.primary,
                },
              ]}
              onPress={onConfirm}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="send"
                    size={24}
                    color="#FFFFFF"
                  />
                  <AccessibleText style={styles.buttonText}>
                    Envoyer
                  </AccessibleText>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    height: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  imageContainer: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 16,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
