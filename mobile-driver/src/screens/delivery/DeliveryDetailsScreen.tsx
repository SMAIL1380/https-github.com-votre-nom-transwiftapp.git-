import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Platform } from 'react-native';
import { Text, Button, Card, List, Portal, Modal, TextInput } from 'react-native-paper';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Geolocation from '@react-native-community/geolocation';
import { Camera } from 'react-native-vision-camera';
import SignatureCapture from 'react-native-signature-capture';
import axios from 'axios';

const DeliveryDetailsScreen = ({ route, navigation }) => {
  const { deliveryId } = route.params;
  const [delivery, setDelivery] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [deliveryNote, setDeliveryNote] = useState('');
  const [loading, setLoading] = useState(false);
  
  const mapRef = useRef(null);
  const signatureRef = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    loadDeliveryDetails();
    startLocationTracking();
    
    return () => {
      // Cleanup location tracking
      if (watchId) {
        Geolocation.clearWatch(watchId);
      }
    };
  }, []);

  const loadDeliveryDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/driver/deliveries/${deliveryId}`);
      setDelivery(response.data);
    } catch (error) {
      console.error('Failed to load delivery details:', error);
    }
  };

  let watchId;
  const startLocationTracking = () => {
    watchId = Geolocation.watchPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
        
        // Update location in backend
        updateDriverLocation(latitude, longitude);
      },
      error => console.error(error),
      {
        enableHighAccuracy: true,
        distanceFilter: 10, // Update every 10 meters
        interval: 5000, // Update every 5 seconds
      }
    );
  };

  const updateDriverLocation = async (latitude, longitude) => {
    try {
      await axios.post(`${API_URL}/api/driver/location`, {
        deliveryId,
        latitude,
        longitude,
      });
    } catch (error) {
      console.error('Failed to update location:', error);
    }
  };

  const handleStartDelivery = async () => {
    try {
      await axios.post(`${API_URL}/api/driver/deliveries/${deliveryId}/start`);
      loadDeliveryDetails();
    } catch (error) {
      console.error('Failed to start delivery:', error);
    }
  };

  const handlePickupConfirmation = async () => {
    try {
      await axios.post(`${API_URL}/api/driver/deliveries/${deliveryId}/pickup`);
      loadDeliveryDetails();
    } catch (error) {
      console.error('Failed to confirm pickup:', error);
    }
  };

  const handleCompleteDelivery = async () => {
    try {
      setLoading(true);
      
      // Upload signature
      if (signatureRef.current) {
        const { signature } = await signatureRef.current.capture();
        await uploadSignature(signature);
      }

      // Upload delivery photo
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePhoto();
        await uploadDeliveryPhoto(photo);
      }

      // Complete delivery
      await axios.post(`${API_URL}/api/driver/deliveries/${deliveryId}/complete`, {
        note: deliveryNote,
      });

      navigation.goBack();
    } catch (error) {
      console.error('Failed to complete delivery:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadSignature = async (signature) => {
    const formData = new FormData();
    formData.append('signature', signature);
    
    await axios.post(
      `${API_URL}/api/driver/deliveries/${deliveryId}/signature`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  };

  const uploadDeliveryPhoto = async (photo) => {
    const formData = new FormData();
    formData.append('photo', {
      uri: photo.path,
      type: 'image/jpeg',
      name: 'delivery-proof.jpg',
    });

    await axios.post(
      `${API_URL}/api/driver/deliveries/${deliveryId}/photo`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  };

  const renderDeliveryStatus = () => {
    if (!delivery) return null;

    return (
      <Card style={styles.statusCard}>
        <Card.Content>
          <View style={styles.statusHeader}>
            <Text variant="titleMedium">État de la livraison</Text>
            <Text
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(delivery.status) },
              ]}
            >
              {getStatusText(delivery.status)}
            </Text>
          </View>

          <View style={styles.timeline}>
            {renderTimelineItem('Acceptée', delivery.acceptedAt)}
            {renderTimelineItem('Collecte', delivery.pickedUpAt)}
            {renderTimelineItem('En cours', delivery.startedAt)}
            {renderTimelineItem('Livrée', delivery.completedAt)}
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderTimelineItem = (label, timestamp) => (
    <View style={styles.timelineItem}>
      <View
        style={[
          styles.timelineDot,
          { backgroundColor: timestamp ? 'green' : 'grey' },
        ]}
      />
      <View style={styles.timelineContent}>
        <Text variant="bodyMedium">{label}</Text>
        {timestamp && (
          <Text variant="bodySmall">
            {new Date(timestamp).toLocaleTimeString()}
          </Text>
        )}
      </View>
    </View>
  );

  if (!delivery) {
    return (
      <View style={styles.container}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: delivery.pickupLocation.latitude,
          longitude: delivery.pickupLocation.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <Marker
          coordinate={delivery.pickupLocation}
          title="Point de collecte"
          pinColor="blue"
        />
        <Marker
          coordinate={delivery.deliveryLocation}
          title="Point de livraison"
          pinColor="red"
        />
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title="Ma position"
            pinColor="green"
          />
        )}
        {delivery.route && (
          <Polyline
            coordinates={delivery.route}
            strokeColor="#000"
            strokeWidth={3}
          />
        )}
      </MapView>

      <ScrollView style={styles.detailsContainer}>
        {renderDeliveryStatus()}

        <Card style={styles.detailsCard}>
          <Card.Content>
            <List.Item
              title="Client"
              description={delivery.customerName}
              left={props => <Icon {...props} name="account" size={24} />}
            />
            <List.Item
              title="Téléphone"
              description={delivery.customerPhone}
              left={props => <Icon {...props} name="phone" size={24} />}
              onPress={() => Linking.openURL(`tel:${delivery.customerPhone}`)}
            />
            <List.Item
              title="Colis"
              description={`${delivery.packageDetails.weight}kg - ${delivery.packageDetails.dimensions}`}
              left={props => <Icon {...props} name="package-variant" size={24} />}
            />
          </Card.Content>
        </Card>

        <View style={styles.actionButtons}>
          {delivery.status === 'accepted' && (
            <Button
              mode="contained"
              onPress={handlePickupConfirmation}
              style={styles.actionButton}
            >
              Confirmer la collecte
            </Button>
          )}

          {delivery.status === 'picked_up' && (
            <Button
              mode="contained"
              onPress={handleStartDelivery}
              style={styles.actionButton}
            >
              Démarrer la livraison
            </Button>
          )}

          {delivery.status === 'in_progress' && (
            <>
              <Button
                mode="contained"
                onPress={() => setShowSignatureModal(true)}
                style={styles.actionButton}
              >
                Signature client
              </Button>
              <Button
                mode="contained"
                onPress={() => setShowPhotoModal(true)}
                style={styles.actionButton}
              >
                Photo de livraison
              </Button>
              <Button
                mode="contained"
                onPress={handleCompleteDelivery}
                style={styles.actionButton}
                loading={loading}
              >
                Terminer la livraison
              </Button>
            </>
          )}
        </View>
      </ScrollView>

      <Portal>
        <Modal
          visible={showSignatureModal}
          onDismiss={() => setShowSignatureModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Text variant="titleMedium" style={styles.modalTitle}>
            Signature du client
          </Text>
          <SignatureCapture
            ref={signatureRef}
            style={styles.signature}
            showNativeButtons={false}
            showBorder={true}
            backgroundColor="white"
          />
          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => signatureRef.current?.resetImage()}
            >
              Effacer
            </Button>
            <Button
              mode="contained"
              onPress={() => setShowSignatureModal(false)}
            >
              Valider
            </Button>
          </View>
        </Modal>

        <Modal
          visible={showPhotoModal}
          onDismiss={() => setShowPhotoModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Text variant="titleMedium" style={styles.modalTitle}>
            Photo de livraison
          </Text>
          <Camera
            ref={cameraRef}
            style={styles.camera}
            photo={true}
          />
          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setShowPhotoModal(false)}
            >
              Annuler
            </Button>
            <Button
              mode="contained"
              onPress={async () => {
                await cameraRef.current?.takePhoto();
                setShowPhotoModal(false);
              }}
            >
              Prendre la photo
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    height: '40%',
  },
  detailsContainer: {
    flex: 1,
    padding: 16,
  },
  statusCard: {
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    color: 'white',
  },
  timeline: {
    marginTop: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
  detailsCard: {
    marginBottom: 16,
  },
  actionButtons: {
    gap: 8,
    marginBottom: 16,
  },
  actionButton: {
    marginVertical: 4,
  },
  modal: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 8,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  signature: {
    height: 200,
    marginVertical: 16,
  },
  camera: {
    height: 300,
    marginVertical: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
});

export default DeliveryDetailsScreen;
