'use client';

import { useState, useEffect, useRef } from 'react';
import {
  LightBulbIcon,
  ChatBubbleBottomCenterTextIcon,
  XMarkIcon,
  MicrophoneIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Suggestion {
  id: string;
  text: string;
  action?: () => void;
}

interface VirtualAssistantProps {
  driverId: string;
  currentDelivery?: {
    id: string;
    status: string;
    address: string;
  };
  onSuggestionSelect?: (suggestion: string) => void;
}

export default function VirtualAssistant({
  driverId,
  currentDelivery,
  onSuggestionSelect,
}: VirtualAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognition = useRef<any>(null);
  const synthesis = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Initialiser la reconnaissance vocale
    if ('webkitSpeechRecognition' in window) {
      recognition.current = new (window as any).webkitSpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'fr-FR';

      recognition.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        handleSendMessage(transcript);
      };

      recognition.current.onend = () => {
        setIsListening(false);
      };
    }

    // Initialiser la synthèse vocale
    if ('speechSynthesis' in window) {
      synthesis.current = window.speechSynthesis;
    }

    // Message de bienvenue
    addMessage({
      id: 'welcome',
      type: 'assistant',
      content: 'Bonjour ! Je suis votre assistant virtuel. Comment puis-je vous aider aujourd\'hui ?',
      timestamp: new Date(),
    });

    return () => {
      if (recognition.current) {
        recognition.current.abort();
      }
      if (synthesis.current) {
        synthesis.current.cancel();
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          message: text,
          driverId,
          currentDelivery,
          context: messages.slice(-5), // Envoyer les 5 derniers messages pour le contexte
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur de communication avec l\'assistant');
      }

      const data = await response.json();
      const assistantMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      addMessage(assistantMessage);
      setSuggestions(data.suggestions || []);

      if (isSpeaking && synthesis.current) {
        const utterance = new SpeechSynthesisUtterance(data.response);
        utterance.lang = 'fr-FR';
        synthesis.current.speak(utterance);
      }
    } catch (error) {
      console.error('Erreur:', error);
      addMessage({
        id: Date.now().toString(),
        type: 'assistant',
        content: 'Désolé, je rencontre des difficultés. Pouvez-vous réessayer ?',
        timestamp: new Date(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListening = () => {
    if (!recognition.current) return;

    if (isListening) {
      recognition.current.stop();
    } else {
      recognition.current.start();
      setIsListening(true);
    }
  };

  const toggleSpeaking = () => {
    setIsSpeaking(!isSpeaking);
    if (isSpeaking && synthesis.current) {
      synthesis.current.cancel();
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 bg-primary-600 text-white rounded-full p-3 shadow-lg hover:bg-primary-700 transition-colors"
        aria-label="Ouvrir l'assistant virtuel"
      >
        <LightBulbIcon className="h-6 w-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg h-[600px] flex flex-col">
              {/* En-tête */}
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-lg font-semibold flex items-center">
                  <LightBulbIcon className="h-5 w-5 mr-2 text-primary-600" />
                  Assistant Virtuel
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleSpeaking}
                    className={`p-2 rounded-full ${
                      isSpeaking ? 'bg-primary-100 text-primary-600' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {isSpeaking ? (
                      <SpeakerWaveIcon className="h-5 w-5" />
                    ) : (
                      <SpeakerXMarkIcon className="h-5 w-5" />
                    )}
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.type === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[75%] rounded-lg p-3 ${
                        message.type === 'user'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg p-3 animate-pulse">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="p-2 border-t border-gray-200 flex overflow-x-auto space-x-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => {
                        if (suggestion.action) {
                          suggestion.action();
                        } else {
                          handleSendMessage(suggestion.text);
                        }
                        if (onSuggestionSelect) {
                          onSuggestionSelect(suggestion.text);
                        }
                      }}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm whitespace-nowrap hover:bg-gray-200"
                    >
                      {suggestion.text}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="p-4 border-t flex items-center space-x-2">
                <button
                  onClick={toggleListening}
                  className={`p-2 rounded-full ${
                    isListening
                      ? 'bg-red-100 text-red-600 animate-pulse'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <MicrophoneIcon className="h-5 w-5" />
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSendMessage(inputText);
                    }
                  }}
                  placeholder="Posez votre question..."
                  className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />

                <button
                  onClick={() => handleSendMessage(inputText)}
                  disabled={!inputText.trim() || isLoading}
                  className="p-2 text-primary-600 hover:text-primary-700 disabled:opacity-50"
                >
                  <ChatBubbleBottomCenterTextIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
