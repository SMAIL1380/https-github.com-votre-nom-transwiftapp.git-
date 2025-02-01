import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, Card, Portal, Modal, ActivityIndicator } from 'react-native-paper';
import PaymentService from '../../services/PaymentService';

const BankAccountScreen = ({ navigation }) => {
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: '',
    iban: '',
    bic: '',
  });
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadBankAccount();
  }, []);

  const loadBankAccount = async () => {
    try {
      setLoading(true);
      const account = await PaymentService.getBankAccountStatus();
      if (account) {
        setCurrentAccount(account);
        setBankDetails({
          accountHolderName: account.accountHolderName,
          iban: account.iban,
          bic: account.bic,
        });
      }
    } catch (error) {
      console.error('Failed to load bank account:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!bankDetails.accountHolderName.trim()) {
      newErrors.accountHolderName = 'Le nom du titulaire est requis';
    }

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
    // Implémentation basique de la validation IBAN
    const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/;
    return ibanRegex.test(iban.replace(/\s/g, '').toUpperCase());
  };

  const isValidBIC = (bic) => {
    // Implémentation basique de la validation BIC
    const bicRegex = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
    return bicRegex.test(bic.replace(/\s/g, '').toUpperCase());
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      await PaymentService.setupBankAccount(bankDetails);
      navigation.goBack();
    } catch (error) {
      console.error('Failed to setup bank account:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatIBAN = (iban) => {
    // Format IBAN with spaces every 4 characters
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
            label="Nom du titulaire"
            value={bankDetails.accountHolderName}
            onChangeText={(text) =>
              setBankDetails((prev) => ({ ...prev, accountHolderName: text }))
            }
            style={styles.input}
            error={!!errors.accountHolderName}
            helperText={errors.accountHolderName}
          />

          <TextInput
            label="IBAN"
            value={bankDetails.iban}
            onChangeText={(text) => {
              const formattedIBAN = formatIBAN(text);
              setBankDetails((prev) => ({ ...prev, iban: formattedIBAN }));
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
              setBankDetails((prev) => ({ ...prev, bic: text.toUpperCase() }))
            }
            style={styles.input}
            error={!!errors.bic}
            helperText={errors.bic}
            autoCapitalize="characters"
          />

          <Text variant="bodySmall" style={styles.note}>
            Vos informations bancaires sont sécurisées et cryptées.
          </Text>

          <Button
            mode="contained"
            onPress={() => setShowConfirmModal(true)}
            style={styles.submitButton}
            loading={loading}
          >
            {currentAccount ? 'Mettre à jour' : 'Enregistrer'}
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
            <Text>Titulaire: {bankDetails.accountHolderName}</Text>
            <Text>IBAN: {bankDetails.iban}</Text>
            <Text>BIC: {bankDetails.bic}</Text>
          </View>

          <Text style={styles.modalNote}>
            Veuillez vérifier que ces informations sont correctes.
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

      {loading && (
        <Portal>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
          </View>
        </Portal>
      )}
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
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BankAccountScreen;
