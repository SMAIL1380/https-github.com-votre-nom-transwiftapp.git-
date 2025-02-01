import React, { useEffect, useState, useRef } from 'react';
import { RealTimeEvent } from '../../types/analytics';
import { analyticsService } from '../../services/AnalyticsService';
import './EventStream.css';

const EventStream: React.FC = () => {
  const [events, setEvents] = useState<RealTimeEvent[]>([]);
  const streamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = analyticsService.subscribeToMetrics('event', (event: RealTimeEvent) => {
      setEvents(prev => [event, ...prev].slice(0, 50)); // Garder les 50 derniers événements
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.scrollTop = 0;
    }
  }, [events]);

  const getEventIcon = (type: RealTimeEvent['type']) => {
    switch (type) {
      case 'order':
        return '🛍️';
      case 'delivery':
        return '🚚';
      case 'support':
        return '💬';
      case 'user':
        return '👤';
      case 'system':
        return '⚙️';
      default:
        return '📝';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffMs / (1000 * 60));
    const diffHour = Math.round(diffMs / (1000 * 60 * 60));

    if (diffSec < 60) {
      return `Il y a ${diffSec} seconde${diffSec > 1 ? 's' : ''}`;
    } else if (diffMin < 60) {
      return `Il y a ${diffMin} minute${diffMin > 1 ? 's' : ''}`;
    } else if (diffHour < 24) {
      return `Il y a ${diffHour} heure${diffHour > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleString();
    }
  };

  const getEventDescription = (event: RealTimeEvent) => {
    const { type, data } = event;
    switch (type) {
      case 'order':
        return `Nouvelle commande #${data.orderId} - ${data.amount}€`;
      case 'delivery':
        return `Livraison ${data.status} pour la commande #${data.orderId}`;
      case 'support':
        return `Ticket support #${data.ticketId} - ${data.subject}`;
      case 'user':
        return `${data.action} par l'utilisateur ${data.userId}`;
      case 'system':
        return `${data.message}`;
      default:
        return 'Événement inconnu';
    }
  };

  return (
    <div className="event-stream-container">
      <div className="event-stream-header">
        <h3>Flux d'Événements en Direct</h3>
        <div className="event-filters">
          <button className="filter-button active">Tous</button>
          <button className="filter-button">Commandes</button>
          <button className="filter-button">Livraisons</button>
          <button className="filter-button">Support</button>
        </div>
      </div>
      
      <div className="event-stream" ref={streamRef}>
        {events.map((event, index) => (
          <div
            key={`${event.timestamp}-${index}`}
            className={`event-item ${event.priority}`}
          >
            <div className={`event-icon ${event.priority}`}>
              {getEventIcon(event.type)}
            </div>
            <div className="event-content">
              <div className="event-description">
                {getEventDescription(event)}
              </div>
              <div className="event-meta">
                <span className="event-type">{event.type}</span>
                <span className="event-time">
                  {formatTimestamp(event.timestamp)}
                </span>
              </div>
            </div>
          </div>
        ))}
        
        {events.length === 0 && (
          <div className="no-events">
            <div className="no-events-icon">📊</div>
            <p>En attente d'événements...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventStream;
