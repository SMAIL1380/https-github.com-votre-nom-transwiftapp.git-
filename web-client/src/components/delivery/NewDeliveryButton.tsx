'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';

const schema = yup.object({
  pickupAddress: yup.string().required('Adresse de ramassage requise'),
  deliveryAddress: yup.string().required('Adresse de livraison requise'),
  scheduledDate: yup.string().required('Date de livraison requise'),
  description: yup.string(),
}).required();

type DeliveryFormData = yup.InferType<typeof schema>;

interface NewDeliveryButtonProps {
  onDeliveryCreated: () => void;
}

export default function NewDeliveryButton({ onDeliveryCreated }: NewDeliveryButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<DeliveryFormData>({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data: DeliveryFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/deliveries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la livraison');
      }

      toast.success('Livraison créée avec succès');
      onDeliveryCreated();
      setIsModalOpen(false);
      reset();
    } catch (error) {
      toast.error('Erreur lors de la création de la livraison');
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
      >
        Nouvelle Livraison
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Nouvelle Livraison</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse de ramassage
                </label>
                <input
                  {...register('pickupAddress')}
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="123 rue du Départ"
                />
                {errors.pickupAddress && (
                  <p className="mt-1 text-sm text-red-600">{errors.pickupAddress.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse de livraison
                </label>
                <input
                  {...register('deliveryAddress')}
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="456 rue d'Arrivée"
                />
                {errors.deliveryAddress && (
                  <p className="mt-1 text-sm text-red-600">{errors.deliveryAddress.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de livraison
                </label>
                <input
                  {...register('scheduledDate')}
                  type="datetime-local"
                  className="w-full px-3 py-2 border rounded-md"
                />
                {errors.scheduledDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.scheduledDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optionnel)
                </label>
                <textarea
                  {...register('description')}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                  placeholder="Informations supplémentaires..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    reset();
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {isLoading ? 'Création...' : 'Créer la livraison'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
