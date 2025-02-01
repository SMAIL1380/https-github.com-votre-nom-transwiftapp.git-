'use client';

import { useState, useEffect, useRef } from 'react';
import { socket } from '@/lib/socket';
import { useSession } from 'next-auth/react';
import { CameraIcon, PaperAirplaneIcon, MapPinIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  type: 'text' | 'image' | 'location';
  timestamp: string;
  data?: {
    url?: string;
    location?: {
      lat: number;
      lng: number;
    };
  };
}

interface ChatWindowProps {
  deliveryId: string;
  recipientId: string;
  recipientName: string;
}

const QUICK_MESSAGES = [
  "Je suis en route",
  "J'arrive dans 5 minutes",
  "Je suis arrivé(e)",
  "Je ne trouve pas l'adresse",
  "Pouvez-vous me donner plus de détails ?",
];

export default function ChatWindow({ deliveryId, recipientId, recipientName }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Charger l'historique des messages
    const loadMessages = async () => {
      try {
        const response = await fetch(`/api/chat/${deliveryId}/messages`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
          scrollToBottom();
        }
      } catch (error) {
        console.error('Erreur lors du chargement des messages:', error);
      }
    };

    loadMessages();

    // Écouter les nouveaux messages
    socket.on(`chat:${deliveryId}`, (message: Message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    });

    return () => {
      socket.off(`chat:${deliveryId}`);
    };
  }, [deliveryId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (content: string, type: 'text' | 'image' | 'location' = 'text', data?: any) => {
    if (!session?.user?.id) return;

    const message = {
      deliveryId,
      recipientId,
      content,
      type,
      data,
      timestamp: new Date().toISOString(),
    };

    try {
      const response = await fetch('/api/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du message');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendMessage(newMessage);
      setNewMessage('');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/chat/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'upload de l\'image');
      }

      const { url } = await response.json();
      sendMessage('Image envoyée', 'image', { url });
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const shareLocation = async () => {
    if ('geolocation' in navigator) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        sendMessage('Position partagée', 'location', { location });
      } catch (error) {
        console.error('Erreur de géolocalisation:', error);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* En-tête */}
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold">{recipientName}</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.senderId === session?.user?.id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.senderId === session?.user?.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.type === 'text' && (
                <p>{message.content}</p>
              )}

              {message.type === 'image' && message.data?.url && (
                <div className="relative h-48 w-48">
                  <Image
                    src={message.data.url}
                    alt="Image partagée"
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              )}

              {message.type === 'location' && message.data?.location && (
                <a
                  href={`https://www.google.com/maps?q=${message.data.location.lat},${message.data.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-500 hover:text-blue-600"
                >
                  <MapPinIcon className="h-5 w-5 mr-2" />
                  Voir sur la carte
                </a>
              )}

              <p className="text-xs mt-1 opacity-70">
                {format(new Date(message.timestamp), 'HH:mm', { locale: fr })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Messages rapides */}
      <div className="p-2 border-t border-gray-200 flex overflow-x-auto space-x-2">
        {QUICK_MESSAGES.map((msg) => (
          <button
            key={msg}
            onClick={() => {
              sendMessage(msg);
            }}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm whitespace-nowrap hover:bg-gray-200"
          >
            {msg}
          </button>
        ))}
      </div>

      {/* Formulaire d'envoi */}
      <form onSubmit={handleSubmit} className="p-4 border-t flex items-center space-x-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-500 hover:text-gray-700"
          disabled={isUploading}
        >
          <CameraIcon className="h-6 w-6" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        <button
          type="button"
          onClick={shareLocation}
          className="p-2 text-gray-500 hover:text-gray-700"
        >
          <MapPinIcon className="h-6 w-6" />
        </button>

        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Écrivez votre message..."
          className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        />

        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="p-2 text-primary-600 hover:text-primary-700 disabled:opacity-50"
        >
          <PaperAirplaneIcon className="h-6 w-6" />
        </button>
      </form>
    </div>
  );
}
