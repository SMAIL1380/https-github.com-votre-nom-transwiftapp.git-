'use client';

import { useState, useEffect, useRef } from 'react';
import {
  XMarkIcon,
  PaperAirplaneIcon,
  PhotoIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface Message {
  id: string;
  type: 'text' | 'image' | 'location';
  content: string;
  sender: 'client' | 'driver';
  timestamp: string;
}

interface ClientChatProps {
  clientId: string;
  deliveryId: string;
  onClose: () => void;
}

export default function ClientChat({
  clientId,
  deliveryId,
  onClose,
}: ClientChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000); // Rafraîchir toutes les 10 secondes

    return () => clearInterval(interval);
  }, [deliveryId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `/api/chat/${deliveryId}/messages`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des messages');
      }

      const data = await response.json();
      setMessages(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await fetch(`/api/chat/${deliveryId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          type: 'text',
          content: newMessage,
          clientId,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du message');
      }

      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('clientId', clientId);

    try {
      const response = await fetch(`/api/chat/${deliveryId}/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi de l\'image');
      }

      fetchMessages();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleShareLocation = async () => {
    if (!navigator.geolocation) {
      alert('La géolocalisation n\'est pas supportée par votre navigateur');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const response = await fetch(`/api/chat/${deliveryId}/location`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({
              clientId,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            }),
          });

          if (!response.ok) {
            throw new Error('Erreur lors du partage de la position');
          }

          fetchMessages();
        } catch (error) {
          console.error('Erreur:', error);
        }
      },
      (error) => {
        console.error('Erreur de géolocalisation:', error);
        alert('Impossible d\'obtenir votre position');
      }
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* En-tête */}
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">
          Conversation
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse flex items-center space-x-4"
              >
                <div className="h-10 w-10 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${
                message.sender === 'client' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender === 'client'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.type === 'text' && <p>{message.content}</p>}
                {message.type === 'image' && (
                  <img
                    src={message.content}
                    alt="Image partagée"
                    className="rounded-lg max-w-full"
                  />
                )}
                {message.type === 'location' && (
                  <div className="flex items-center">
                    <MapPinIcon className="h-5 w-5 mr-2" />
                    <span>Position partagée</span>
                  </div>
                )}
                <p
                  className={`text-xs mt-1 ${
                    message.sender === 'client'
                      ? 'text-primary-100'
                      : 'text-gray-500'
                  }`}
                >
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-400 hover:text-gray-500"
          >
            <PhotoIcon className="h-6 w-6" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />
          <button
            onClick={handleShareLocation}
            className="p-2 text-gray-400 hover:text-gray-500"
          >
            <MapPinIcon className="h-6 w-6" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
            placeholder="Votre message..."
            className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="p-2 text-primary-600 hover:text-primary-700 disabled:opacity-50"
          >
            <PaperAirplaneIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
