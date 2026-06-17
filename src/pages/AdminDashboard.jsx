import { useState } from 'react';
import { useEvents } from '../context/EventContext';
import { mockCategories } from '../data/mockData';
import { Plus, Edit2, Check, X } from 'lucide-react';
import './AdminDashboard.css';

function AdminDashboard() {
  const { events, addEvent, updateEventPrice } = useEvents();
  
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editPrice, setEditPrice] = useState('');

  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    dateISO: '',
    venue: '',
    price: 100,
    category: 'concerts',
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=800&q=80',
    isHighDemand: false,
    isPlatinum: false,
    isSellingFast: false,
    description: 'This is a custom event added by the admin.',
  });

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
    
    // Auto-generate a formatted date based on ISO if it's missing (for simplicity in this mock)
    const formattedDate = newEvent.date || new Date(newEvent.dateISO || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
    
    addEvent({
      ...newEvent,
      date: formattedDate,
      dateISO: newEvent.dateISO || new Date().toISOString(),
    });
    
    setIsAddingEvent(false);
    // Reset form
    setNewEvent({ ...newEvent, title: '', venue: '', date: '', dateISO: '' });
  };

  return (
    <div className="admin-page container animate-fade-in">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p className="admin-subtitle">Manage events and prices across the platform.</p>
      </div>

      {/* Events Table */}
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
                  {mockCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input type="text" value={newEvent.image} onChange={e => setNewEvent({...newEvent, image: e.target.value})} />
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
    </div>
  );
}

export default AdminDashboard;
