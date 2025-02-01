'use client';

import { useState } from 'react';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import ChatWindow from './ChatWindow';

interface ChatButtonProps {
  deliveryId: string;
  recipientId: string;
  recipientName: string;
}

export default function ChatButton({ deliveryId, recipientId, recipientName }: ChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-primary-600 text-white rounded-full p-3 shadow-lg hover:bg-primary-700 transition-colors"
        aria-label="Ouvrir le chat"
      >
        <ChatBubbleLeftIcon className="h-6 w-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg h-[600px] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Chat avec {recipientName}</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <ChatWindow
                deliveryId={deliveryId}
                recipientId={recipientId}
                recipientName={recipientName}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
