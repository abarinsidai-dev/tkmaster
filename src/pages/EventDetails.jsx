import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Info, Plus, Minus, Check, ShieldCheck, Star, ChevronRight } from 'lucide-react';
import { useEvents } from '../context/EventContext';
import EventCard from '../components/EventCard';
import SeatSelector from '../components/SeatSelector';
import './EventDetails.css';

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { events: globalEvents } = useEvents();
  const [event, setEvent] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [ticketCount, setTicketCount] = useState(2);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    const found = globalEvents.find(e => e.id === id);
    if (found) setEvent(found);
  }, [id, globalEvents]);

  if (!event) return <div className="loading-state">Loading event details...</div>;

  const mockSections = [
    { id: 'sec1', name: 'VIP Soundcheck (Green)', price: 489.50, color: '#22c55e' },
    { id: 'sec2', name: 'Premium (Purple)', price: 379.25, color: '#a855f7' },
    { id: 'sec3', name: 'Standard (Orange)', price: 229.66, color: '#f97316' },
    { id: 'sec4', name: 'Value (Blue)', price: 228.75, color: '#3b82f6' },
    { id: 'sec5', name: 'Economy (Red)', price: 193.25, color: '#ef4444' }
  ];

  const handleSectionClick = (section) => {
    if (selectedSection?.id === section.id) {
      setSelectedSection(null);
      setSelectedSeats([]);
    } else {
      setSelectedSection(section);
      setSelectedSeats([]);
    }
  };

  const seatTotal = selectedSeats.reduce((sum, s) => sum + s.price, 0);
  const totalPrice = selectedSeats.length > 0 
    ? seatTotal 
    : (selectedSection?.price || event?.price || 0) * ticketCount;

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setTimeout(() => {
      navigate('/checkout', { 
        state: { 
          event, 
          tickets: selectedSeats.length > 0 ? selectedSeats.length : ticketCount, 
          section: selectedSection || mockSections[3],
          seats: selectedSeats
        } 
      });
    }, 800);
  };

  return (
    <div className="event-details-page animate-fade-in">
      {/* Event Header */}
      <div className="event-hero" style={{ backgroundImage: `linear-gradient(to right, rgba(10,10,11,1) 30%, rgba(10,10,11,0.4)), url(${event.image})` }}>
        <div className="container event-hero-content">
          <div className="event-badges">
            {event.isHighDemand && <span className="badge badge-warning">High Demand</span>}
            {event.isPlatinum && <span className="badge badge-premium">Official Platinum</span>}
            {event.isSellingFast && <span className="badge badge-danger">Selling Fast</span>}
          </div>
          <h1 className="event-title-large">{event.title}</h1>
          <div className="event-meta">
            <div className="meta-item">
              <Calendar size={20} className="meta-icon" />
              <span>{event.date}</span>
            </div>
            <div className="meta-item">
              <MapPin size={20} className="meta-icon" />
              <span>{event.venue}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container event-main-content">
        {/* Seat Map */}
        <div className="seat-map-container glass-panel">
          <div className="seat-map-header">
            <h3>Interactive Seat Map</h3>
            <div className="tooltip-hint">
              <Info size={16} /> Select a section to view tickets
            </div>
          </div>
          
          <div className="extracted-stadium-wrapper">
            <div className="stadium-map-css">
              {/* Economy (Red) */}
              <div className={`section-shape red-left ${selectedSection?.id === 'sec5' ? 'active' : ''}`} onClick={() => handleSectionClick(mockSections[4])}></div>
              <div className={`section-shape red-right ${selectedSection?.id === 'sec5' ? 'active' : ''}`} onClick={() => handleSectionClick(mockSections[4])}></div>
              {/* Value (Blue) */}
              <div className={`section-shape blue-left ${selectedSection?.id === 'sec4' ? 'active' : ''}`} onClick={() => handleSectionClick(mockSections[3])}></div>
              <div className={`section-shape blue-right ${selectedSection?.id === 'sec4' ? 'active' : ''}`} onClick={() => handleSectionClick(mockSections[3])}></div>
              {/* Standard (Orange) */}
              <div className={`section-shape orange-top ${selectedSection?.id === 'sec3' ? 'active' : ''}`} onClick={() => handleSectionClick(mockSections[2])}></div>
              {/* Premium (Purple) */}
              <div className={`section-shape purple-bowl ${selectedSection?.id === 'sec2' ? 'active' : ''}`} onClick={() => handleSectionClick(mockSections[1])}></div>
              {/* VIP Soundcheck (Green) */}
              <div className={`section-shape green-floor ${selectedSection?.id === 'sec1' ? 'active' : ''}`} onClick={() => handleSectionClick(mockSections[0])}>
                <div className="stage-cross-shape">STAGE</div>
              </div>
            </div>
          </div>

          {/* Individual Seat Picker — shown when a section is selected */}
          {selectedSection && (
            <div className="seat-selector-panel">
              <div className="seat-selector-panel-header">
                <div className="seat-panel-indicator" style={{ backgroundColor: selectedSection.color }}></div>
                <h4>{selectedSection.name}</h4>
                <span className="seat-panel-count">{selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''} selected</span>
              </div>
              <SeatSelector
                key={selectedSection.id}
                section={selectedSection}
                selectedSeats={selectedSeats}
                onSeatSelect={setSelectedSeats}
              />
            </div>
          )}
        </div>

        {/* Ticket Selection Sidebar */}
        <div className="ticket-selection-sidebar glass-panel">
          <h3>Buy Tickets</h3>
          
          <div className="ticket-counter">
            <label>Number of Tickets</label>
            <div className="counter-controls">
              <button 
                className="counter-btn" 
                onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                disabled={ticketCount <= 1}
              >
                <Minus size={16} />
              </button>
              <span className="count-display">{ticketCount}</span>
              <button 
                className="counter-btn" 
                onClick={() => setTicketCount(Math.min(8, ticketCount + 1))}
                disabled={ticketCount >= 8}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="sections-list">
            <h4>Available Sections</h4>
            {mockSections.map((sec) => (
              <div 
                key={sec.id} 
                className={`section-item ${selectedSection?.id === sec.id ? 'selected' : ''}`}
                onClick={() => setSelectedSection(sec)}
              >
                <div className="section-color-indicator" style={{ backgroundColor: sec.color }}></div>
                <div className="section-details">
                  <span className="section-name">{sec.name}</span>
                  <span className="section-price">${sec.price.toFixed(2)}</span>
                </div>
                {selectedSection?.id === sec.id && <Check size={18} className="text-success" />}
              </div>
            ))}
          </div>

          <div className="checkout-summary">
            {selectedSeats.length > 0 ? (
              <>
                <div className="summary-row">
                  <span>{selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''} selected</span>
                  <span className="total-price">${seatTotal.toFixed(2)}</span>
                </div>
                <div className="selected-seats-list">
                  {selectedSeats.map(s => (
                    <span key={s.id} className="seat-tag">Row {s.row} · #{s.number}</span>
                  ))}
                </div>
              </>
            ) : (
              <div className="summary-row">
                <span>Total ({ticketCount} tickets)</span>
                <span className="total-price">${((selectedSection?.price || event.price) * ticketCount).toFixed(2)}</span>
              </div>
            )}
            <button 
              className={`btn-primary checkout-btn ${isCheckingOut ? 'loading' : ''}`}
              onClick={handleCheckout}
              disabled={!selectedSection && selectedSeats.length === 0}
            >
              {isCheckingOut ? 'Processing...' : 'Go to Checkout'}
            </button>
          </div>
        </div>
      </div>

      {/* About & Similar Events */}
      <div className="container event-lower-content">
        {/* Event Description */}
        <div className="event-about glass-panel">
          <h3>About This Event</h3>
          <p className="event-description">{event.description} Experience an unforgettable night filled with energy, spectacular light shows, and the songs you know and love. This is a strictly standing event — general admission floor and reserved seating available. All ages welcome.</p>
          
          <div className="event-info-tags">
            <span className="info-tag"><Calendar size={14} /> {event.date}</span>
            <span className="info-tag"><MapPin size={14} /> {event.venue}</span>
            <span className="info-tag capitalize"><Star size={14} /> {event.category}</span>
          </div>

          {/* Fan Guarantee */}
          <div className="fan-guarantee">
            <ShieldCheck size={36} className="guarantee-icon" />
            <div className="guarantee-text">
              <h4>Fan Guarantee</h4>
              <p>All tickets purchased through Ticketmaster are 100% authentic and backed by our Fan Guarantee. If your event is cancelled, you'll get a full refund.</p>
            </div>
          </div>
        </div>

        {/* Similar Events */}
        <div className="similar-events-section">
          <div className="similar-events-header">
            <h3>More Like This</h3>
            <button className="view-all-link" onClick={() => navigate(`/search?category=${event.category}`)}>
              View All <ChevronRight size={16} />
            </button>
          </div>
          <div className="similar-events-grid">
            {globalEvents
              .filter(e => e.id !== event.id && e.category === event.category)
              .slice(0, 3)
              .map(e => <EventCard key={e.id} {...e} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetails;
