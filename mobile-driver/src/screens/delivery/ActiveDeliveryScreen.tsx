import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  useTheme,
  Portal,
  Dialog,
  TextInput,
  ProgressBar,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import TrackingService from '../../services/tracking.service';
import { updateDeliveryStatus } from '../../services/delivery.service';
import { formatDateTime, formatDistance } from '../../utils/formatters';
import LiveMap from '../../components/tracking/LiveMap';

const ActiveDeliveryScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { delivery } = route.params;

  const [currentStep, setCurrentStep] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [comment, setComment] = useState('');
  const [signature, setSignature] = useState(null);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    startTracking();
    return () => {
      stopTracking();
    };
  }, []);

  const startTracking = async () => {
    try {
      await TrackingService.startTracking(delivery.id);
      setIsTracking(true);
    } catch (error) {
      console.error('Error starting tracking:', error);
    }
  };

  const stopTracking = () => {
    TrackingService.stopTracking();
    setIsTracking(false);
  };

  const steps = [
    {
      title: 'En route vers le point de retrait',
      icon: 'truck-fast',
      action: () => handleArrivalAtPickup(),
    },
    {
      title: 'Récupération du colis',
      icon: 'package-variant-closed',
      action: () => handlePackagePickup(),
    },
    {
      title: 'En route vers la livraison',
      icon: 'truck-delivery',
      action: () => handleArrivalAtDelivery(),
    },
    {
      title: 'Livraison du colis',
      icon: 'package-variant',
      action: () => handleDeliveryComplete(),
    },
  ];

  const handleArrivalAtPickup = async () => {
    try {
      await updateDeliveryStatus(delivery.id, 'ARRIVED_AT_PICKUP');
      setCurrentStep(1);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handlePackagePickup = async () => {
    try {
      await updateDeliveryStatus(delivery.id, 'PACKAGE_PICKED_UP');
      setCurrentStep(2);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleArrivalAtDelivery = async () => {
    try {
      await updateDeliveryStatus(delivery.id, 'ARRIVED_AT_DELIVERY');
      setCurrentStep(3);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDeliveryComplete = () => {
    setConfirmDialog(true);
  };

  const completeDelivery = async () => {
    try {
      await updateDeliveryStatus(delivery.id, 'COMPLETED', {
        comment,
        signature,
      });
      stopTracking();
      navigation.navigate('DeliveryComplete', { deliveryId: delivery.id });
    } catch (error) {
      console.error('Error completing delivery:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Live Map */}
      <View style={styles.mapContainer}>
        <LiveMap
          deliveryId={delivery.id}
          pickupLocation={delivery.pickupCoordinates}
          deliveryLocation={delivery.deliveryCoordinates}
        />
      </View>

      {/* Progress Indicator */}
      <Card style={styles.progressCard}>
        <Card.Content>
          <ProgressBar
            progress={(currentStep + 1) / steps.length}
            color={theme.colors.primary}
            style={styles.progressBar}
          />
          <View style={styles.stepsContainer}>
            {steps.map((step, index) => (
              <View
                key={index}
                style={[
                  styles.step,
                  index === currentStep && styles.currentStep,
                  index < currentStep && styles.completedStep,
                ]}
              >
                <MaterialCommunityIcons
                  name={step.icon}
                  size={24}
                  color={
                    index <= currentStep
                      ? theme.colors.primary
                      : theme.colors.disabled
                  }
                />
                <Text
                  style={[
                    styles.stepText,
                    index <= currentStep && styles.activeStepText,
                  ]}
                >
                  {step.title}
                </Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Action Button */}
      <View style={styles.actionContainer}>
        <Button
          mode="contained"
          onPress={steps[currentStep].action}
          style={styles.actionButton}
        >
          {steps[currentStep].title}
        </Button>
      </View>

      {/* Completion Dialog */}
      <Portal>
        <Dialog visible={confirmDialog} onDismiss={() => setConfirmDialog(false)}>
          <Dialog.Title>Confirmer la livraison</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Commentaire"
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={3}
              style={styles.commentInput}
            />
            {/* Signature component would go here */}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmDialog(false)}>Annuler</Button>
            <Button onPress={completeDelivery}>Confirmer</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  mapContainer: {
    flex: 1,
  },
  progressCard: {
    margin: 16,
    elevation: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 16,
  },
  stepsContainer: {
    marginTop: 8,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    opacity: 0.5,
  },
  currentStep: {
    opacity: 1,
  },
  completedStep: {
    opacity: 1,
  },
  stepText: {
    marginLeft: 12,
    fontSize: 14,
  },
  activeStepText: {
    fontWeight: 'bold',
  },
  actionContainer: {
    padding: 16,
    backgroundColor: 'white',
    elevation: 8,
  },
  actionButton: {
    paddingVertical: 8,
  },
  commentInput: {
    marginBottom: 16,
  },
});

export default ActiveDeliveryScreen;
