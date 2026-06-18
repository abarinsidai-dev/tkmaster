import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './VenueMap.css';

// Fix leaflet's default icon path issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// A lookup of known venues to their real coordinates
// Falls back to a sensible default if the venue isn't found
const VENUE_COORDS = {
  'Madison Square Garden': [40.7505, -73.9934],
  'Wembley Stadium': [51.5560, -0.2796],
  'Staples Center': [34.0430, -118.2673],
  'Crypto.com Arena': [34.0430, -118.2673],
  'O2 Arena': [51.5033, 0.0032],
  'Barclays Center': [40.6828, -73.9754],
  'United Center': [41.8807, -87.6742],
  'Chase Center': [37.7679, -122.3876],
  'MetLife Stadium': [40.8135, -74.0745],
  'SoFi Stadium': [33.9535, -118.3392],
  'Radio City Music Hall': [40.7599, -73.9799],
  'Carnegie Hall': [40.7651, -73.9800],
  'Royal Albert Hall': [51.5009, -0.1774],
};

function getCoords(venue) {
  if (!venue) return [51.505, -0.09];
  // Try to match a partial venue name
  const key = Object.keys(VENUE_COORDS).find(k =>
    venue.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes(venue.toLowerCase())
  );
  return key ? VENUE_COORDS[key] : [40.7505, -73.9934]; // Default to MSG
}

export default function VenueMap({ venue, eventTitle }) {
  const coords = getCoords(venue);

  return (
    <div className="venue-map-wrapper">
      <div className="venue-map-header">
        <h3>📍 Venue Location</h3>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="directions-btn"
        >
          Get Directions →
        </a>
      </div>
      <MapContainer
        center={coords}
        zoom={15}
        scrollWheelZoom={false}
        className="leaflet-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <Circle center={coords} radius={100} pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.15 }} />
        <Marker position={coords}>
          <Popup>
            <strong>{venue}</strong><br />
            {eventTitle}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
