import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Calendar, MapPin, Clock, User, Bell, CreditCard, LogOut, CheckCircle, Download, Tag, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const { currentUser, logout, getAuthHeaders } = useAuth();
  const [orders, setOrders] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [resalePrice, setResalePrice] = useState('');
  const [loading, setLoading] = useState(true);

  const API_BASE = import.meta.env.VITE_API_URL || '';

  const handleDownloadPDF = async (ticketId, eventTitle) => {
    try {
      const response = await fetch(`${API_BASE}/api/orders/${ticketId}/pdf`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) throw new Error('Failed to generate PDF');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${eventTitle.replace(/\s+/g, '_')}_Ticket.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      alert('Error downloading ticket. Please try again.');
    }
  };

  useEffect(() => {
    async function fetchData() {
      if (!currentUser) return;
      try {
        const [ordersRes, waitlistRes] = await Promise.all([
          fetch(`${API_BASE}/api/orders/mine`, { headers: getAuthHeaders() }),
          fetch(`${API_BASE}/api/waitlist/mine`, { headers: getAuthHeaders() })
        ]);
        if (ordersRes.ok) setOrders(await ordersRes.json());
        if (waitlistRes.ok) setWaitlist(await waitlistRes.json());
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [currentUser]);

  const handleListForResale = async (ticketId) => {
    if (!resalePrice || isNaN(resalePrice) || Number(resalePrice) <= 0) {
      alert('Please enter a valid price');
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/api/resale/${ticketId}/list`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ resalePrice })
      });
      if (response.ok) {
        alert('Ticket listed for resale!');
        const updated = await response.json();
        setOrders(orders.map(o => o._id === ticketId || o.id === ticketId ? updated : o));
        setSelectedOrder(updated);
        setResalePrice('');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to list ticket');
      }
    } catch (err) {
      console.error(err);
      alert('Server error');
    }
  };

  const handleUnlist = async (ticketId) => {
    try {
      const response = await fetch(`${API_BASE}/api/resale/${ticketId}/unlist`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        alert('Ticket removed from resale!');
        const updated = await response.json();
        setOrders(orders.map(o => o._id === ticketId || o.id === ticketId ? updated : o));
        setSelectedOrder(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const now = new Date();

  // Split tickets into upcoming vs past based on eventDate
  const upcomingTickets = orders.filter(order => {
    if (!order.eventDate) return true;
    const datePart = order.eventDate.split('•')[0].trim();
    return new Date(datePart) >= now;
  });

  const pastTickets = orders.filter(order => {
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
          <div className="qr-placeholder" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <QRCodeSVG value={order.id} size={120} />
            <button 
              className="btn-secondary mt-2" 
              style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              onClick={() => handleDownloadPDF(order.id, order.eventTitle)}
            >
              <Download size={14} /> Save PDF
            </button>
            {order.checkedIn && (
              <div className="checked-in-badge" style={{ marginTop: '0.25rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 'bold' }}>
                <CheckCircle size={16} /> Checked In
              </div>
            )}
          </div>
          <p className="qr-hint">Hold near reader</p>
          <div className="wallet-buttons">
            <button className="wallet-btn apple-wallet">Add to Apple Wallet</button>
            <button className="wallet-btn google-wallet">Save to Google Pay</button>
          </div>
        </div>
      </div>

      <div className="ticket-actions">
        <button className="btn-secondary" onClick={() => setSelectedOrder(order)}>Manage Ticket</button>
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

      {/* Waitlist Section */}
      {waitlist.length > 0 && activeTab === 'upcoming' && (
        <div className="dashboard-content" style={{ marginTop: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={24} className="text-accent" /> Your Waitlists
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {waitlist.map(entry => (
              <div key={entry._id} className="settings-card glass-panel" style={{ borderLeft: '4px solid var(--accent)' }}>
                <h3 style={{ margin: '0 0 0.5rem' }}>{entry.eventTitle}</h3>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={14} /> Joined {new Date(entry.createdAt).toLocaleDateString()}
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>
                  You are position <strong>#{entry.position}</strong> in line. We'll email you if tickets become available!
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ticket Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content ticket-modal glass-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Manage Ticket</h2>
              <button className="close-btn" onClick={() => setSelectedOrder(null)}><X size={20} /></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="ticket-card" style={{ cursor: 'default', transform: 'none' }}>
                <div className="ticket-main">
                  <h3>{selectedOrder.eventTitle}</h3>
                  <div className="ticket-meta">
                    <div className="ticket-meta-item">
                      <Calendar size={16} className="text-accent" />
                      <span>{selectedOrder.eventDate}</span>
                    </div>
                    <div className="ticket-meta-item">
                      <MapPin size={16} className="text-accent" />
                      <span>{selectedOrder.eventVenue}</span>
                    </div>
                  </div>
                </div>
                <div className="seat-info">
                  <div className="seat-box">
                    <span className="seat-label">SEC</span>
                    <span className="seat-value">{selectedOrder.section?.name?.split(' ')[0] || 'GA'}</span>
                  </div>
                  <div className="seat-box">
                    <span className="seat-label">TICKETS</span>
                    <span className="seat-value">{selectedOrder.ticketCount}</span>
                  </div>
                </div>
              </div>

              <div className="resale-section" style={{ padding: '1.5rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <h3 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Tag size={18} className="text-accent" /> Resell Ticket
                </h3>
                {selectedOrder.isListed ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Listed for <strong className="text-accent">${selectedOrder.resalePrice}</strong></p>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Ticket is currently available in the Marketplace.</p>
                    </div>
                    <button className="btn-secondary" onClick={() => handleUnlist(selectedOrder.id || selectedOrder._id)}>Cancel Listing</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input 
                      type="number" 
                      placeholder="Price ($)" 
                      value={resalePrice} 
                      onChange={(e) => setResalePrice(e.target.value)}
                      style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'white', padding: '0.75rem', borderRadius: '8px', width: '100px' }}
                    />
                    <button className="btn-primary" onClick={() => handleListForResale(selectedOrder.id || selectedOrder._id)}>List for Resale</button>
                  </div>
                )}
                {selectedOrder.checkedIn && <p style={{ color: 'var(--error)', fontSize: '0.8rem', marginTop: '0.5rem' }}>Cannot resell a checked-in ticket.</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
