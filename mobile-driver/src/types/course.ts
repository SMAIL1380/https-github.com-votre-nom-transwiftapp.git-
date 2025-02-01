export interface Course {
  id: string;
  clientName: string;
  pickupAddress: string;
  deliveryAddress: string;
  status: 'en_attente' | 'en_cours' | 'terminée';
  scheduledTime: string;
}
