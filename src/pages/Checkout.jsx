import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Clock, Ticket, CheckCircle2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../context/EventContext';
import './Checkout.css';

export default function Checkout({ eventId, onClose, selectedSection, selectedSeats = [], ticketCount = 1 }) {
  const navigate = useNavigate();
  const { currentUser, getAuthHeaders } = useAuth();
  const { getEventById } = useEvents();
  const event = getEventById(eventId);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    if (timeLeft <= 0) {
      alert("Time expired! Releasing your tickets.");
      onClose();
    }
    return () => clearInterval(timer);
  }, [timeLeft, onClose]);

  if (!event) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const finalSection = selectedSection || { name: 'General Admission', price: event?.price || 0 };
  const subtotal = selectedSeats && selectedSeats.length > 0
    ? selectedSeats.reduce((sum, s) => sum + (s.price || finalSection.price), 0)
    : finalSection.price * ticketCount;
    
  const serviceFee = subtotal * 0.18;
  const orderProcessingFee = 2.95;
  const total = subtotal + serviceFee + orderProcessingFee;

  const handlePayment = async () => {
    if (!currentUser) return;
    setIsProcessing(true);
    
    try {
      const orderData = {
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date,
        eventVenue: event.venue,
        eventImage: event.image,
        section: finalSection,
        seats: selectedSeats || [],
        ticketCount: ticketCount,
        totalPaid: total
      };

      const API_BASE = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(orderData)
      });

      if (!response.ok) throw new Error('Order failed');
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      alert('Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <motion.div 
      className="checkout-drawer-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div 
        className="checkout-drawer glass-panel"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="drawer-header">
          <h2>Secure Checkout</h2>
          <button className="drawer-close-btn" onClick={onClose}><X size={24} /></button>
        </div>

        {isSuccess ? (
          <div className="checkout-success animate-fade-in" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <CheckCircle2 size={64} className="success-icon" style={{ color: 'var(--success)', margin: '0 auto 1rem' }} />
            <h1 style={{ marginBottom: '0.5rem' }}>You're all set!</h1>
            <p className="success-message" style={{ color: 'var(--text-secondary)' }}>
              Order placed. Redirecting to your dashboard...
            </p>
          </div>
        ) : (
          <div className="drawer-content">
            <div className="checkout-header-bar" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
              <div className={`countdown-timer ${timeLeft < 120 ? 'danger' : ''}`} style={{ display: 'flex', gap: '0.5rem', color: timeLeft < 120 ? 'var(--error)' : 'var(--text-primary)' }}>
                <Clock size={16} />
                <span>Time left to buy: {formatTime(timeLeft)}</span>
              </div>
              <div className="secure-badge" style={{ display: 'flex', gap: '0.5rem', color: 'var(--success)' }}>
                <Lock size={16} /> Secure Payment
              </div>
            </div>

            <div className="checkout-summary-box" style={{ background: 'var(--bg-primary)', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem' }}>
              <h3 style={{ margin: '0 0 1rem' }}>Order Summary</h3>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <img src={event.image} alt={event.title} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                <div>
                  <h4 style={{ margin: '0 0 0.25rem' }}>{event.title}</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{event.date}</p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{event.venue}</p>
                </div>
              </div>

              <div className="summary-line" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>{ticketCount}x {finalSection.name}</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-line" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <span>Service Fee</span>
                <span>${serviceFee.toFixed(2)}</span>
              </div>
              <div className="summary-line" style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <span>Order Processing</span>
                <span>${orderProcessingFee.toFixed(2)}</span>
              </div>
              <div className="summary-total" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
                <span>Total</span>
                <span style={{ color: 'var(--accent)' }}>${total.toFixed(2)}</span>
              </div>
            </div>

            <button 
              className={`btn-primary full-width ${isProcessing ? 'loading' : ''}`}
              onClick={handlePayment}
              disabled={isProcessing}
              style={{ padding: '1rem', fontSize: '1.1rem' }}
            >
              {isProcessing ? 'Processing Payment...' : `Pay $${total.toFixed(2)}`}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
