import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text, Card, Button, Portal, Modal, List, ActivityIndicator } from 'react-native-paper';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { uploadDocument, fetchDocuments } from '../../store/slices/documentSlice';

interface Document {
  id: string;
  type: string;
  status: 'pending' | 'approved' | 'rejected';
  expiryDate?: string;
  imageUrl?: string;
  comments?: string;
}

const DocumentsScreen = () => {
  const dispatch = useDispatch();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const docs = await dispatch(fetchDocuments()).unwrap();
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  };

  const handleDocumentUpload = async (documentType: string, source: 'camera' | 'gallery') => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
    };

    try {
      const result = source === 'camera' 
        ? await launchCamera(options)
        : await launchImageLibrary(options);

      if (result.assets?.[0]?.uri) {
        setLoading(true);
        const formData = new FormData();
        formData.append('document', {
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: `${documentType}.jpg`,
        });
        formData.append('type', documentType);

        await dispatch(uploadDocument(formData)).unwrap();
        await loadDocuments();
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'green';
      case 'rejected':
        return 'red';
      default:
        return 'orange';
    }
  };

  const renderUploadOptions = (documentType: string) => (
    <View style={styles.uploadButtons}>
      <Button
        mode="contained"
        onPress={() => handleDocumentUpload(documentType, 'camera')}
        icon="camera"
        style={styles.uploadButton}
      >
        Appareil photo
      </Button>
      <Button
        mode="contained"
        onPress={() => handleDocumentUpload(documentType, 'gallery')}
        icon="image"
        style={styles.uploadButton}
      >
        Galerie
      </Button>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <List.Section>
        <List.Subheader>Documents requis</List.Subheader>
        
        {['identity', 'driving_license', 'vehicle_registration', 'insurance'].map(docType => {
          const document = documents.find(doc => doc.type === docType);
          const title = {
            identity: "Pièce d'identité",
            driving_license: 'Permis de conduire',
            vehicle_registration: 'Carte grise',
            insurance: 'Assurance',
          }[docType];

          return (
            <Card key={docType} style={styles.documentCard}>
              <Card.Content>
                <View style={styles.documentHeader}>
                  <Text variant="titleMedium">{title}</Text>
                  {document && (
                    <Text
                      style={[
                        styles.status,
                        { color: getStatusColor(document.status) }
                      ]}
                    >
                      {document.status === 'approved' ? 'Approuvé' :
                       document.status === 'rejected' ? 'Rejeté' : 'En attente'}
                    </Text>
                  )}
                </View>

                {document?.imageUrl && (
                  <View style={styles.documentPreview}>
                    <Image
                      source={{ uri: document.imageUrl }}
                      style={styles.previewImage}
                    />
                    <Button
                      onPress={() => {
                        setSelectedDocument(document);
                        setShowImageModal(true);
                      }}
                    >
                      Voir l'image
                    </Button>
                  </View>
                )}

                {document?.expiryDate && (
                  <Text style={styles.expiryDate}>
                    Expire le: {new Date(document.expiryDate).toLocaleDateString()}
                  </Text>
                )}

                {document?.comments && (
                  <Text style={styles.comments}>
                    Commentaires: {document.comments}
                  </Text>
                )}

                {renderUploadOptions(docType)}
              </Card.Content>
            </Card>
          );
        })}
      </List.Section>

      <Portal>
        <Modal
          visible={showImageModal}
          onDismiss={() => setShowImageModal(false)}
          contentContainerStyle={styles.modal}
        >
          {selectedDocument?.imageUrl && (
            <Image
              source={{ uri: selectedDocument.imageUrl }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          )}
          <Button
            onPress={() => setShowImageModal(false)}
            style={styles.closeButton}
          >
            Fermer
          </Button>
        </Modal>
      </Portal>

      {loading && (
        <Portal>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text>Chargement...</Text>
          </View>
        </Portal>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  documentCard: {
    margin: 16,
    marginTop: 0,
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  status: {
    fontWeight: 'bold',
  },
  documentPreview: {
    alignItems: 'center',
    marginVertical: 12,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  expiryDate: {
    marginTop: 8,
    color: '#666',
  },
  comments: {
    marginTop: 8,
    color: 'red',
  },
  uploadButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  uploadButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: 400,
    borderRadius: 8,
  },
  closeButton: {
    marginTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

export default DocumentsScreen;
