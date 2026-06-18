import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Ticket } from 'lucide-react';
import './FomoNotification.css';

export default function FomoNotification() {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const socket = io(API_BASE);

    socket.on('new_purchase', (data) => {
      setNotification(data);
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (!notification) return null;

  return (
    <div className="fomo-notification animate-slide-up">
      <div className="fomo-icon-container">
        <Ticket size={20} className="fomo-icon" />
      </div>
      <div className="fomo-content">
        <p className="fomo-text">
          <strong>{notification.name}</strong> just bought tickets to
        </p>
        <p className="fomo-event">{notification.eventTitle}</p>
      </div>
    </div>
  );
}
