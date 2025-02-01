import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

class PaymentService {
  private baseURL: string;
  private stripe: any;

  constructor() {
    this.baseURL = process.env.API_URL;
    // Initialize Stripe
    this.initializeStripe();
  }

  private async initializeStripe() {
    try {
      const publishableKey = await AsyncStorage.getItem('stripe_publishable_key');
      if (publishableKey) {
        this.stripe = await import('@stripe/stripe-react-native').then(
          ({ initStripe }) => initStripe({ publishableKey })
        );
      }
    } catch (error) {
      console.error('Failed to initialize Stripe:', error);
    }
  }

  // Récupérer le solde du compte
  async getBalance(): Promise<{ available: number; pending: number }> {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${this.baseURL}/api/driver/balance`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get balance:', error);
      throw error;
    }
  }

  // Récupérer l'historique des paiements
  async getPaymentHistory(page: number = 1, limit: number = 20): Promise<any> {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(
        `${this.baseURL}/api/driver/payments/history?page=${page}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get payment history:', error);
      throw error;
    }
  }

  // Configurer le compte bancaire
  async setupBankAccount(bankDetails: {
    accountHolderName: string;
    iban: string;
    bic: string;
  }): Promise<any> {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(
        `${this.baseURL}/api/driver/bank-account`,
        bankDetails,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to setup bank account:', error);
      throw error;
    }
  }

  // Vérifier le statut du compte bancaire
  async getBankAccountStatus(): Promise<any> {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${this.baseURL}/api/driver/bank-account/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get bank account status:', error);
      throw error;
    }
  }

  // Demander un retrait
  async requestWithdrawal(amount: number): Promise<any> {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.post(
        `${this.baseURL}/api/driver/withdrawal`,
        { amount },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to request withdrawal:', error);
      throw error;
    }
  }

  // Récupérer l'historique des retraits
  async getWithdrawalHistory(page: number = 1, limit: number = 20): Promise<any> {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(
        `${this.baseURL}/api/driver/withdrawals?page=${page}&limit=${limit}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get withdrawal history:', error);
      throw error;
    }
  }

  // Générer un reçu pour une livraison
  async generateDeliveryReceipt(deliveryId: string): Promise<any> {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(
        `${this.baseURL}/api/driver/delivery/${deliveryId}/receipt`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to generate receipt:', error);
      throw error;
    }
  }

  // Vérifier les paiements en attente
  async checkPendingPayments(): Promise<any> {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${this.baseURL}/api/driver/payments/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to check pending payments:', error);
      throw error;
    }
  }

  // Configurer les préférences de paiement
  async updatePaymentPreferences(preferences: {
    automaticWithdrawal: boolean;
    minimumWithdrawalAmount: number;
    preferredWithdrawalDay: number;
  }): Promise<any> {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.put(
        `${this.baseURL}/api/driver/payment-preferences`,
        preferences,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to update payment preferences:', error);
      throw error;
    }
  }

  // Générer un rapport fiscal
  async generateTaxReport(year: number): Promise<any> {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(
        `${this.baseURL}/api/driver/tax-report/${year}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to generate tax report:', error);
      throw error;
    }
  }
}

export default new PaymentService();
