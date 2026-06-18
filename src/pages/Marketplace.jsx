import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Tag, Calendar, MapPin, ShoppingBag, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Marketplace.css';

function Marketplace() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(null);
  const { currentUser, getAuthHeaders } = useAuth();
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/resale`);
      const data = await res.json();
      setListings(data);
    } catch (err) {
      console.error('Failed to fetch listings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (listingId, eventTitle) => {
    if (!currentUser) {
      alert('Please sign in to purchase tickets.');
      return;
    }

    if (!confirm(`Buy 1 ticket for "${eventTitle}"?`)) return;

    setBuying(listingId);
    try {
      const res = await fetch(`${API_BASE}/api/resale/${listingId}/purchase`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Purchase failed');
      alert('🎉 Ticket purchased! Check your Dashboard.');
      fetchListings();
    } catch (err) {
      alert(err.message);
    } finally {
      setBuying(null);
    }
  };

  return (
    <div className="marketplace-page container animate-fade-in">
      <div className="marketplace-header">
        <div className="marketplace-title-group">
          <ShoppingBag size={32} className="marketplace-icon" />
          <div>
            <h1>Ticket Marketplace</h1>
            <p className="marketplace-subtitle">Buy fan-listed tickets for sold-out events</p>
          </div>
        </div>
        <div className="marketplace-stats">
          <div className="stat-badge">
            <TrendingUp size={16} />
            <span>{listings.length} listing{listings.length !== 1 ? 's' : ''} available</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="marketplace-loading">
          <div className="loading-spinner"></div>
          <p>Browsing listings...</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="marketplace-empty glass-panel">
          <Tag size={48} className="empty-icon" />
          <h3>No tickets listed right now</h3>
          <p>Check back later — fans list tickets here when they can't attend.</p>
          <button className="btn-primary" onClick={() => navigate('/')}>Browse Events</button>
        </div>
      ) : (
        <div className="listings-grid">
          {listings.map(listing => (
            <div key={listing.id || listing._id} className="listing-card glass-panel">
              {listing.eventImage && (
                <div className="listing-image-wrap">
                  <img src={listing.eventImage} alt={listing.eventTitle} className="listing-image" />
                  <div className="listing-badge">Fan Sale</div>
                </div>
              )}
              <div className="listing-body">
                <h3 className="listing-title">{listing.eventTitle}</h3>
                <div className="listing-meta">
                  <span className="listing-meta-item">
                    <Calendar size={14} />
                    {listing.eventDate}
                  </span>
                  <span className="listing-meta-item">
                    <MapPin size={14} />
                    {listing.eventVenue}
                  </span>
                  <span className="listing-meta-item">
                    <Ticket size={14} />
                    {listing.section?.name || 'General Admission'} · {listing.ticketCount} ticket{listing.ticketCount !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="listing-footer">
                  <div className="listing-price">
                    <span className="price-label">Asking Price</span>
                    <span className="price-value">${parseFloat(listing.resalePrice).toFixed(2)}</span>
                  </div>
                  <button
                    className={`btn-primary buy-btn ${buying === (listing.id || listing._id) ? 'loading' : ''}`}
                    onClick={() => handleBuy(listing.id || listing._id, listing.eventTitle)}
                    disabled={buying === (listing.id || listing._id) || listing.userId === currentUser?.id}
                  >
                    {listing.userId === currentUser?.id ? 'Your Listing' : buying === (listing.id || listing._id) ? 'Processing...' : 'Buy Now'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Marketplace;
