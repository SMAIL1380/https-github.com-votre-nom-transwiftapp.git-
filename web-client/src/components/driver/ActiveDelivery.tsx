'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  CameraIcon,
  CheckCircleIcon,
  PencilIcon,
  TrophyIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import NavigationMap from './NavigationMap';
import { useGeolocation } from '@/hooks/useGeolocation';
import SignaturePad from '../delivery/SignaturePad';
import ChatButton from '../chat/ChatButton';
import DeliveryRating from '../rating/DeliveryRating';
import DeliveryPredictions from '../analytics/DeliveryPredictions';
import VirtualAssistant from '../assistant/VirtualAssistant';
import RewardsCenter from '../rewards/RewardsCenter';
import RewardNotification from '../rewards/RewardNotification';

interface Location {
  lat: number;
  lng: number;
}

interface Delivery {
  id: string;
  status: string;
  pickupAddress: string;
  deliveryAddress: string;
  pickupLocation: Location;
  deliveryLocation: Location;
  customer: {
    name: string;
    phone: string;
    id: string;
  };
  scheduledDate: string;
  description?: string;
  driverId: string;
}

interface ActiveDeliveryProps {
  delivery: Delivery;
}

export default function ActiveDelivery({ delivery }: ActiveDeliveryProps) {
  const [currentStatus, setCurrentStatus] = useState(delivery.status);
  const [isUploading, setIsUploading] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [rewardNotification, setRewardNotification] = useState<{
    id: string;
    type: 'badge' | 'challenge' | 'level';
    title: string;
    description: string;
    xp?: number;
  } | null>(null);
  const { location: currentLocation, error: locationError } = useGeolocation();

  const updateDeliveryStatus = async (newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:3000/driver/deliveries/${delivery.id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du statut');
      }

      setCurrentStatus(newStatus);
      toast.success('Statut mis à jour avec succès');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du statut');
      console.error('Erreur:', error);
    }
  };

  const uploadPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const response = await fetch(`http://localhost:3000/driver/deliveries/${delivery.id}/photo`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'upload de la photo');
      }

      toast.success('Photo uploadée avec succès');
    } catch (error) {
      toast.error('Erreur lors de l\'upload de la photo');
      console.error('Erreur:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleLocationUpdate = async (location: Location) => {
    try {
      await fetch(`http://localhost:3000/driver/deliveries/${delivery.id}/location`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ location }),
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la position:', error);
    }
  };

  const handleSignatureSave = async (signatureData: string) => {
    try {
      const response = await fetch(`http://localhost:3000/driver/deliveries/${delivery.id}/signature`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ signature: signatureData }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'enregistrement de la signature');
      }

      toast.success('Signature enregistrée avec succès');
      setShowSignaturePad(false);
      updateDeliveryStatus('delivered');
      setShowRating(true);
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement de la signature');
      console.error('Erreur:', error);
    }
  };

  if (locationError) {
    toast.error(locationError);
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* Carte de navigation */}
      <div className="h-[400px] mb-6">
        <NavigationMap
          pickupLocation={delivery.pickupLocation}
          deliveryLocation={delivery.deliveryLocation}
          onLocationUpdate={handleLocationUpdate}
        />
      </div>

      {/* Prédictions de livraison */}
      <div className="mb-6">
        <DeliveryPredictions
          deliveryId={delivery.id}
          currentLocation={currentLocation || delivery.pickupLocation}
          destination={delivery.deliveryLocation}
        />
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Livraison #{delivery.id.slice(-6)}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {format(new Date(delivery.scheduledDate), 'PPp', { locale: fr })}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            currentStatus === 'picked_up' ? 'bg-blue-100 text-blue-800' :
            currentStatus === 'delivered' ? 'bg-green-100 text-green-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {currentStatus === 'picked_up' ? 'En cours de livraison' :
             currentStatus === 'delivered' ? 'Livré' :
             'À récupérer'}
          </span>
        </div>

        <div className="space-y-6">
          {/* Adresses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <MapPinIcon className="h-6 w-6 text-green-500 mt-1 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Point de ramassage</p>
                <p className="text-gray-600">{delivery.pickupAddress}</p>
              </div>
            </div>
            <div className="flex items-start">
              <MapPinIcon className="h-6 w-6 text-red-500 mt-1 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Point de livraison</p>
                <p className="text-gray-600">{delivery.deliveryAddress}</p>
              </div>
            </div>
          </div>

          {/* Client */}
          <div className="flex items-center">
            <PhoneIcon className="h-6 w-6 text-gray-400 mr-3" />
            <div>
              <p className="font-medium text-gray-900">{delivery.customer.name}</p>
              <p className="text-gray-600">{delivery.customer.phone}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4 pt-4 border-t">
            {currentStatus === 'accepted' && (
              <button
                onClick={() => updateDeliveryStatus('picked_up')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                Confirmer la récupération
              </button>
            )}

            {currentStatus === 'picked_up' && (
              <>
                <button
                  onClick={() => setShowSignaturePad(true)}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <PencilIcon className="h-5 w-5 mr-2" />
                  Obtenir la signature
                </button>
                
                <label className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 cursor-pointer">
                  <CameraIcon className="h-5 w-5 mr-2" />
                  {isUploading ? 'Upload en cours...' : 'Ajouter une photo'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={uploadPhoto}
                    disabled={isUploading}
                  />
                </label>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Centre de récompenses */}
      <button
        onClick={() => setShowRewards(true)}
        className="fixed bottom-32 right-4 bg-yellow-500 text-white rounded-full p-3 shadow-lg hover:bg-yellow-600 transition-colors"
        aria-label="Ouvrir le centre de récompenses"
      >
        <TrophyIcon className="h-6 w-6" />
      </button>

      {showRewards && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <RewardsCenter driverId={delivery.driverId} />
            <button
              onClick={() => setShowRewards(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}

      {/* Notifications de récompenses */}
      {rewardNotification && (
        <RewardNotification
          reward={rewardNotification}
          onClose={() => setRewardNotification(null)}
        />
      )}

      {/* Assistant Virtuel */}
      <VirtualAssistant
        driverId={delivery.driverId}
        currentDelivery={{
          id: delivery.id,
          status: currentStatus,
          address: delivery.deliveryAddress,
        }}
        onSuggestionSelect={(suggestion) => {
          // Gérer les suggestions sélectionnées
          console.log('Suggestion sélectionnée:', suggestion);
        }}
      />

      {/* Chat Button */}
      <ChatButton
        deliveryId={delivery.id}
        recipientId={delivery.customer.id}
        recipientName={delivery.customer.name}
      />

      {/* Pad de signature */}
      {showSignaturePad && (
        <SignaturePad
          onSave={handleSignatureSave}
          onCancel={() => setShowSignaturePad(false)}
        />
      )}

      {/* Rating Modal */}
      {showRating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <DeliveryRating
            deliveryId={delivery.id}
            driverId={delivery.driverId}
            onComplete={() => setShowRating(false)}
          />
        </div>
      )}
    </div>
  );
}
