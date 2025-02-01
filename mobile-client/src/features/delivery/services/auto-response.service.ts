import { DeliveryStatus } from '../types/delivery.types';
import { ChatMessage } from '../types/chat.types';

interface AutoResponseRule {
  keywords: string[];
  response: string | ((params: any) => string);
  priority: number;
}

export class AutoResponseService {
  private static readonly rules: AutoResponseRule[] = [
    // Questions sur la livraison
    {
      keywords: ['où', 'position', 'localisation', 'emplacement', 'où est'],
      response: (delivery: any) => 
        `Votre colis est actuellement ${
          delivery.status === 'picked_up' 
            ? 'en cours de récupération' 
            : delivery.status === 'in_transit'
            ? 'en transit vers sa destination'
            : 'en attente de prise en charge'
        }. Notre équipe surveille activement sa progression.`,
      priority: 1,
    },
    {
      keywords: ['quand', 'heure', 'arrivée', 'délai', 'eta'],
      response: (delivery: any) => 
        `D'après nos estimations, ${
          delivery.eta 
            ? `votre livraison devrait arriver dans environ ${Math.round(delivery.eta / 60)} minutes`
            : 'nous calculons actuellement le temps d\'arrivée estimé'
        }. Nous vous tiendrons informé de tout changement.`,
      priority: 1,
    },
    {
      keywords: ['annuler', 'annulation', 'cancel'],
      response: 'Pour annuler votre livraison, veuillez utiliser le bouton "Annuler" en haut de l\'écran. Notre équipe traitera votre demande dans les plus brefs délais.',
      priority: 2,
    },

    // Questions sur le paiement
    {
      keywords: ['paiement', 'payer', 'facture', 'reçu', 'prix'],
      response: 'Toutes les informations concernant votre paiement sont disponibles dans la section "Détails de la commande". Pour toute question spécifique sur la facturation, notre service client est à votre disposition.',
      priority: 2,
    },

    // Questions sur le service
    {
      keywords: ['problème', 'erreur', 'plainte', 'réclamation'],
      response: 'Nous prenons votre demande très au sérieux. Un agent de notre service client va examiner votre situation et vous répondra dans les plus brefs délais. Pour accélérer le traitement, pourriez-vous nous donner plus de détails sur votre préoccupation ?',
      priority: 3,
    },
    {
      keywords: ['contact', 'téléphone', 'numéro', 'email', 'joindre'],
      response: 'Vous pouvez contacter notre service client 24h/24 et 7j/7 via ce chat. Pour une assistance urgente, appelez le 0800-TRANSWIFT. Votre satisfaction est notre priorité.',
      priority: 2,
    },

    // Questions sur la sécurité
    {
      keywords: ['assurance', 'garantie', 'protection', 'sécurité'],
      response: 'Tous les colis transportés par Transwift sont assurés jusqu\'à 500€. Pour une couverture supplémentaire ou des questions spécifiques sur notre politique d\'assurance, notre service client est à votre disposition.',
      priority: 2,
    },

    // Questions sur le chauffeur
    {
      keywords: ['chauffeur', 'livreur', 'transporteur'],
      response: 'Nos chauffeurs partenaires sont soigneusement sélectionnés et suivis par Transwift. Pour votre sécurité et confidentialité, toutes les communications passent par notre service client qui coordonne la livraison.',
      priority: 2,
    },

    // Instructions spéciales
    {
      keywords: ['instruction', 'spécial', 'particulier', 'demande'],
      response: 'Nous avons bien noté votre demande spéciale. Notre équipe va la transmettre au chauffeur en charge de votre livraison. Nous vous tiendrons informé de la prise en compte de vos instructions.',
      priority: 2,
    },
  ];

  private static readonly statusMessages: Record<DeliveryStatus, string> = {
    pending: 'Votre demande de livraison a été reçue et est en cours de traitement par notre équipe.',
    accepted: 'Un chauffeur partenaire a été assigné à votre livraison. La récupération est en cours d\'organisation.',
    picked_up: 'Votre colis a été récupéré et est en route vers sa destination.',
    in_transit: 'Votre colis est en cours de transport. Notre équipe suit sa progression en temps réel.',
    delivered: 'Votre colis a été livré avec succès. Merci de votre confiance !',
    cancelled: 'Votre livraison a été annulée. Pour toute question, notre service client reste à votre disposition.',
  };

  static getStatusMessage(status: DeliveryStatus): string {
    return this.statusMessages[status] || '';
  }

  static analyzeMessage(message: string, deliveryData: any): string | null {
    const normalizedMessage = message.toLowerCase().trim();

    // Trier les règles par priorité
    const sortedRules = [...this.rules].sort((a, b) => a.priority - b.priority);

    for (const rule of sortedRules) {
      if (rule.keywords.some(keyword => normalizedMessage.includes(keyword.toLowerCase()))) {
        return typeof rule.response === 'function' 
          ? rule.response(deliveryData)
          : rule.response;
      }
    }

    return null;
  }

  static generateAutoResponse(userMessage: string, deliveryData: any): ChatMessage | null {
    const response = this.analyzeMessage(userMessage, deliveryData);
    
    if (!response) return null;

    return {
      id: `auto_${Date.now()}`,
      deliveryId: deliveryData.id,
      senderId: 'system',
      senderType: 'support',
      content: response,
      timestamp: new Date().toISOString(),
      status: 'delivered',
      isAutomated: true,
    };
  }
}
