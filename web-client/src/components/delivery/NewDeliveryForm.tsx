'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPinIcon,
  UserIcon,
  PhoneIcon,
  PackageIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

interface DeliveryFormData {
  pickupAddress: string;
  dropoffAddress: string;
  recipientName: string;
  recipientPhone: string;
  packageSize: 'small' | 'medium' | 'large';
  packageWeight: string;
  notes: string;
  urgency: 'normal' | 'express';
}

const packageSizes = [
  { id: 'small', name: 'Petit', description: '< 5kg' },
  { id: 'medium', name: 'Moyen', description: '5-15kg' },
  { id: 'large', name: 'Grand', description: '> 15kg' },
];

const urgencyOptions = [
  { id: 'normal', name: 'Standard', description: '24-48h' },
  { id: 'express', name: 'Express', description: '2-4h' },
];

export default function NewDeliveryForm() {
  const [formData, setFormData] = useState<DeliveryFormData>({
    pickupAddress: '',
    dropoffAddress: '',
    recipientName: '',
    recipientPhone: '',
    packageSize: 'small',
    packageWeight: '',
    notes: '',
    urgency: 'normal',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Simuler un appel API
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // À remplacer par un véritable appel API
      // const response = await fetch('/api/deliveries', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(formData),
      // });

      setSuccess(true);
      // Réinitialiser le formulaire
      setFormData({
        pickupAddress: '',
        dropoffAddress: '',
        recipientName: '',
        recipientPhone: '',
        packageSize: 'small',
        packageWeight: '',
        notes: '',
        urgency: 'normal',
      });
    } catch (error) {
      setError('Une erreur est survenue lors de la création de la livraison');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-6"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Nouvelle livraison
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Adresses */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="pickupAddress"
              className="block text-sm font-medium text-gray-700"
            >
              Adresse de collecte
            </label>
            <div className="mt-1 relative">
              <input
                type="text"
                id="pickupAddress"
                name="pickupAddress"
                value={formData.pickupAddress}
                onChange={handleChange}
                required
                className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <MapPinIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="dropoffAddress"
              className="block text-sm font-medium text-gray-700"
            >
              Adresse de livraison
            </label>
            <div className="mt-1 relative">
              <input
                type="text"
                id="dropoffAddress"
                name="dropoffAddress"
                value={formData.dropoffAddress}
                onChange={handleChange}
                required
                className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <MapPinIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Informations destinataire */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label
              htmlFor="recipientName"
              className="block text-sm font-medium text-gray-700"
            >
              Nom du destinataire
            </label>
            <div className="mt-1 relative">
              <input
                type="text"
                id="recipientName"
                name="recipientName"
                value={formData.recipientName}
                onChange={handleChange}
                required
                className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <UserIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="recipientPhone"
              className="block text-sm font-medium text-gray-700"
            >
              Téléphone du destinataire
            </label>
            <div className="mt-1 relative">
              <input
                type="tel"
                id="recipientPhone"
                name="recipientPhone"
                value={formData.recipientPhone}
                onChange={handleChange}
                required
                className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <PhoneIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Informations colis */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Taille du colis
          </label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {packageSizes.map((size) => (
              <div
                key={size.id}
                className={`relative rounded-lg border ${
                  formData.packageSize === size.id
                    ? 'border-primary-500 ring-2 ring-primary-500'
                    : 'border-gray-300'
                } p-4 cursor-pointer hover:border-primary-500`}
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    packageSize: size.id as 'small' | 'medium' | 'large',
                  }))
                }
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <PackageIcon
                      className={`h-6 w-6 ${
                        formData.packageSize === size.id
                          ? 'text-primary-600'
                          : 'text-gray-400'
                      }`}
                    />
                  </div>
                  <div className="ml-3">
                    <h3
                      className={`text-sm font-medium ${
                        formData.packageSize === size.id
                          ? 'text-primary-900'
                          : 'text-gray-900'
                      }`}
                    >
                      {size.name}
                    </h3>
                    <p className="text-xs text-gray-500">{size.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="packageWeight"
            className="block text-sm font-medium text-gray-700"
          >
            Poids (kg)
          </label>
          <input
            type="number"
            step="0.1"
            id="packageWeight"
            name="packageWeight"
            value={formData.packageWeight}
            onChange={handleChange}
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>

        {/* Type de livraison */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Type de livraison
          </label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {urgencyOptions.map((option) => (
              <div
                key={option.id}
                className={`relative rounded-lg border ${
                  formData.urgency === option.id
                    ? 'border-primary-500 ring-2 ring-primary-500'
                    : 'border-gray-300'
                } p-4 cursor-pointer hover:border-primary-500`}
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    urgency: option.id as 'normal' | 'express',
                  }))
                }
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TruckIcon
                      className={`h-6 w-6 ${
                        formData.urgency === option.id
                          ? 'text-primary-600'
                          : 'text-gray-400'
                      }`}
                    />
                  </div>
                  <div className="ml-3">
                    <h3
                      className={`text-sm font-medium ${
                        formData.urgency === option.id
                          ? 'text-primary-900'
                          : 'text-gray-900'
                      }`}
                    >
                      {option.name}
                    </h3>
                    <p className="text-xs text-gray-500">{option.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700"
          >
            Instructions spéciales
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={formData.notes}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Livraison créée avec succès !
                </h3>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Création en cours...
              </>
            ) : (
              'Créer la livraison'
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
