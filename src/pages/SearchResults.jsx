import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import EventCard from '../components/EventCard';
import { mockCategories } from '../data/mockData';
import { useEvents } from '../context/EventContext';
import { Filter, SlidersHorizontal } from 'lucide-react';
import './SearchResults.css';

function SearchResults() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || 'all';
  const { events: globalEvents } = useEvents();

  const [events, setEvents] = useState(globalEvents);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [dateFilter, setDateFilter] = useState('any');
  const [maxPrice, setMaxPrice] = useState(500);

  useEffect(() => {
    let filtered = globalEvents;
    
    // Text search
    if (initialQuery) {
      filtered = filtered.filter(e => 
        e.title.toLowerCase().includes(initialQuery.toLowerCase()) || 
        e.venue.toLowerCase().includes(initialQuery.toLowerCase())
      );
    }
    
    // Category filter
    if (activeCategory !== 'all') {
      filtered = filtered.filter(e => e.category === activeCategory);
    }

    // Price filter
    filtered = filtered.filter(e => e.price <= maxPrice);

    // Date filter
    const today = new Date('2026-06-17T00:00:00Z'); // Fixed today's date based on mock data
    
    if (dateFilter !== 'any') {
      filtered = filtered.filter(e => {
        const eventDate = new Date(e.dateISO);
        
        if (dateFilter === 'today') {
          return eventDate.toDateString() === today.toDateString();
        } 
        else if (dateFilter === 'weekend') {
          // Weekend means Friday, Saturday, or Sunday of the current week
          const dayOfWeek = eventDate.getDay();
          // Assuming simple logic for demo: it's a weekend date
          return dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
        } 
        else if (dateFilter === 'month') {
          const thirtyDaysFromNow = new Date(today);
          thirtyDaysFromNow.setDate(today.getDate() + 30);
          return eventDate >= today && eventDate <= thirtyDaysFromNow;
        }
        return true;
      });
    }

    setEvents(filtered);
  }, [initialQuery, activeCategory, dateFilter, maxPrice]);

  return (
    <div className="search-results-page container animate-fade-in">
      <div className="search-header">
        <h1 className="search-title">
          {initialQuery ? `Search results for "${initialQuery}"` : 'Browse Events'}
        </h1>
        <p className="search-count">{events.length} events found</p>
      </div>

      <div className="search-layout">
        {/* Filters Sidebar */}
        <aside className="search-sidebar">
          <div className="sidebar-header">
            <h3>Filters</h3>
            <SlidersHorizontal size={20} />
          </div>
          
          <div className="filter-group">
            <h4>Categories</h4>
            <div className="filter-options">
              <label className="radio-label">
                <input 
                  type="radio" 
                  name="category" 
                  value="all"
                  checked={activeCategory === 'all'}
                  onChange={() => setActiveCategory('all')}
                />
                All Events
              </label>
              {mockCategories.map(cat => (
                <label key={cat.id} className="radio-label">
                  <input 
                    type="radio" 
                    name="category" 
                    value={cat.id}
                    checked={activeCategory === cat.id}
                    onChange={() => setActiveCategory(cat.id)}
                  />
                  {cat.name}
                </label>
              ))}
            </div>
          </div>
          
          <div className="filter-group mt-6">
            <h4>Date Range</h4>
            <div className="filter-options">
              <label className="radio-label">
                <input type="radio" name="date" checked={dateFilter === 'any'} onChange={() => setDateFilter('any')} /> 
                Any Date
              </label>
              <label className="radio-label">
                <input type="radio" name="date" checked={dateFilter === 'today'} onChange={() => setDateFilter('today')} /> 
                Today
              </label>
              <label className="radio-label">
                <input type="radio" name="date" checked={dateFilter === 'weekend'} onChange={() => setDateFilter('weekend')} /> 
                This Weekend
              </label>
              <label className="radio-label">
                <input type="radio" name="date" checked={dateFilter === 'month'} onChange={() => setDateFilter('month')} /> 
                Next 30 Days
              </label>
            </div>
          </div>

          <div className="filter-group mt-6">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4>Max Price</h4>
              <span>${maxPrice}</span>
            </div>
            <input 
              type="range" 
              min="50" 
              max="500" 
              step="10"
              value={maxPrice} 
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              style={{ width: '100%', marginTop: '0.5rem', accentColor: 'var(--accent-primary)' }}
            />
          </div>
        </aside>

        {/* Results Grid */}
        <main className="search-results-main">
          {events.length > 0 ? (
            <div className="events-grid">
              {events.map((event) => (
                <EventCard key={event.id} {...event} />
              ))}
            </div>
          ) : (
            <div className="no-results">
              <Filter size={48} className="no-results-icon" />
              <h3>No events found</h3>
              <p>Try adjusting your search or filters to find what you're looking for.</p>
              <button 
                className="btn-secondary mt-4"
                onClick={() => {
                  setActiveCategory('all');
                  setDateFilter('any');
                  setMaxPrice(500);
                }}
              >
                Clear all filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default SearchResults;
