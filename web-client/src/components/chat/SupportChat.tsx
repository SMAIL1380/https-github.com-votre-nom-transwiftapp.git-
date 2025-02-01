import React, { useState, useEffect } from 'react';
import { chatService } from '../../services/ChatService';
import { SupportTicket, ChatRoom } from '../../types/chat';
import ChatWindow from './ChatWindow';
import './SupportChat.css';

interface SupportChatProps {
  userId: string;
  userName: string;
}

export default function SupportChat({ userId, userName }: SupportChatProps) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTickets();
  }, [userId]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/support/tickets?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des tickets:', error);
      setError('Impossible de charger les tickets de support');
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async (category: string, subject: string, description: string) => {
    try {
      // Créer une salle de chat pour le support
      const room = await chatService.createChatRoom('support', [userId]);
      
      // Créer le ticket de support
      const ticket: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt'> = {
        chatRoomId: room.id,
        priority: 'medium',
        status: 'open',
        category,
        subject,
        description
      };
      
      const newTicket = await chatService.createSupportTicket(ticket);
      setTickets(prev => [...prev, newTicket]);
      setActiveTicket(newTicket);
      setChatRoom(room);
    } catch (error) {
      console.error('Erreur lors de la création du ticket:', error);
      setError('Impossible de créer le ticket de support');
    }
  };

  const closeTicket = async (ticketId: string, feedback?: { rating: number; comment?: string }) => {
    try {
      const updatedTicket = await chatService.updateTicketStatus(ticketId, {
        status: 'closed',
        resolution: feedback ? {
          resolvedBy: 'user',
          resolvedAt: new Date(),
          solution: 'Résolu par l\'utilisateur',
          feedback
        } : undefined
      });
      
      setTickets(prev => prev.map(t => t.id === ticketId ? updatedTicket : t));
      if (activeTicket?.id === ticketId) {
        setActiveTicket(updatedTicket);
      }
    } catch (error) {
      console.error('Erreur lors de la fermeture du ticket:', error);
      setError('Impossible de fermer le ticket');
    }
  };

  const renderTicketList = () => (
    <div className="ticket-list">
      <h3 className="text-lg font-semibold mb-4">Mes Tickets</h3>
      {tickets.length === 0 ? (
        <p className="text-gray-500">Aucun ticket de support</p>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className={`ticket-card ${activeTicket?.id === ticket.id ? 'active' : ''}`}
              onClick={() => setActiveTicket(ticket)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{ticket.subject}</h4>
                  <p className="text-sm text-gray-500">{ticket.category}</p>
                </div>
                <span className={`status-badge status-${ticket.status}`}>
                  {ticket.status}
                </span>
              </div>
              <p className="text-sm mt-2 text-gray-600 line-clamp-2">
                {ticket.description}
              </p>
              <div className="mt-2 text-xs text-gray-400">
                Créé le {new Date(ticket.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderNewTicketForm = () => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        createTicket(
          formData.get('category') as string,
          formData.get('subject') as string,
          formData.get('description') as string
        );
      }}
      className="new-ticket-form"
    >
      <h3 className="text-lg font-semibold mb-4">Nouveau Ticket</h3>
      
      <div className="form-group">
        <label htmlFor="category">Catégorie</label>
        <select
          id="category"
          name="category"
          required
          className="form-select"
        >
          <option value="technical">Problème Technique</option>
          <option value="account">Compte</option>
          <option value="billing">Facturation</option>
          <option value="other">Autre</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="subject">Sujet</label>
        <input
          type="text"
          id="subject"
          name="subject"
          required
          className="form-input"
          placeholder="Résumé bref du problème"
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          required
          className="form-textarea"
          rows={4}
          placeholder="Décrivez votre problème en détail..."
        />
      </div>

      <button type="submit" className="submit-button">
        Créer le ticket
      </button>
    </form>
  );

  if (loading) {
    return <div className="loading-state">Chargement du support...</div>;
  }

  if (error) {
    return <div className="error-state">{error}</div>;
  }

  return (
    <div className="support-chat-container">
      <div className="support-sidebar">
        <button
          onClick={() => {
            setActiveTicket(null);
            setChatRoom(null);
          }}
          className="new-ticket-button"
        >
          Nouveau Ticket
        </button>
        {renderTicketList()}
      </div>

      <div className="support-main">
        {!activeTicket ? (
          renderNewTicketForm()
        ) : (
          <div className="active-ticket-container">
            <div className="ticket-header">
              <div>
                <h2 className="text-xl font-semibold">{activeTicket.subject}</h2>
                <p className="text-sm text-gray-500">{activeTicket.category}</p>
              </div>
              {activeTicket.status !== 'closed' && (
                <button
                  onClick={() => closeTicket(activeTicket.id)}
                  className="close-ticket-button"
                >
                  Fermer le ticket
                </button>
              )}
            </div>

            {chatRoom && (
              <ChatWindow
                deliveryId={chatRoom.id}
                recipientId="support"
                recipientName="Support"
              />
            )}

            {activeTicket.status === 'closed' && activeTicket.resolution && (
              <div className="resolution-info">
                <h4 className="font-medium">Résolution</h4>
                <p>{activeTicket.resolution.solution}</p>
                {activeTicket.resolution.feedback && (
                  <div className="feedback-info">
                    <div className="rating">
                      Note: {activeTicket.resolution.feedback.rating}/5
                    </div>
                    {activeTicket.resolution.feedback.comment && (
                      <p className="comment">
                        {activeTicket.resolution.feedback.comment}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
