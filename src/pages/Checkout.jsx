import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Lock, AlertCircle, CheckCircle2, Ticket, Clock } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import './Checkout.css';

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { event, tickets, section, seats } = location.state || {};
  const { currentUser } = useAuth();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds

  useEffect(() => {
    if (!event || isSuccess) return;

    if (timeLeft <= 0) {
      alert("Time expired! Releasing your tickets.");
      navigate(`/event/${event.id}`);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, event, navigate, isSuccess]);

  // If someone navigates here directly without state
  if (!event) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
        <h2>No tickets selected</h2>
        <Link to="/" className="btn-primary" style={{ display: 'inline-block', marginTop: '1rem' }}>
          Back to Home
        </Link>
      </div>
    );
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const subtotal = section.price * tickets;
  const serviceFee = subtotal * 0.18; // 18% mock service fee
  const orderProcessingFee = 2.95;
  const total = subtotal + serviceFee + orderProcessingFee;

  const handlePayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Save order to Firestore
      const orderData = {
        userId: currentUser.uid,
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date,
        eventVenue: event.venue,
        eventImage: event.image,
        section: section,
        seats: seats || [],
        ticketCount: tickets,
        totalPaid: total,
        purchaseDate: new Date().toISOString()
      };
      
      await addDoc(collection(db, 'orders'), orderData);
      
      setIsSuccess(true);
    } catch (error) {
      console.error("Error processing order: ", error);
      alert("There was an error processing your order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="checkout-success container animate-fade-in">
        <CheckCircle2 size={64} className="success-icon" />
        <h1>You're all set!</h1>
        <p className="success-message">
          Your order has been placed. We've sent a confirmation email with your tickets.
        </p>
        <div className="ticket-preview glass-panel">
          <Ticket size={24} className="ticket-icon" />
          <div className="ticket-preview-details">
            <h3>{event.title}</h3>
            <p>{event.date}</p>
            <p>{tickets}x {section.name}</p>
          </div>
        </div>
        <button className="btn-primary" onClick={() => navigate('/dashboard')}>
          View My Tickets
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-page container animate-fade-in">
      <div className="checkout-header">
        <h1>Checkout</h1>
        <div className="checkout-header-right">
          <div className={`countdown-timer ${timeLeft < 120 ? 'danger' : ''}`}>
            <Clock size={16} />
            <span>Time left to buy: {formatTime(timeLeft)}</span>
          </div>
          <div className="secure-badge">
            <Lock size={16} /> Secure Payment
          </div>
        </div>
      </div>

      <div className="checkout-layout">
        {/* Payment Form */}
        <div className="checkout-main glass-panel">
          <div className="form-section">
            <h2>Delivery</h2>
            <div className="delivery-option">
              <input type="radio" checked readOnly />
              <div className="delivery-details">
                <span className="delivery-title">Mobile Ticket</span>
                <span className="delivery-desc">Free - Your phone's your ticket. Locate your tickets in your account.</span>
              </div>
            </div>
          </div>

          <form onSubmit={handlePayment} className="form-section">
            <h2>Payment Method</h2>
            
            <div className="payment-warning">
              <AlertCircle size={20} />
              <p>This is a mock checkout. Do not enter real credit card information.</p>
            </div>

            <div className="form-group">
              <label>Name on Card</label>
              <input type="text" placeholder="John Doe" required className="form-input" />
            </div>

            <div className="form-group">
              <label>Card Number</label>
              <input type="text" placeholder="0000 0000 0000 0000" maxLength="19" required className="form-input" />
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label>Expiration Date</label>
                <input type="text" placeholder="MM/YY" maxLength="5" required className="form-input" />
              </div>
              <div className="form-group half">
                <label>Security Code</label>
                <input type="text" placeholder="CVC" maxLength="4" required className="form-input" />
              </div>
            </div>

            <div className="form-group">
              <label>Billing Zip/Postal Code</label>
              <input type="text" placeholder="Zip Code" required className="form-input" />
            </div>

            <button 
              type="submit" 
              className={`btn-primary place-order-btn ${isProcessing ? 'loading' : ''}`}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : `Place Order • $${total.toFixed(2)}`}
            </button>
          </form>
        </div>

        {/* Order Summary Sidebar */}
        <div className="order-summary-sidebar glass-panel">
          <div className="summary-header">
            <h3>Total</h3>
            <span className="summary-total-large">${total.toFixed(2)}</span>
          </div>
          
          <div className="summary-event-details">
            <h4>{event.title}</h4>
            <p className="summary-venue">{event.venue}</p>
            <p className="summary-date">{event.date}</p>
          </div>

          <div className="summary-line-items">
            <div className="line-item">
              <div className="item-desc">
                <span>Tickets</span>
                <span className="item-subdesc">{section.name} x {tickets}</span>
              </div>
              <span className="item-price">${subtotal.toFixed(2)}</span>
            </div>
            <div className="line-item">
              <span>Service Fee</span>
              <span className="item-price">${serviceFee.toFixed(2)}</span>
            </div>
            <div className="line-item">
              <span>Order Processing Fee</span>
              <span className="item-price">${orderProcessingFee.toFixed(2)}</span>
            </div>
          </div>

          <div className="terms-agreement">
            <input type="checkbox" required id="terms" />
            <label htmlFor="terms">
              I have read and agree to the Terms of Use. All sales are final.
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
