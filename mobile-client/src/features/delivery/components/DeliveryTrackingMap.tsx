import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DeliveryTrackingInfo } from '../types/delivery.types';
import { getRouteCoordinates } from '../services/maps.service';

interface DeliveryTrackingMapProps {
  trackingInfo: DeliveryTrackingInfo;
  style?: any;
}

export const DeliveryTrackingMap: React.FC<DeliveryTrackingMapProps> = ({
  trackingInfo,
  style,
}) => {
  const mapRef = useRef<MapView>(null);
  const { delivery, currentLocation } = trackingInfo;
  const [routeCoordinates, setRouteCoordinates] = React.useState<any[]>([]);

  useEffect(() => {
    loadRouteCoordinates();
  }, [delivery, currentLocation]);

  useEffect(() => {
    if (mapRef.current && delivery) {
      const coordinates = [
        { latitude: delivery.pickup.latitude, longitude: delivery.pickup.longitude },
        currentLocation || { 
          latitude: delivery.dropoff.latitude, 
          longitude: delivery.dropoff.longitude 
        },
      ];

      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, [delivery, currentLocation]);

  const loadRouteCoordinates = async () => {
    if (!delivery) return;

    try {
      const coordinates = await getRouteCoordinates(
        currentLocation || {
          latitude: delivery.pickup.latitude,
          longitude: delivery.pickup.longitude,
        },
        {
          latitude: delivery.dropoff.latitude,
          longitude: delivery.dropoff.longitude,
        }
      );
      setRouteCoordinates(coordinates);
    } catch (error) {
      console.error('Error loading route coordinates:', error);
    }
  };

  if (!delivery) return null;

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={{
          latitude: delivery.pickup.latitude,
          longitude: delivery.pickup.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {/* Pickup Location Marker */}
        <Marker
          coordinate={{
            latitude: delivery.pickup.latitude,
            longitude: delivery.pickup.longitude,
          }}
        >
          <MaterialCommunityIcons
            name="map-marker"
            size={40}
            color="#4CAF50"
          />
        </Marker>

        {/* Dropoff Location Marker */}
        <Marker
          coordinate={{
            latitude: delivery.dropoff.latitude,
            longitude: delivery.dropoff.longitude,
          }}
        >
          <MaterialCommunityIcons
            name="map-marker-check"
            size={40}
            color="#F44336"
          />
        </Marker>

        {/* Driver Location Marker */}
        {currentLocation && (
          <Marker
            coordinate={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            }}
          >
            <MaterialCommunityIcons
              name="truck-delivery"
              size={40}
              color="#2196F3"
            />
          </Marker>
        )}

        {/* Route Polyline */}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeWidth={3}
            strokeColor="#2196F3"
          />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 300,
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
