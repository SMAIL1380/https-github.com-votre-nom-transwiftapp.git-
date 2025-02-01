import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { RNCamera } from 'react-native-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';

const DocumentVerificationScreen = ({ navigation }) => {
  const [documents, setDocuments] = useState({
    identityCard: null,
    drivingLicense: null,
    vehicleRegistration: null,
    insurance: null,
  });
  const [currentDocument, setCurrentDocument] = useState(null);
  const [loading, setLoading] = useState(false);

  const takePicture = async (camera) => {
    if (camera && currentDocument) {
      const options = { quality: 0.5, base64: true };
      const data = await camera.takePictureAsync(options);
      setDocuments(prev => ({
        ...prev,
        [currentDocument]: data.uri
      }));
      setCurrentDocument(null);
    }
  };

  const uploadDocuments = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      
      Object.entries(documents).forEach(([key, value]) => {
        if (value) {
          formData.append(key, {
            uri: value,
            type: 'image/jpeg',
            name: `${key}.jpg`,
          });
        }
      });

      await axios.post('/api/driver/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      navigation.navigate('Home');
    } catch (error) {
      console.error('Upload error:', error);
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  if (currentDocument) {
    return (
      <View style={styles.container}>
        <RNCamera
          style={styles.camera}
          type={RNCamera.Constants.Type.back}
          androidCameraPermissionOptions={{
            title: 'Permission d\'utiliser la caméra',
            message: 'Nous avons besoin de votre permission pour utiliser la caméra',
            buttonPositive: 'Ok',
            buttonNegative: 'Annuler',
          }}
        >
          {({ camera }) => (
            <View style={styles.cameraButtons}>
              <Button 
                mode="contained" 
                onPress={() => takePicture(camera)}
                style={styles.button}
              >
                Prendre la photo
              </Button>
              <Button 
                mode="outlined" 
                onPress={() => setCurrentDocument(null)}
                style={styles.button}
              >
                Annuler
              </Button>
            </View>
          )}
        </RNCamera>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Vérification des documents</Text>
      
      <View style={styles.documentList}>
        {Object.entries(documents).map(([key, value]) => (
          <View key={key} style={styles.documentItem}>
            {value ? (
              <Image source={{ uri: value }} style={styles.documentImage} />
            ) : null}
            <Button
              mode={value ? "outlined" : "contained"}
              onPress={() => setCurrentDocument(key)}
              style={styles.button}
            >
              {value ? 'Reprendre' : 'Ajouter'} {key}
            </Button>
          </View>
        ))}
      </View>

      <Button
        mode="contained"
        onPress={uploadDocuments}
        loading={loading}
        disabled={!Object.values(documents).every(Boolean)}
        style={styles.submitButton}
      >
        Soumettre les documents
      </Button>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  camera: {
    flex: 1,
  },
  cameraButtons: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingBottom: 20,
  },
  documentList: {
    padding: 20,
  },
  documentItem: {
    marginBottom: 20,
  },
  documentImage: {
    width: '100%',
    height: 200,
    marginBottom: 10,
    borderRadius: 8,
  },
  button: {
    marginVertical: 5,
  },
  submitButton: {
    margin: 20,
  },
});

export default DocumentVerificationScreen;
