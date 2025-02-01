'use client';

import { useEffect, useState } from 'react';
import DeliveryCard from '@/components/driver/DeliveryCard';
import ActiveDelivery from '@/components/driver/ActiveDelivery';
import { useRouter } from 'next/navigation';
import { socket } from '@/lib/socket';

interface Delivery {
  id: string;
  status: string;
  pickupAddress: string;
  deliveryAddress: string;
  customer: {
    name: string;
    phone: string;
  };
  scheduledDate: string;
  description?: string;
}

export default function DriverDashboard() {
  const [availableDeliveries, setAvailableDeliveries] = useState<Delivery[]>([]);
  const [activeDelivery, setActiveDelivery] = useState<Delivery | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    // Vérifier si l'utilisateur est un livreur
    checkDriverStatus();
    
    // Se connecter au socket
    socket.connect();
    
    // Écouter les nouvelles livraisons
    socket.on('newDelivery', handleNewDelivery);
    
    return () => {
      socket.off('newDelivery');
    };
  }, [router]);

  const checkDriverStatus = async () => {
    try {
      const response = await fetch('http://localhost:3000/driver/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Non autorisé');
      }
      
      const data = await response.json();
      setIsOnline(data.isOnline);
    } catch (error) {
      router.push('/auth/login');
    }
  };

  const handleNewDelivery = (delivery: Delivery) => {
    if (!activeDelivery) {
      setAvailableDeliveries(prev => [delivery, ...prev]);
    }
  };

  const toggleOnlineStatus = async () => {
    try {
      const response = await fetch('http://localhost:3000/driver/toggle-status', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        setIsOnline(!isOnline);
      }
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
    }
  };

  const acceptDelivery = async (deliveryId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/driver/deliveries/${deliveryId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const delivery = availableDeliveries.find(d => d.id === deliveryId);
        if (delivery) {
          setActiveDelivery(delivery);
          setAvailableDeliveries(prev => prev.filter(d => d.id !== deliveryId));
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'acceptation de la livraison:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête avec statut */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Tableau de bord Livreur
            </h1>
            <div className="flex items-center space-x-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {isOnline ? 'En ligne' : 'Hors ligne'}
              </span>
              <button
                onClick={toggleOnlineStatus}
                className={`px-4 py-2 rounded-md text-white ${
                  isOnline ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isOnline ? 'Se déconnecter' : 'Se connecter'}
              </button>
            </div>
          </div>
        </div>

        {/* Livraison active */}
        {activeDelivery && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Livraison en cours</h2>
            <ActiveDelivery delivery={activeDelivery} />
          </div>
        )}

        {/* Liste des livraisons disponibles */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Livraisons disponibles</h2>
          {isOnline ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableDeliveries.map((delivery) => (
                <DeliveryCard
                  key={delivery.id}
                  delivery={delivery}
                  onAccept={() => acceptDelivery(delivery.id)}
                />
              ))}
              {availableDeliveries.length === 0 && (
                <p className="text-gray-500 col-span-full text-center py-8">
                  Aucune livraison disponible pour le moment
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Connectez-vous pour voir les livraisons disponibles
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
