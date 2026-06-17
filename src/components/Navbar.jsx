import { Link } from 'react-router-dom';
import { Search, User, Menu, Ticket } from 'lucide-react';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container container">
        <Link to="/" className="navbar-brand">
          <Ticket className="brand-icon" size={28} />
          <span className="brand-text">Ticketmaster</span>
        </Link>

        <div className="navbar-search hidden-mobile">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              placeholder="Search by artist, event or venue" 
              className="search-input"
            />
          </div>
        </div>

        <div className="navbar-links hidden-mobile">
          <Link to="/search?category=concerts" className="nav-link">Concerts</Link>
          <Link to="/search?category=sports" className="nav-link">Sports</Link>
          <Link to="/search?category=arts" className="nav-link">Arts & Theater</Link>
        </div>

        <div className="navbar-actions">
          <Link to="/admin" className="btn-icon hidden-mobile" title="Admin Dashboard">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
          </Link>
          <Link to="/dashboard" className="btn-icon hidden-mobile" style={{ textDecoration: 'none' }}>
            <User size={20} />
            <span>My Tickets</span>
          </Link>
          <button className="btn-icon mobile-menu-btn">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
