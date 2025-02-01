import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import TrackingService from '../../services/tracking.service';

interface LiveMapProps {
  deliveryId: string;
  pickupLocation: {
    latitude: number;
    longitude: number;
  };
  deliveryLocation: {
    latitude: number;
    longitude: number;
  };
  onLocationUpdate?: (location: any) => void;
}

const LiveMap = ({
  deliveryId,
  pickupLocation,
  deliveryLocation,
  onLocationUpdate,
}: LiveMapProps) => {
  const theme = useTheme();
  const mapRef = useRef<MapView>(null);
  const [driverLocation, setDriverLocation] = useState<any>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<any[]>([]);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const setupTracking = async () => {
      try {
        // S'abonner aux mises à jour de la livraison
        unsubscribe = TrackingService.subscribeToDeliveryUpdates(
          deliveryId,
          (update) => {
            setDriverLocation(update.location);
            setRouteCoordinates((prev) => [...prev, update.location]);
            
            if (onLocationUpdate) {
              onLocationUpdate(update);
            }

            // Centrer la carte sur la nouvelle position
            if (mapRef.current) {
              mapRef.current.animateCamera({
                center: {
                  latitude: update.location.latitude,
                  longitude: update.location.longitude,
                },
              });
            }
          }
        );

        // Obtenir la position initiale
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          setDriverLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      } catch (error) {
        console.error('Error setting up tracking:', error);
      }
    };

    setupTracking();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [deliveryId]);

  const fitToMarkers = () => {
    if (mapRef.current) {
      mapRef.current.fitToCoordinates(
        [
          pickupLocation,
          deliveryLocation,
          ...(driverLocation ? [driverLocation] : []),
        ],
        {
          edgePadding: {
            top: 50,
            right: 50,
            bottom: 50,
            left: 50,
          },
          animated: true,
        }
      );
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        onLayout={fitToMarkers}
        showsUserLocation
        showsMyLocationButton
        showsCompass
      >
        {/* Point de départ */}
        <Marker
          coordinate={pickupLocation}
          pinColor={theme.colors.primary}
          title="Point de retrait"
        >
          <MaterialCommunityIcons
            name="map-marker"
            size={36}
            color={theme.colors.primary}
          />
        </Marker>

        {/* Point d'arrivée */}
        <Marker
          coordinate={deliveryLocation}
          pinColor={theme.colors.accent}
          title="Point de livraison"
        >
          <MaterialCommunityIcons
            name="flag-checkered"
            size={36}
            color={theme.colors.accent}
          />
        </Marker>

        {/* Position du chauffeur */}
        {driverLocation && (
          <Marker
            coordinate={driverLocation}
            title="Position actuelle"
          >
            <View style={styles.driverMarker}>
              <MaterialCommunityIcons
                name="truck-delivery"
                size={24}
                color="white"
              />
            </View>
          </Marker>
        )}

        {/* Tracé du parcours */}
        {routeCoordinates.length > 1 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor={theme.colors.primary}
            strokeWidth={3}
          />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  driverMarker: {
    backgroundColor: '#2196F3',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
  },
});

export default LiveMap;
