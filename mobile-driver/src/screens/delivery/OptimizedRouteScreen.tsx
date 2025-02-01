import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, Card, List, IconButton, Portal, Modal, Button } from 'react-native-paper';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from 'react-redux';
import NavigationService from '../../services/NavigationService';
import { decode } from '@mapbox/polyline';

const OptimizedRouteScreen = ({ route, navigation }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [optimizedRoute, setOptimizedRoute] = useState(null);
  const [selectedStop, setSelectedStop] = useState(null);
  const [showStopDetails, setShowStopDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);

  const { deliveries } = route.params;

  useEffect(() => {
    initializeRoute();
    startLocationTracking();

    return () => {
      NavigationService.stopLocationTracking();
    };
  }, []);

  const initializeRoute = async () => {
    try {
      setLoading(true);
      const location = await NavigationService.getCurrentLocation();
      setCurrentLocation(location);

      const response = await api.post('/api/routing/optimize', {
        driverId: user.id,
        startLocation: location,
        deliveries: deliveries.map(delivery => ({
          id: delivery.id,
          pickupLocation: delivery.pickupLocation,
          deliveryLocation: delivery.deliveryLocation,
          timeWindow: delivery.timeWindow,
          priority: delivery.priority,
        })),
      });

      setOptimizedRoute(response.data);
      
      // Ajuster la vue de la carte pour montrer tout l'itinéraire
      if (mapRef.current) {
        const coordinates = decode(response.data.polyline).map(([lat, lng]) => ({
          latitude: lat,
          longitude: lng,
        }));
        
        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }
    } catch (error) {
      console.error('Failed to initialize route:', error);
    } finally {
      setLoading(false);
    }
  };

  const startLocationTracking = () => {
    NavigationService.startLocationTracking((location) => {
      setCurrentLocation(location);
    });
  };

  const handleStopPress = (stop) => {
    setSelectedStop(stop);
    setShowStopDetails(true);
  };

  const handleNavigateToStop = () => {
    if (selectedStop) {
      NavigationService.openGoogleMapsNavigation(selectedStop.location);
    }
  };

  const renderStopMarker = (stop, index) => (
    <Marker
      key={`${stop.deliveryId}-${stop.type}`}
      coordinate={stop.location}
      title={`${stop.type === 'pickup' ? 'Collecte' : 'Livraison'} #${index + 1}`}
      description={`Arrivée estimée: ${new Date(stop.estimatedArrival).toLocaleTimeString()}`}
      pinColor={stop.type === 'pickup' ? 'green' : 'red'}
      onPress={() => handleStopPress(stop)}
    />
  );

  const renderStopDetails = () => (
    <Portal>
      <Modal
        visible={showStopDetails}
        onDismiss={() => setShowStopDetails(false)}
        contentContainerStyle={styles.modal}
      >
        {selectedStop && (
          <>
            <Text variant="titleLarge">
              {selectedStop.type === 'pickup' ? 'Point de collecte' : 'Point de livraison'}
            </Text>
            
            <Card style={styles.detailsCard}>
              <Card.Content>
                <Text variant="titleMedium">Horaires estimés</Text>
                <Text>Arrivée: {new Date(selectedStop.estimatedArrival).toLocaleTimeString()}</Text>
                <Text>Départ: {new Date(selectedStop.estimatedDeparture).toLocaleTimeString()}</Text>
              </Card.Content>
            </Card>

            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                onPress={handleNavigateToStop}
                style={styles.button}
                icon="navigation"
              >
                Naviguer
              </Button>
              
              <Button
                mode="outlined"
                onPress={() => setShowStopDetails(false)}
                style={styles.button}
              >
                Fermer
              </Button>
            </View>
          </>
        )}
      </Modal>
    </Portal>
  );

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        showsUserLocation
        followsUserLocation
        showsMyLocationButton
        showsCompass
      >
        {currentLocation && (
          <Marker
            coordinate={currentLocation}
            title="Ma position"
            pinColor="blue"
          />
        )}
        
        {optimizedRoute?.stops.map((stop, index) => renderStopMarker(stop, index))}

        {optimizedRoute?.polyline && (
          <Polyline
            coordinates={decode(optimizedRoute.polyline).map(([lat, lng]) => ({
              latitude: lat,
              longitude: lng,
            }))}
            strokeWidth={3}
            strokeColor="#2196F3"
          />
        )}
      </MapView>

      <Card style={styles.summaryCard}>
        <Card.Content>
          <View style={styles.summaryRow}>
            <View>
              <Text variant="titleMedium">Route optimisée</Text>
              <Text variant="bodyMedium">
                {optimizedRoute?.stops.length} arrêts • {(optimizedRoute?.totalDistance / 1000).toFixed(1)} km
              </Text>
            </View>
            <IconButton
              icon="refresh"
              onPress={initializeRoute}
              disabled={loading}
            />
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.stopsCard}>
        <Card.Content>
          <List.Section>
            <List.Subheader>Liste des arrêts</List.Subheader>
            {optimizedRoute?.stops.map((stop, index) => (
              <List.Item
                key={`${stop.deliveryId}-${stop.type}`}
                title={`${stop.type === 'pickup' ? 'Collecte' : 'Livraison'} #${index + 1}`}
                description={`Arrivée: ${new Date(stop.estimatedArrival).toLocaleTimeString()}`}
                left={props => (
                  <List.Icon
                    {...props}
                    icon={stop.type === 'pickup' ? 'package-up' : 'package-down'}
                    color={stop.type === 'pickup' ? 'green' : 'red'}
                  />
                )}
                onPress={() => handleStopPress(stop)}
              />
            ))}
          </List.Section>
        </Card.Content>
      </Card>

      {renderStopDetails()}
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
  summaryCard: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    borderRadius: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stopsCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: Dimensions.get('window').height * 0.4,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  detailsCard: {
    marginVertical: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default OptimizedRouteScreen;
