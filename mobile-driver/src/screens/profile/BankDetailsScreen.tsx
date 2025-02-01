import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, Card, Portal, Modal, ActivityIndicator } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BankDetailsScreen = ({ navigation }) => {
  const [bankDetails, setBankDetails] = useState({
    iban: '',
    bic: '',
  });
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadBankDetails();
  }, []);

  const loadBankDetails = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${process.env.API_URL}/api/driver/bank-details`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        setBankDetails({
          iban: response.data.iban || '',
          bic: response.data.bic || '',
        });
      }
    } catch (error) {
      console.error('Failed to load bank details:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!bankDetails.iban.trim()) {
      newErrors.iban = "L'IBAN est requis";
    } else if (!isValidIBAN(bankDetails.iban)) {
      newErrors.iban = "L'IBAN n'est pas valide";
    }

    if (!bankDetails.bic.trim()) {
      newErrors.bic = 'Le BIC est requis';
    } else if (!isValidBIC(bankDetails.bic)) {
      newErrors.bic = "Le BIC n'est pas valide";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidIBAN = (iban) => {
    const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/;
    return ibanRegex.test(iban.replace(/\s/g, '').toUpperCase());
  };

  const isValidBIC = (bic) => {
    const bicRegex = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
    return bicRegex.test(bic.replace(/\s/g, '').toUpperCase());
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      
      // Mise à jour dans le backend
      await axios.put(
        `${process.env.API_URL}/api/driver/bank-details`,
        {
          iban: bankDetails.iban.replace(/\s/g, '').toUpperCase(),
          bic: bankDetails.bic.toUpperCase(),
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Notification de succès
      setShowConfirmModal(false);
      navigation.goBack();
    } catch (error) {
      console.error('Failed to update bank details:', error);
      // Gérer l'erreur et afficher un message à l'utilisateur
    } finally {
      setLoading(false);
    }
  };

  const formatIBAN = (iban) => {
    return iban.replace(/\s/g, '').match(/.{1,4}/g)?.join(' ') || iban;
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.title}>
            Informations bancaires
          </Text>

          <TextInput
            label="IBAN"
            value={bankDetails.iban}
            onChangeText={(text) => {
              const formattedIBAN = formatIBAN(text);
              setBankDetails(prev => ({ ...prev, iban: formattedIBAN }));
            }}
            style={styles.input}
            error={!!errors.iban}
            helperText={errors.iban}
            autoCapitalize="characters"
          />

          <TextInput
            label="BIC/SWIFT"
            value={bankDetails.bic}
            onChangeText={(text) =>
              setBankDetails(prev => ({ ...prev, bic: text.toUpperCase() }))
            }
            style={styles.input}
            error={!!errors.bic}
            helperText={errors.bic}
            autoCapitalize="characters"
          />

          <Text variant="bodySmall" style={styles.note}>
            Ces informations sont nécessaires pour recevoir vos gains.
            Vos informations bancaires sont sécurisées et cryptées.
          </Text>

          <Button
            mode="contained"
            onPress={() => setShowConfirmModal(true)}
            style={styles.submitButton}
            loading={loading}
          >
            Enregistrer
          </Button>
        </Card.Content>
      </Card>

      <Portal>
        <Modal
          visible={showConfirmModal}
          onDismiss={() => setShowConfirmModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Text variant="titleMedium" style={styles.modalTitle}>
            Confirmer les informations
          </Text>
          
          <View style={styles.confirmationDetails}>
            <Text>IBAN: {bankDetails.iban}</Text>
            <Text>BIC: {bankDetails.bic}</Text>
          </View>

          <Text style={styles.modalNote}>
            Veuillez vérifier que ces informations sont correctes.
            Les paiements seront envoyés à ce compte bancaire.
          </Text>

          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setShowConfirmModal(false)}
              style={styles.modalButton}
            >
              Modifier
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.modalButton}
            >
              Confirmer
            </Button>
          </View>
        </Modal>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
  },
  title: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
  },
  note: {
    color: '#666',
    marginTop: 8,
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 8,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  confirmationDetails: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  modalNote: {
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default BankDetailsScreen;
