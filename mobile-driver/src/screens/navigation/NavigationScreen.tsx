import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { Text, Button, Card, List, IconButton, Portal, Modal } from 'react-native-paper';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import NavigationService from '../../services/NavigationService';
import { useSelector } from 'react-redux';
import { decode } from '@mapbox/polyline';

interface Step {
  distance: number;
  duration: number;
  instructions: string;
  polyline: string;
}

const NavigationScreen = ({ route, navigation }) => {
  const { delivery } = route.params;
  const [currentLocation, setCurrentLocation] = useState(null);
  const [route, setRoute] = useState(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [remainingDistance, setRemainingDistance] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  
  const mapRef = useRef(null);

  useEffect(() => {
    initializeNavigation();
    startLocationTracking();

    return () => {
      NavigationService.stopLocationTracking();
    };
  }, []);

  const initializeNavigation = async () => {
    try {
      const location = await NavigationService.getCurrentLocation();
      setCurrentLocation(location);

      const destination = delivery.status === 'accepted' 
        ? delivery.pickupLocation 
        : delivery.deliveryLocation;

      const routeInfo = await NavigationService.calculateRoute(location, destination);
      
      setRoute({
        coordinates: decode(routeInfo.polyline).map(([lat, lng]) => ({
          latitude: lat,
          longitude: lng,
        })),
      });
      
      setSteps(routeInfo.steps);
      setEstimatedTime(routeInfo.duration);
      setRemainingDistance(routeInfo.distance);
    } catch (error) {
      console.error('Failed to initialize navigation:', error);
    }
  };

  const startLocationTracking = () => {
    NavigationService.startLocationTracking((location) => {
      setCurrentLocation(location);
      updateNavigationInfo(location);
    });
  };

  const updateNavigationInfo = async (location) => {
    // Mettre à jour la distance et le temps restants
    if (steps[currentStep]) {
      const distanceToNextStep = NavigationService.calculateDistance(
        location,
        decode(steps[currentStep].polyline)[0]
      );

      if (distanceToNextStep < 0.05) { // 50 mètres
        setCurrentStep(prev => prev + 1);
      }
    }

    // Vérifier si on est proche de la destination
    const destination = delivery.status === 'accepted'
      ? delivery.pickupLocation
      : delivery.deliveryLocation;

    if (NavigationService.isNearDestination(location, destination)) {
      setShowAlert(true);
    }

    // Recalculer l'itinéraire si on s'écarte trop
    const threshold = 0.1; // 100 mètres
    if (route && NavigationService.calculateDistance(
      location,
      route.coordinates[currentStep]
    ) > threshold) {
      initializeNavigation();
    }
  };

  const handleStartGoogleNavigation = () => {
    const destination = delivery.status === 'accepted'
      ? delivery.pickupLocation
      : delivery.deliveryLocation;
    
    NavigationService.openGoogleMapsNavigation(destination);
  };

  const renderNavigationHeader = () => (
    <Card style={styles.headerCard}>
      <Card.Content>
        <View style={styles.headerRow}>
          <View>
            <Text variant="titleMedium">
              {delivery.status === 'accepted' ? 'Vers le point de collecte' : 'Vers le point de livraison'}
            </Text>
            <Text variant="bodyMedium">
              {estimatedTime.toFixed(0)} min • {remainingDistance.toFixed(1)} km
            </Text>
          </View>
          <IconButton
            icon="google-maps"
            size={24}
            onPress={handleStartGoogleNavigation}
          />
        </View>
      </Card.Content>
    </Card>
  );

  const renderInstructions = () => (
    <Card style={[styles.instructionsCard, !showInstructions && styles.collapsed]}>
      <Card.Content>
        <View style={styles.instructionsHeader}>
          <Text variant="titleMedium">Instructions</Text>
          <IconButton
            icon={showInstructions ? 'chevron-down' : 'chevron-up'}
            onPress={() => setShowInstructions(!showInstructions)}
          />
        </View>
        
        {showInstructions && (
          <List.Section>
            {steps.map((step, index) => (
              <List.Item
                key={index}
                title={<Text style={index === currentStep ? styles.currentStep : null}>
                  {step.instructions.replace(/<[^>]*>/g, '')}
                </Text>}
                description={`${step.distance.toFixed(1)} km • ${step.duration.toFixed(0)} min`}
                left={props => (
                  <View {...props} style={styles.stepNumber}>
                    <Text>{index + 1}</Text>
                  </View>
                )}
                style={index === currentStep ? styles.currentStepItem : null}
              />
            ))}
          </List.Section>
        )}
      </Card.Content>
    </Card>
  );

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
        showsUserLocation
        followsUserLocation
        showsMyLocationButton
        showsCompass
        toolbarEnabled
      >
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title="Ma position"
            pinColor="blue"
          />
        )}
        
        <Marker
          coordinate={delivery.pickupLocation}
          title="Point de collecte"
          pinColor="green"
        />
        
        <Marker
          coordinate={delivery.deliveryLocation}
          title="Point de livraison"
          pinColor="red"
        />

        {route && (
          <Polyline
            coordinates={route.coordinates}
            strokeWidth={3}
            strokeColor="#2196F3"
          />
        )}
      </MapView>

      {renderNavigationHeader()}
      {renderInstructions()}

      <Portal>
        <Modal
          visible={showAlert}
          onDismiss={() => setShowAlert(false)}
          contentContainerStyle={styles.modal}
        >
          <Text variant="titleMedium">
            {delivery.status === 'accepted'
              ? 'Vous êtes arrivé au point de collecte'
              : 'Vous êtes arrivé à destination'
            }
          </Text>
          <Button
            mode="contained"
            onPress={() => {
              setShowAlert(false);
              navigation.goBack();
            }}
            style={styles.modalButton}
          >
            Confirmer l'arrivée
          </Button>
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
  headerCard: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 20,
    left: 20,
    right: 20,
    borderRadius: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  instructionsCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: Dimensions.get('window').height * 0.4,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  collapsed: {
    maxHeight: 80,
  },
  instructionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentStep: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  currentStepItem: {
    backgroundColor: '#e3f2fd',
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButton: {
    marginTop: 16,
  },
});

export default NavigationScreen;
