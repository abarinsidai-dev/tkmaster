import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Calendar, MapPin, Clock, QrCode } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [myTickets, setMyTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyTickets() {
      if (!currentUser) return;
      try {
        const q = query(collection(db, 'orders'), where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        const orders = [];
        querySnapshot.forEach((doc) => {
          orders.push({ id: doc.id, ...doc.data() });
        });
        // Sort by purchaseDate descending (newest first)
        orders.sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate));
        setMyTickets(orders);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMyTickets();
  }, [currentUser]);

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
            
            {loading ? (
              <p>Loading your tickets...</p>
            ) : myTickets.length === 0 ? (
              <div className="empty-state">
                <Ticket size={48} className="empty-icon" />
                <h3>No tickets found</h3>
                <p>Looks like you haven't bought any tickets yet.</p>
                <button className="btn-primary mt-4" onClick={() => navigate('/search')}>Browse Events</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {myTickets.map(order => (
                  <div key={order.id} className="mobile-ticket-mockup glass-panel">
                    <div className="ticket-event-hero" style={{ backgroundImage: `linear-gradient(to right, rgba(10,10,11,1) 10%, rgba(10,10,11,0.2)), url(${order.eventImage})` }}>
                      <div className="ticket-hero-content">
                        <span className="badge badge-premium badge-sm mb-2">Verified Fan</span>
                        <h3>{order.eventTitle}</h3>
                      </div>
                    </div>
                    
                    <div className="ticket-details-body">
                      <div className="ticket-info-grid">
                        <div className="info-item">
                          <Calendar size={16} className="info-icon" />
                          <span>{order.eventDate?.split('•')[0] || order.eventDate}</span>
                        </div>
                        <div className="info-item">
                          <Clock size={16} className="info-icon" />
                          <span>{order.eventDate?.split('•')[1] || ''}</span>
                        </div>
                        <div className="info-item col-span-2">
                          <MapPin size={16} className="info-icon" />
                          <span>{order.eventVenue}</span>
                        </div>
                      </div>

                      <div className="seat-info">
                        <div className="seat-box">
                          <span className="seat-label">SEC</span>
                          <span className="seat-value">{order.section?.name?.split(' ')[0] || 'GA'}</span>
                        </div>
                        <div className="seat-box">
                          <span className="seat-label">TICKETS</span>
                          <span className="seat-value">{order.ticketCount}</span>
                        </div>
                        <div className="seat-box">
                          <span className="seat-label">SEATS</span>
                          <span className="seat-value">{order.seats?.length > 0 ? order.seats.map(s => `${s.row}${s.number}`).join(', ') : 'Gen Adm'}</span>
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
                ))}
              </div>
            )}
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
