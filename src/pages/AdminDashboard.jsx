import { useState } from 'react';
import { useEvents } from '../context/EventContext';
import { Plus, Edit2, Check, X, Camera, CalendarDays, BarChart3 } from 'lucide-react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useAuth } from '../context/AuthContext';
import AnalyticsCharts from '../components/AnalyticsCharts';
import './AdminDashboard.css';

function AdminDashboard() {
  const { events, addEvent, updateEventPrice } = useEvents();
  const { getAuthHeaders } = useAuth();
  
  const [activeTab, setActiveTab] = useState('events');
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState('');
  const [isScanning, setIsScanning] = useState(true);

  const [newEvent, setNewEvent] = useState({
    title: '',
    venue: '',
    date: '',
    dateISO: '',
    price: 50,
    category: 'concerts',
    image: 'https://images.unsplash.com/photo-1540039155732-611114cb5527?auto=format&fit=crop&q=80',
    isHighDemand: false,
    isPlatinum: false,
    isSellingFast: false,
    description: 'This is a custom event added by the admin.',
  });

  const [sections, setSections] = useState([
    { id: 'sec1', name: 'General Admission', price: 50, color: '#3b82f6' }
  ]);

  const handleAddSection = () => {
    setSections([
      ...sections,
      { id: `sec${sections.length + 1}`, name: '', price: 0, color: '#' + Math.floor(Math.random()*16777215).toString(16) }
    ]);
  };

  const handleSectionChange = (index, field, value) => {
    const updated = [...sections];
    updated[index][field] = field === 'price' ? parseFloat(value) || 0 : value;
    setSections(updated);
  };

  const handleStartEdit = (event) => {
    setEditingId(event.id);
    setEditPrice(event.price.toString());
  };

  const handleSaveEdit = (id) => {
    updateEventPrice(id, editPrice);
    setEditingId(null);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    
    const formattedDate = newEvent.date || new Date(newEvent.dateISO || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
    
    // Sort sections by price descending
    const sortedSections = [...sections].sort((a, b) => b.price - a.price);
    
    addEvent({
      ...newEvent,
      date: formattedDate,
      dateISO: newEvent.dateISO || new Date().toISOString(),
      sections: sortedSections,
      price: sortedSections.length > 0 ? sortedSections[sortedSections.length - 1].price : newEvent.price // base price is cheapest
    });
    
    setIsAddingEvent(false);
    setNewEvent({ ...newEvent, title: '', venue: '', date: '', dateISO: '' });
    setSections([{ id: 'sec1', name: 'General Admission', price: 50, color: '#3b82f6' }]);
  };

  const handleScan = async (result) => {
    if (!result || !result[0]) return;
    const ticketId = result[0].rawValue;
    
    // Prevent double scanning immediately
    if (!isScanning) return;
    setIsScanning(false);
    setScanResult(null);
    setScanError('');

    try {
      const API_BASE = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_BASE}/api/orders/${ticketId}/checkin`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to check in ticket');
      }
      
      setScanResult(`Success! Checked in 1 ticket for ${data.eventTitle}`);
    } catch (err) {
      setScanError(err.message);
    }

    // Allow scanning again after 3 seconds
    setTimeout(() => {
      setIsScanning(true);
      setScanResult(null);
      setScanError('');
    }, 3000);
  };

  return (
    <div className="admin-page container animate-fade-in">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p className="admin-subtitle">Manage events and prices across the platform.</p>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          <CalendarDays size={18} /> Manage Events
        </button>
        <button 
          className={`tab-btn ${activeTab === 'scanner' ? 'active' : ''}`}
          onClick={() => setActiveTab('scanner')}
        >
          <Camera size={18} /> Scan Tickets
        </button>
        <button 
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <BarChart3 size={18} /> Analytics
        </button>
      </div>

      {activeTab === 'events' && (
        <div className="admin-section glass-panel">
          <div className="section-header">
          <h2>Manage Events</h2>
          <button className="btn-primary flex-center" onClick={() => setIsAddingEvent(!isAddingEvent)}>
            <Plus size={16} style={{ marginRight: '0.5rem' }} /> Add New Event
          </button>
        </div>

        {isAddingEvent && (
          <form className="add-event-form" onSubmit={handleAddSubmit}>
            <h3>Create New Event</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Title</label>
                <input required type="text" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} placeholder="e.g. Taylor Swift" />
              </div>
              <div className="form-group">
                <label>Venue</label>
                <input required type="text" value={newEvent.venue} onChange={e => setNewEvent({...newEvent, venue: e.target.value})} placeholder="e.g. Wembley Stadium" />
              </div>
              <div className="form-group">
                <label>Date (ISO Format)</label>
                <input required type="datetime-local" value={newEvent.dateISO} onChange={e => setNewEvent({...newEvent, dateISO: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Base Price ($)</label>
                <input required type="number" min="0" step="0.01" value={newEvent.price} onChange={e => setNewEvent({...newEvent, price: parseFloat(e.target.value)})} />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select value={newEvent.category} onChange={e => setNewEvent({...newEvent, category: e.target.value})}>
                  <option value="concerts">Concerts</option>
                  <option value="sports">Sports</option>
                  <option value="arts">Arts & Theatre</option>
                  <option value="family">Family</option>
                </select>
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input type="text" value={newEvent.image} onChange={e => setNewEvent({...newEvent, image: e.target.value})} />
              </div>
            </div>

            <div className="sections-builder" style={{ margin: '1.5rem 0', background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ margin: 0 }}>Ticket Tiers / Sections</h4>
                <button type="button" className="btn-secondary" onClick={handleAddSection} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                  + Add Tier
                </button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {sections.map((sec, i) => (
                  <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: sec.color }}></div>
                    <input type="text" placeholder="Section Name" required value={sec.name} onChange={e => handleSectionChange(i, 'name', e.target.value)} style={{ flex: 1 }} />
                    <input type="number" placeholder="Price" min="0" step="0.01" required value={sec.price} onChange={e => handleSectionChange(i, 'price', e.target.value)} style={{ width: '100px' }} />
                    {sections.length > 1 && (
                      <button type="button" onClick={() => setSections(sections.filter((_, idx) => idx !== i))} style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer' }}><X size={18} /></button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input type="checkbox" checked={newEvent.isHighDemand} onChange={e => setNewEvent({...newEvent, isHighDemand: e.target.checked})} />
                High Demand
              </label>
              <label className="checkbox-label">
                <input type="checkbox" checked={newEvent.isPlatinum} onChange={e => setNewEvent({...newEvent, isPlatinum: e.target.checked})} />
                Official Platinum
              </label>
              <label className="checkbox-label">
                <input type="checkbox" checked={newEvent.isSellingFast} onChange={e => setNewEvent({...newEvent, isSellingFast: e.target.checked})} />
                Selling Fast
              </label>
            </div>
            
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setIsAddingEvent(false)}>Cancel</button>
              <button type="submit" className="btn-primary">Save Event</button>
            </div>
          </form>
        )}

        <div className="table-responsive">
          <table className="events-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Category</th>
                <th>Date</th>
                <th>Base Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map(event => (
                <tr key={event.id}>
                  <td>
                    <div className="event-cell-info">
                      <span className="event-cell-title">{event.title}</span>
                      <span className="event-cell-venue">{event.venue}</span>
                    </div>
                  </td>
                  <td className="capitalize">{event.category}</td>
                  <td>{event.date.split('•')[0]}</td>
                  <td>
                    {editingId === event.id ? (
                      <div className="price-edit-input">
                        <span>$</span>
                        <input 
                          type="number" 
                          min="0"
                          step="0.01"
                          value={editPrice} 
                          onChange={(e) => setEditPrice(e.target.value)}
                          autoFocus
                        />
                      </div>
                    ) : (
                      <span className="current-price">${event.price.toFixed(2)}</span>
                    )}
                  </td>
                  <td>
                    {editingId === event.id ? (
                      <div className="action-buttons">
                        <button className="icon-btn success" onClick={() => handleSaveEdit(event.id)} title="Save"><Check size={18} /></button>
                        <button className="icon-btn danger" onClick={() => setEditingId(null)} title="Cancel"><X size={18} /></button>
                      </div>
                    ) : (
                      <button className="icon-btn" onClick={() => handleStartEdit(event)} title="Edit Price"><Edit2 size={18} /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {activeTab === 'scanner' && (
        <div className="admin-section glass-panel scanner-section">
          <h2>Ticket Scanner</h2>
          <p>Scan a digital ticket's QR code to mark it as checked-in.</p>
          
          <div className="scanner-container">
            {isScanning ? (
              <Scanner onScan={handleScan} />
            ) : (
              <div className="scanner-cooldown">
                {scanResult && <div className="scan-success"><Check size={32} /> <p>{scanResult}</p></div>}
                {scanError && <div className="scan-error"><X size={32} /> <p>{scanError}</p></div>}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="admin-section glass-panel">
          <div className="section-header">
            <h2>Analytics Dashboard</h2>
          </div>
          <AnalyticsCharts />
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
