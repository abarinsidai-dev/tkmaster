import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Calendar, MapPin, Clock, QrCode, User, Bell, CreditCard, LogOut } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
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
        orders.sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate));
        setMyTickets(orders);
      } catch (error) {
        console.error('Error fetching tickets:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchMyTickets();
  }, [currentUser]);

  const now = new Date();

  // Split tickets into upcoming vs past based on eventDate
  const upcomingTickets = myTickets.filter(order => {
    if (!order.eventDate) return true;
    // eventDate format: "Jun 17, 2026 • 8:00 PM" — parse ISO part if available
    const datePart = order.eventDate.split('•')[0].trim();
    return new Date(datePart) >= now;
  });

  const pastTickets = myTickets.filter(order => {
    if (!order.eventDate) return false;
    const datePart = order.eventDate.split('•')[0].trim();
    return new Date(datePart) < now;
  });

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const TicketCard = ({ order }) => (
    <div className="mobile-ticket-mockup glass-panel">
      <div
        className="ticket-event-hero"
        style={{ backgroundImage: `linear-gradient(to right, rgba(10,10,11,1) 10%, rgba(10,10,11,0.2)), url(${order.eventImage})` }}
      >
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
            <span className="seat-value">
              {order.seats?.length > 0
                ? order.seats.map(s => `${s.row}${s.number}`).join(', ')
                : 'Gen Adm'}
            </span>
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
  );

  const EmptyState = ({ label }) => (
    <div className="empty-state">
      <Ticket size={48} className="empty-icon" />
      <h3>{label}</h3>
      <p>Looks like you haven't bought any tickets yet.</p>
      <button className="btn-primary mt-4" onClick={() => navigate('/search')}>Browse Events</button>
    </div>
  );

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
        {/* ── Upcoming Tickets ── */}
        {activeTab === 'upcoming' && (
          <div className="tickets-section">
            <h2>Upcoming Events</h2>
            {loading ? (
              <p>Loading your tickets...</p>
            ) : upcomingTickets.length === 0 ? (
              <EmptyState label="No upcoming events" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {upcomingTickets.map(order => <TicketCard key={order.id} order={order} />)}
              </div>
            )}
          </div>
        )}

        {/* ── Past Events ── */}
        {activeTab === 'past' && (
          <div className="tickets-section">
            <h2>Past Events</h2>
            {loading ? (
              <p>Loading...</p>
            ) : pastTickets.length === 0 ? (
              <div className="empty-state">
                <Ticket size={48} className="empty-icon" />
                <h3>No past events</h3>
                <p>Events you've attended will show up here.</p>
                <button className="btn-primary mt-4" onClick={() => navigate('/search')}>Browse Events</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {pastTickets.map(order => <TicketCard key={order.id} order={order} />)}
              </div>
            )}
          </div>
        )}

        {/* ── Settings ── */}
        {activeTab === 'settings' && (
          <div className="settings-section">
            {/* Profile Card */}
            <div className="settings-card glass-panel">
              <div className="settings-card-header">
                <User size={20} />
                <h3>Profile</h3>
              </div>
              <div className="settings-field">
                <label>Display Name</label>
                <div className="settings-value">{currentUser?.displayName || '—'}</div>
              </div>
              <div className="settings-field">
                <label>Email Address</label>
                <div className="settings-value">{currentUser?.email}</div>
              </div>
              <div className="settings-field">
                <label>Account Created</label>
                <div className="settings-value">
                  {currentUser?.metadata?.creationTime
                    ? new Date(currentUser.metadata.creationTime).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                    : '—'}
                </div>
              </div>
            </div>

            {/* Notifications Card */}
            <div className="settings-card glass-panel">
              <div className="settings-card-header">
                <Bell size={20} />
                <h3>Notifications</h3>
              </div>
              <div className="settings-toggle-row">
                <div>
                  <p className="toggle-label">Email Confirmations</p>
                  <p className="toggle-desc">Receive order and ticket confirmations by email</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-knob" />
                </label>
              </div>
              <div className="settings-toggle-row">
                <div>
                  <p className="toggle-label">Event Reminders</p>
                  <p className="toggle-desc">Get reminded 24 hours before your event</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-knob" />
                </label>
              </div>
              <div className="settings-toggle-row">
                <div>
                  <p className="toggle-label">Marketing Emails</p>
                  <p className="toggle-desc">Personalized event recommendations and offers</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" />
                  <span className="toggle-knob" />
                </label>
              </div>
            </div>

            {/* Payment Card */}
            <div className="settings-card glass-panel">
              <div className="settings-card-header">
                <CreditCard size={20} />
                <h3>Payment Methods</h3>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                No saved payment methods. Your card details are not stored — you'll enter them fresh at checkout.
              </p>
            </div>

            {/* Sign Out */}
            <button className="settings-signout-btn" onClick={handleLogout}>
              <LogOut size={18} />
              Sign Out of Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
