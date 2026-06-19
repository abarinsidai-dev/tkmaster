import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, Menu, Moon, Sun, LogOut, LogIn, X, Settings, Home, Music, Trophy, Palette } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import './Navbar.css';

const ADMIN_EMAIL = 'admin@tickt.com';

function Navbar() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');
  const navigate = useNavigate();

  const isAdmin = currentUser?.email === ADMIN_EMAIL;

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
    navigate('/');
  };

  const handleNavSearch = (e) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/search?q=${encodeURIComponent(navSearch.trim())}`);
      setNavSearch('');
      setMobileOpen(false);
    }
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container container">
          <Link to="/" className="navbar-brand" onClick={closeMobile}>
            <img src="/logo.svg" alt="Ticketmaster" className="brand-logo" />
            <span className="brand-text">Ticketmaster</span>
          </Link>

          {/* Desktop search */}
          <form className="navbar-search hidden-mobile" onSubmit={handleNavSearch}>
            <div className="search-input-wrapper">
              <Search className="search-icon" size={18} />
              <input
                type="text"
                placeholder="Search by artist, event or venue"
                className="search-input"
                value={navSearch}
                onChange={(e) => setNavSearch(e.target.value)}
              />
            </div>
          </form>

          {/* Desktop nav links */}
          <div className="navbar-links hidden-mobile">
            <Link to="/search?category=Concerts" className="nav-link">Concerts</Link>
            <Link to="/search?category=Sports" className="nav-link">Sports</Link>
            <Link to="/search?category=Arts" className="nav-link">Arts & Theater</Link>
            <Link to="/marketplace" className="nav-link" style={{ color: 'var(--accent)', fontWeight: 600 }}>Marketplace</Link>
          </div>

          <div className="navbar-actions">
            <button className="btn-icon" onClick={toggleTheme} title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {currentUser ? (
              <>
                {isAdmin && (
                  <Link to="/admin" className="btn-icon hidden-mobile" title="Admin Dashboard">
                    <Settings size={20} />
                  </Link>
                )}
                <Link to="/dashboard" className="btn-icon hidden-mobile" style={{ textDecoration: 'none' }}>
                  <User size={20} />
                  <span>My Tickets</span>
                </Link>
                <button className="btn-icon hidden-mobile" onClick={handleLogout} title="Sign Out">
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <button className="btn-primary navbar-signin-btn hidden-mobile" onClick={() => setShowAuthModal(true)}>
                <LogIn size={16} /> Sign In
              </button>
            )}

            <button className="btn-icon mobile-menu-btn" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="mobile-overlay" onClick={closeMobile} />
      )}

      {/* Mobile Drawer */}
      <div className={`mobile-drawer ${mobileOpen ? 'open' : ''}`}>
        <div className="mobile-drawer-header">
          <Link to="/" className="navbar-brand" onClick={closeMobile}>
            <img src="/logo.svg" alt="Ticketmaster" className="brand-logo" />
            <span className="brand-text">Ticketmaster</span>
          </Link>
          <button className="btn-icon" onClick={closeMobile} aria-label="Close menu">
            <X size={24} />
          </button>
        </div>

        {/* Mobile Search */}
        <form className="mobile-search-form" onSubmit={handleNavSearch}>
          <div className="search-input-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search events, artists, venues..."
              className="search-input"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
            />
          </div>
        </form>

        <nav className="mobile-nav-links">
          <Link to="/" className="mobile-nav-link" onClick={closeMobile}>
            <Home size={18} /> Home
          </Link>
          <Link to="/search?category=concerts" className="mobile-nav-link" onClick={closeMobile}>
            <Music size={18} /> Concerts
          </Link>
          <Link to="/search?category=sports" className="mobile-nav-link" onClick={closeMobile}>
            <Trophy size={18} /> Sports
          </Link>
          <Link to="/search?category=arts" className="mobile-nav-link" onClick={closeMobile}>
            <Palette size={18} /> Arts &amp; Theater
          </Link>
        </nav>

        <div className="mobile-drawer-divider" />

        <div className="mobile-drawer-actions">
          {currentUser ? (
            <>
              <Link to="/dashboard" className="mobile-nav-link" onClick={closeMobile}>
                <User size={18} /> My Tickets
              </Link>
              {isAdmin && (
                <Link to="/admin" className="mobile-nav-link" onClick={closeMobile}>
                  <Settings size={18} /> Admin Dashboard
                </Link>
              )}
              <button className="mobile-nav-link mobile-signout-btn" onClick={handleLogout}>
                <LogOut size={18} /> Sign Out
              </button>
            </>
          ) : (
            <button
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
              onClick={() => { setShowAuthModal(true); closeMobile(); }}
            >
              <LogIn size={16} /> Sign In
            </button>
          )}

          <button className="mobile-theme-btn" onClick={toggleTheme}>
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          </button>
        </div>
      </div>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
}

export default Navbar;
