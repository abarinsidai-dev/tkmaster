import { Link } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';
import './EventCard.css';

function EventCard({ id, title, image, date, venue, price, isHighDemand, isPlatinum, isSellingFast }) {
  return (
    <Link to={`/event/${id}`} className="event-card animate-fade-in">
      <div className="event-image-container">
        <img src={image} alt={title} className="event-image" />
        <div className="event-price">${price}+</div>
        <div className="card-badges">
          {isHighDemand && <span className="badge badge-warning badge-sm">High Demand</span>}
          {isPlatinum && <span className="badge badge-premium badge-sm">Platinum</span>}
          {isSellingFast && <span className="badge badge-danger badge-sm">Selling Fast</span>}
        </div>
      </div>
      <div className="event-details">
        <h3 className="event-title">{title}</h3>
        <div className="event-info">
          <Calendar size={16} className="info-icon" />
          <span>{date}</span>
        </div>
        <div className="event-info">
          <MapPin size={16} className="info-icon" />
          <span>{venue}</span>
        </div>
        <button className="btn-primary w-full mt-4">Get Tickets</button>
      </div>
    </Link>
  );
}

export default EventCard;
