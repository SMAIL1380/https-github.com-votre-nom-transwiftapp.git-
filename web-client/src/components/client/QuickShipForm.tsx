'use client';

import { useState } from 'react';
import {
  XMarkIcon,
  MapPinIcon,
  CalendarIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface QuickShipFormProps {
  clientId: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface ShipmentDetails {
  pickupAddress: string;
  deliveryAddress: string;
  scheduledDate: string;
  packageSize: 'small' | 'medium' | 'large';
  priority: 'normal' | 'express' | 'priority';
  specialInstructions?: string;
}

export default function QuickShipForm({
  clientId,
  onClose,
  onSuccess,
}: QuickShipFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [shipmentDetails, setShipmentDetails] = useState<ShipmentDetails>({
    pickupAddress: '',
    deliveryAddress: '',
    scheduledDate: '',
    packageSize: 'small',
    priority: 'normal',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/deliveries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          clientId,
          ...shipmentDetails,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la livraison');
      }

      onSuccess();
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Adresses
            </h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="pickupAddress"
                  className="block text-sm font-medium text-gray-700"
                >
                  Adresse de départ
                </label>
                <div className="mt-1 relative">
                  <input
                    type="text"
                    id="pickupAddress"
                    value={shipmentDetails.pickupAddress}
                    onChange={(e) =>
                      setShipmentDetails({
                        ...shipmentDetails,
                        pickupAddress: e.target.value,
                      })
                    }
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <MapPinIcon className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
              <div>
                <label
                  htmlFor="deliveryAddress"
                  className="block text-sm font-medium text-gray-700"
                >
                  Adresse de livraison
                </label>
                <div className="mt-1 relative">
                  <input
                    type="text"
                    id="deliveryAddress"
                    value={shipmentDetails.deliveryAddress}
                    onChange={(e) =>
                      setShipmentDetails({
                        ...shipmentDetails,
                        deliveryAddress: e.target.value,
                      })
                    }
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <MapPinIcon className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Détails de l'envoi
            </h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="scheduledDate"
                  className="block text-sm font-medium text-gray-700"
                >
                  Date de livraison souhaitée
                </label>
                <div className="mt-1 relative">
                  <input
                    type="datetime-local"
                    id="scheduledDate"
                    value={shipmentDetails.scheduledDate}
                    onChange={(e) =>
                      setShipmentDetails({
                        ...shipmentDetails,
                        scheduledDate: e.target.value,
                      })
                    }
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Taille du colis
                </label>
                <div className="mt-2 grid grid-cols-3 gap-3">
                  {['small', 'medium', 'large'].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() =>
                        setShipmentDetails({
                          ...shipmentDetails,
                          packageSize: size as 'small' | 'medium' | 'large',
                        })
                      }
                      className={`flex items-center justify-center px-3 py-2 border rounded-md ${
                        shipmentDetails.packageSize === size
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-300 bg-white text-gray-700'
                      }`}
                    >
                      <TruckIcon
                        className={`h-5 w-5 mr-2 ${
                          shipmentDetails.packageSize === size
                            ? 'text-primary-500'
                            : 'text-gray-400'
                        }`}
                      />
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Priorité
                </label>
                <div className="mt-2 grid grid-cols-3 gap-3">
                  {['normal', 'express', 'priority'].map((priority) => (
                    <button
                      key={priority}
                      type="button"
                      onClick={() =>
                        setShipmentDetails({
                          ...shipmentDetails,
                          priority: priority as 'normal' | 'express' | 'priority',
                        })
                      }
                      className={`px-3 py-2 border rounded-md ${
                        shipmentDetails.priority === priority
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-300 bg-white text-gray-700'
                      }`}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="specialInstructions"
                  className="block text-sm font-medium text-gray-700"
                >
                  Instructions spéciales
                </label>
                <textarea
                  id="specialInstructions"
                  rows={3}
                  value={shipmentDetails.specialInstructions}
                  onChange={(e) =>
                    setShipmentDetails({
                      ...shipmentDetails,
                      specialInstructions: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          Nouvelle Expédition
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Indicateur de progression */}
      <div className="mb-8">
        <div className="flex justify-between">
          {[1, 2].map((step) => (
            <button
              key={step}
              onClick={() => setCurrentStep(step)}
              className={`flex items-center ${
                step === currentStep
                  ? 'text-primary-600'
                  : 'text-gray-500'
              }`}
            >
              <span
                className={`w-8 h-8 flex items-center justify-center rounded-full ${
                  step === currentStep
                    ? 'bg-primary-600 text-white'
                    : step < currentStep
                    ? 'bg-primary-200 text-primary-700'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {step}
              </span>
              <span className="ml-2">
                {step === 1 ? 'Adresses' : 'Détails'}
              </span>
            </button>
          ))}
        </div>
        <div className="mt-4 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div
            className="absolute h-1 bg-primary-600 transition-all"
            style={{
              width: `${((currentStep - 1) / 1) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Contenu du formulaire */}
      {renderStepContent()}

      {/* Actions */}
      <div className="mt-8 flex justify-between">
        {currentStep > 1 && (
          <button
            onClick={() => setCurrentStep(currentStep - 1)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Retour
          </button>
        )}
        <button
          onClick={() => {
            if (currentStep < 2) {
              setCurrentStep(currentStep + 1);
            } else {
              handleSubmit();
            }
          }}
          disabled={isSubmitting}
          className="ml-auto px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
        >
          {isSubmitting
            ? 'Envoi en cours...'
            : currentStep < 2
            ? 'Suivant'
            : 'Créer la livraison'}
        </button>
      </div>
    </div>
  );
}
