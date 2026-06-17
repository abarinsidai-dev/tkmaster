import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Calendar, MapPin, Clock, QrCode } from 'lucide-react';
import { useEvents } from '../context/EventContext';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const { events: globalEvents } = useEvents();
  const [activeTab, setActiveTab] = useState('upcoming');

  // We'll just use the first global event as a purchased ticket for demonstration
  const purchasedEvent = globalEvents[0];

  return (
    <div className="dashboard-page container animate-fade-in">
      <div className="dashboard-header">
        <h1>My Account</h1>
        <div className="dashboard-tabs">
          <button 
            className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            My Tickets
          </button>
          <button 
            className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            Past Events
          </button>
          <button 
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        {activeTab === 'upcoming' && (
          <div className="tickets-section">
            <h2>Upcoming Events</h2>
            
            <div className="mobile-ticket-mockup glass-panel">
              <div className="ticket-event-hero" style={{ backgroundImage: `linear-gradient(to right, rgba(10,10,11,1) 10%, rgba(10,10,11,0.2)), url(${purchasedEvent.image})` }}>
                <div className="ticket-hero-content">
                  <span className="badge badge-premium badge-sm mb-2">Verified Fan</span>
                  <h3>{purchasedEvent.title}</h3>
                </div>
              </div>
              
              <div className="ticket-details-body">
                <div className="ticket-info-grid">
                  <div className="info-item">
                    <Calendar size={16} className="info-icon" />
                    <span>{purchasedEvent.date.split('•')[0]}</span>
                  </div>
                  <div className="info-item">
                    <Clock size={16} className="info-icon" />
                    <span>{purchasedEvent.date.split('•')[1]}</span>
                  </div>
                  <div className="info-item col-span-2">
                    <MapPin size={16} className="info-icon" />
                    <span>{purchasedEvent.venue}</span>
                  </div>
                </div>

                <div className="seat-info">
                  <div className="seat-box">
                    <span className="seat-label">SEC</span>
                    <span className="seat-value">102</span>
                  </div>
                  <div className="seat-box">
                    <span className="seat-label">ROW</span>
                    <span className="seat-value">A</span>
                  </div>
                  <div className="seat-box">
                    <span className="seat-label">SEAT</span>
                    <span className="seat-value">14</span>
                  </div>
                </div>

                <div className="qr-section">
                  <div className="qr-placeholder">
                    <QrCode size={120} />
                    <div className="scanning-line"></div>
                  </div>
                  <p className="qr-hint">Hold near reader</p>
                  <div className="wallet-buttons">
                    <button className="wallet-btn apple-wallet">Add to Apple Wallet</button>
                    <button className="wallet-btn google-wallet">Save to Google Pay</button>
                  </div>
                </div>
              </div>
              
              <div className="ticket-actions">
                <button className="btn-secondary">Transfer</button>
                <button className="btn-secondary">Sell</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'past' && (
          <div className="empty-state">
            <Ticket size={48} className="empty-icon" />
            <h3>No past events</h3>
            <p>You haven't attended any events yet.</p>
            <button className="btn-primary mt-4" onClick={() => navigate('/search')}>Browse Events</button>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-section glass-panel">
            <h3>Account Settings</h3>
            <p>Mock settings panel. In a real application, you could manage your profile, payment methods, and notifications here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
