import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Music, Trophy, Palette, Users, Zap, Star, ArrowRight } from 'lucide-react';
import EventCard from '../components/EventCard';
import { mockCategories } from '../data/mockData';
import { useEvents } from '../context/EventContext';
import './Home.css';

const CATEGORY_ICONS = {
  concerts: Music,
  sports: Trophy,
  arts: Palette,
  family: Users,
};

function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { events } = useEvents();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };


  const featuredEvent = events.find(e => e.isPlatinum && e.isHighDemand) || events[0];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="container hero-content">
          <h1 className="hero-title animate-fade-in">Let There Be Live</h1>
          <p className="hero-subtitle animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Your next best night out is waiting. Find tickets for concerts, sports, arts and more.
          </p>
          
          <form className="hero-search-form animate-fade-in" style={{ animationDelay: '0.2s' }} onSubmit={handleSearch}>
            <div className="hero-search-input-wrapper">
              <Search className="hero-search-icon" size={24} />
              <input 
                type="text" 
                placeholder="Search for artists, venues, and events" 
                className="hero-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="btn-primary hero-search-btn">Search</button>
            </div>
          </form>


        </div>
      </section>

      {/* Featured Event Spotlight */}
      {featuredEvent && (
        <section className="featured-section container">
          <div
            className="featured-event-card"
            style={{ backgroundImage: `linear-gradient(to right, rgba(10,10,11,0.95) 40%, rgba(10,10,11,0.3)), url(${featuredEvent.image})` }}
            onClick={() => navigate(`/event/${featuredEvent.id}`)}
          >
            <div className="featured-content">
              <div className="featured-label">
                <Zap size={14} /> Featured Event
              </div>
              <h2 className="featured-title">{featuredEvent.title}</h2>
              <p className="featured-venue">{featuredEvent.date} · {featuredEvent.venue}</p>
              <div className="featured-badges">
                {featuredEvent.isHighDemand && <span className="badge badge-warning badge-sm">High Demand</span>}
                {featuredEvent.isPlatinum && <span className="badge badge-premium badge-sm">Official Platinum</span>}
              </div>
              <button className="btn-primary featured-cta">
                Get Tickets <ArrowRight size={16} />
              </button>
            </div>
            <div className="featured-price-tag">
              <span className="from-text">From</span>
              <span className="price-large">${featuredEvent.price}</span>
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section className="categories-section container">
        <h2 className="section-title">Browse by Category</h2>
        <div className="categories-grid">
          {mockCategories.map((category) => {
            const Icon = CATEGORY_ICONS[category.id] || Star;
            return (
              <div 
                key={category.id} 
                className={`category-card category-${category.id}`}
                onClick={() => navigate(`/search?category=${category.id}`)}
              >
                <div className="category-icon-wrapper">
                  <Icon size={32} />
                </div>
                <h3>{category.name}</h3>
              </div>
            );
          })}
        </div>
      </section>

      {/* Trending Events Section */}
      <section className="trending-section container">
        <div className="section-header">
          <h2 className="section-title">Trending Near You</h2>
          <button className="btn-secondary" onClick={() => navigate('/search')}>View All</button>
        </div>
        <div className="events-grid">
          {events.slice(0, 4).map((event) => (
            <EventCard key={event.id} {...event} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;

