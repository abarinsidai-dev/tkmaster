import { Link } from 'react-router-dom';
import { Ticket, Globe, MessageCircle, Camera, Play } from 'lucide-react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <Ticket className="brand-icon" size={24} />
            <span>Ticketmaster</span>
          </Link>
          <p className="footer-description">
            Your trusted source for live events, concerts, sports, and theater tickets. Experience the magic live.
          </p>
          <div className="footer-socials">
            <a href="#" className="social-link"><Globe size={20} /></a>
            <a href="#" className="social-link"><MessageCircle size={20} /></a>
            <a href="#" className="social-link"><Camera size={20} /></a>
            <a href="#" className="social-link"><Play size={20} /></a>
          </div>
        </div>

        <div className="footer-links">
          <div className="footer-column">
            <h4>Discover</h4>
            <Link to="/search?category=concerts">Concerts</Link>
            <Link to="/search?category=sports">Sports</Link>
            <Link to="/search?category=arts">Arts & Theater</Link>
            <Link to="/search?category=family">Family</Link>
          </div>
          <div className="footer-column">
            <h4>About Us</h4>
            <a href="#">Who We Are</a>
            <a href="#">Careers</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Use</a>
          </div>
          <div className="footer-column">
            <h4>Help & Support</h4>
            <a href="#">Help Center</a>
            <a href="#">Sell Tickets</a>
            <a href="#">Refunds</a>
            <a href="#">Contact Us</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Ticketmaster Clone. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
