import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { Text, Button, Portal, Modal, List } from 'react-native-paper';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import { useDispatch } from 'react-redux';
import { updateDeliveryStatus } from '../../store/slices/deliverySlice';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width, height } = Dimensions.get('window');

const NavigationScreen = ({ route, navigation }) => {
  const { delivery } = route.params;
  const dispatch = useDispatch();
  const mapRef = useRef(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [route, setRoute] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [distance, setDistance] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [navigationSteps, setNavigationSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    startLocationTracking();
    calculateRoute();
  }, []);

  const startLocationTracking = () => {
    Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
        updateDriverLocation(latitude, longitude);
        checkArrival(latitude, longitude);
      },
      (error) => console.error(error),
      {
        enableHighAccuracy: true,
        distanceFilter: 10,
        interval: 5000,
        fastestInterval: 2000,
      }
    );
  };

  const calculateRoute = async () => {
    try {
      const origin = `${currentLocation.latitude},${currentLocation.longitude}`;
      const destination = `${delivery.pickupLatitude},${delivery.pickupLongitude}`;
      
      // Utiliser un service de routage (Google Directions API, Mapbox, etc.)
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${GOOGLE_MAPS_API_KEY}`
      );
      
      const data = await response.json();
      if (data.routes.length > 0) {
        const points = decodePolyline(data.routes[0].overview_polyline.points);
        setRoute(points);
        setEstimatedTime(data.routes[0].legs[0].duration.text);
        setDistance(data.routes[0].legs[0].distance.text);
        setNavigationSteps(data.routes[0].legs[0].steps);
      }
    } catch (error) {
      console.error('Failed to calculate route:', error);
    }
  };

  const checkArrival = (latitude, longitude) => {
    const destinationCoords = {
      latitude: delivery.pickupLatitude,
      longitude: delivery.pickupLongitude,
    };

    const distance = calculateDistance(
      { latitude, longitude },
      destinationCoords
    );

    if (distance < 0.1) { // 100 mètres
      dispatch(updateDeliveryStatus({
        deliveryId: delivery.id,
        status: 'arrived_pickup'
      }));
      navigation.navigate('DeliveryDetails', { delivery });
    }
  };

  const calculateDistance = (point1, point2) => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = toRad(point2.latitude - point1.latitude);
    const dLon = toRad(point2.longitude - point1.longitude);
    const lat1 = toRad(point1.latitude);
    const lat2 = toRad(point2.latitude);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const toRad = (value) => {
    return value * Math.PI / 180;
  };

  const centerOnLocation = () => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        ...currentLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          ...currentLocation,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        showsUserLocation
        followsUserLocation
      >
        {route && (
          <Polyline
            coordinates={route}
            strokeWidth={4}
            strokeColor="#2196F3"
          />
        )}
        
        <Marker
          coordinate={{
            latitude: delivery.pickupLatitude,
            longitude: delivery.pickupLongitude,
          }}
          title="Point de retrait"
          description={delivery.pickupAddress}
        />
      </MapView>

      <View style={styles.overlay}>
        <View style={styles.infoCard}>
          <Text style={styles.address}>{delivery.pickupAddress}</Text>
          <View style={styles.infoRow}>
            <Text>Temps estimé: {estimatedTime}</Text>
            <Text>Distance: {distance}</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={() => setShowInstructions(true)}
            icon="navigation"
            style={styles.button}
          >
            Instructions
          </Button>
          <Button
            mode="contained"
            onPress={centerOnLocation}
            icon="crosshairs-gps"
            style={styles.button}
          >
            Recentrer
          </Button>
        </View>
      </View>

      <Portal>
        <Modal
          visible={showInstructions}
          onDismiss={() => setShowInstructions(false)}
          contentContainerStyle={styles.modal}
        >
          <Text style={styles.modalTitle}>Instructions de navigation</Text>
          <List.Section>
            {navigationSteps.map((step, index) => (
              <List.Item
                key={index}
                title={step.html_instructions.replace(/<[^>]*>/g, '')}
                description={`${step.distance.text} - ${step.duration.text}`}
                left={props => (
                  <List.Icon
                    {...props}
                    icon={index === currentStep ? 'arrow-right-bold' : 'circle-small'}
                  />
                )}
                style={index === currentStep ? styles.currentStep : null}
              />
            ))}
          </List.Section>
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
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
  },
  address: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  modal: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 8,
    padding: 20,
    maxHeight: height * 0.7,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  currentStep: {
    backgroundColor: '#e3f2fd',
  },
});

export default NavigationScreen;
