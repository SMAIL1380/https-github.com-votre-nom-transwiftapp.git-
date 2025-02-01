import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, Button, Portal, Modal, TextInput, List, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import PaymentService from '../../services/PaymentService';

const PaymentDashboardScreen = ({ navigation }) => {
  const theme = useTheme();
  const [balance, setBalance] = useState({ available: 0, pending: 0 });
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [bankAccount, setBankAccount] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [balanceData, bankData, transactions] = await Promise.all([
        PaymentService.getBalance(),
        PaymentService.getBankAccountStatus(),
        PaymentService.getPaymentHistory(1, 5)
      ]);

      setBalance(balanceData);
      setBankAccount(bankData);
      setRecentTransactions(transactions.items);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleWithdrawal = async () => {
    try {
      setLoading(true);
      await PaymentService.requestWithdrawal(Number(withdrawalAmount));
      setShowWithdrawalModal(false);
      loadDashboardData();
    } catch (error) {
      console.error('Withdrawal failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} €`;
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <Card style={styles.balanceCard}>
        <Card.Content>
          <Text variant="titleMedium">Solde disponible</Text>
          <Text variant="headlineLarge" style={styles.balance}>
            {formatCurrency(balance.available)}
          </Text>
          <Text variant="bodyMedium" style={styles.pendingText}>
            En attente: {formatCurrency(balance.pending)}
          </Text>

          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              onPress={() => setShowWithdrawalModal(true)}
              disabled={balance.available <= 0}
              style={styles.button}
            >
              Retirer
            </Button>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('PaymentHistory')}
              style={styles.button}
            >
              Historique
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.bankCard}>
        <Card.Content>
          <View style={styles.bankHeader}>
            <Text variant="titleMedium">Compte bancaire</Text>
            {bankAccount ? (
              <Icon name="check-circle" size={24} color="green" />
            ) : (
              <Icon name="alert-circle" size={24} color="orange" />
            )}
          </View>

          {bankAccount ? (
            <View>
              <Text variant="bodyMedium">IBAN: ****{bankAccount.iban.slice(-4)}</Text>
              <Button
                mode="text"
                onPress={() => navigation.navigate('BankAccount')}
              >
                Modifier
              </Button>
            </View>
          ) : (
            <Button
              mode="contained-tonal"
              onPress={() => navigation.navigate('BankAccount')}
              style={styles.setupButton}
            >
              Configurer le compte bancaire
            </Button>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.transactionsCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Transactions récentes
          </Text>
          {recentTransactions.map((transaction, index) => (
            <List.Item
              key={transaction.id}
              title={transaction.description}
              description={new Date(transaction.date).toLocaleDateString()}
              right={() => (
                <Text
                  style={{
                    color: transaction.type === 'credit' ? 'green' : 'red',
                  }}
                >
                  {transaction.type === 'credit' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </Text>
              )}
            />
          ))}
          <Button
            mode="text"
            onPress={() => navigation.navigate('PaymentHistory')}
          >
            Voir tout l'historique
          </Button>
        </Card.Content>
      </Card>

      <Portal>
        <Modal
          visible={showWithdrawalModal}
          onDismiss={() => setShowWithdrawalModal(false)}
          contentContainerStyle={styles.modal}
        >
          <Text variant="titleLarge" style={styles.modalTitle}>
            Retrait
          </Text>
          <TextInput
            label="Montant"
            value={withdrawalAmount}
            onChangeText={setWithdrawalAmount}
            keyboardType="numeric"
            style={styles.input}
            right={<TextInput.Affix text="€" />}
          />
          <Text variant="bodySmall" style={styles.modalNote}>
            Montant minimum: 50€
          </Text>
          <View style={styles.modalButtons}>
            <Button
              mode="outlined"
              onPress={() => setShowWithdrawalModal(false)}
              style={styles.modalButton}
            >
              Annuler
            </Button>
            <Button
              mode="contained"
              onPress={handleWithdrawal}
              disabled={Number(withdrawalAmount) < 50 || Number(withdrawalAmount) > balance.available}
              loading={loading}
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
  balanceCard: {
    margin: 16,
    marginBottom: 8,
  },
  balance: {
    marginVertical: 8,
    color: 'green',
  },
  pendingText: {
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  bankCard: {
    margin: 16,
    marginVertical: 8,
  },
  bankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  setupButton: {
    marginTop: 8,
  },
  transactionsCard: {
    margin: 16,
    marginVertical: 8,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 12,
  },
  modalNote: {
    color: '#666',
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

export default PaymentDashboardScreen;
