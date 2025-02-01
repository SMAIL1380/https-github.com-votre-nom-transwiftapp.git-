import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Dimensions } from 'react-native';
import { Text, Card, Button, Switch, useTheme } from 'react-native-paper';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import { useDispatch, useSelector } from 'react-redux';
import { updateDriverStatus, fetchAvailableDeliveries } from '../../store/slices/deliverySlice';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [isOnline, setIsOnline] = useState(false);
  const [location, setLocation] = useState(null);
  const deliveries = useSelector(state => state.delivery.availableDeliveries);

  useEffect(() => {
    requestLocationPermission();
    if (isOnline) {
      startLocationUpdates();
      dispatch(fetchAvailableDeliveries());
    }
  }, [isOnline]);

  const requestLocationPermission = async () => {
    try {
      const granted = await Geolocation.requestAuthorization('whenInUse');
      if (granted === 'granted') {
        getCurrentLocation();
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      },
      (error) => console.log(error),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const startLocationUpdates = () => {
    Geolocation.watchPosition(
      (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        setLocation(newLocation);
        // Update location on server
        dispatch(updateDriverLocation(newLocation));
      },
      (error) => console.log(error),
      { enableHighAccuracy: true, distanceFilter: 100 }
    );
  };

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
    dispatch(updateDriverStatus(!isOnline));
  };

  const renderDeliveryItem = ({ item }) => (
    <Card style={styles.deliveryCard}>
      <Card.Content>
        <Text variant="titleMedium">{item.pickupAddress}</Text>
        <Text variant="bodyMedium">→ {item.dropoffAddress}</Text>
        <Text variant="bodyMedium">Distance: {item.distance} km</Text>
        <Text variant="titleMedium" style={styles.price}>{item.price} €</Text>
      </Card.Content>
      <Card.Actions>
        <Button onPress={() => navigation.navigate('DeliveryDetails', { delivery: item })}>
          Voir détails
        </Button>
        <Button mode="contained" onPress={() => dispatch(acceptDelivery(item.id))}>
          Accepter
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      {location && (
        <MapView
          style={styles.map}
          initialRegion={location}
          showsUserLocation={true}
          followsUserLocation={true}
        >
          {deliveries.map((delivery) => (
            <Marker
              key={delivery.id}
              coordinate={{
                latitude: delivery.pickupLatitude,
                longitude: delivery.pickupLongitude,
              }}
              title={delivery.pickupAddress}
              description={`${delivery.price} €`}
            />
          ))}
        </MapView>
      )}

      <View style={styles.statusBar}>
        <Text variant="titleMedium">
          Status: {isOnline ? 'En ligne' : 'Hors ligne'}
        </Text>
        <Switch value={isOnline} onValueChange={toggleOnlineStatus} />
      </View>

      <FlatList
        data={deliveries}
        renderItem={renderDeliveryItem}
        keyExtractor={(item) => item.id}
        style={styles.deliveryList}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    height: 300,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  deliveryList: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  deliveryCard: {
    marginBottom: 16,
    width: width - 32,
  },
  price: {
    marginTop: 8,
    color: 'green',
  },
});

export default HomeScreen;
