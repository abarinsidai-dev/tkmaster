import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './InteractiveMap.css';

export default function InteractiveMap({ eventId, section, selectedSeats, onSeatToggle }) {
  const [lockedSeats, setLockedSeats] = useState({});
  const [socket, setSocket] = useState(null);

  // Generate a mock seat layout for the section (e.g., 5 rows, 10 seats each)
  const rows = ['A', 'B', 'C', 'D', 'E'];
  const seatsPerRow = 10;

  useEffect(() => {
    // Connect to the WebSocket server
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const newSocket = io(API_BASE);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join_event', eventId);
    });

    newSocket.on('initial_locks', (locks) => {
      setLockedSeats(locks);
    });

    newSocket.on('seat_locked', ({ seatId, socketId }) => {
      setLockedSeats((prev) => ({
        ...prev,
        [seatId]: { socketId }
      }));
    });

    newSocket.on('seat_unlocked', ({ seatId }) => {
      setLockedSeats((prev) => {
        const updated = { ...prev };
        delete updated[seatId];
        return updated;
      });
    });

    newSocket.on('lock_failed', ({ seatId, reason }) => {
      console.warn(`Failed to lock seat ${seatId}: ${reason}`);
      onSeatToggle(null); // Force deselect on frontend
    });

    return () => {
      newSocket.disconnect();
    };
  }, [eventId]);

  const handleSeatClick = (row, number) => {
    const seatId = `${section.id}-${row}-${number}`;
    const isLocked = lockedSeats[seatId];
    const isSelected = selectedSeats.some(s => s.id === seatId);

    if (isLocked && isLocked.socketId !== socket?.id) {
      // Seat is locked by someone else
      return;
    }

    const seatData = {
      id: seatId,
      row,
      number,
      price: section.price // Basic price
    };

    if (isSelected) {
      // Unlock
      socket?.emit('unlock_seat', { eventId, seatId });
      onSeatToggle(seatData, false);
    } else {
      // Lock
      socket?.emit('lock_seat', { eventId, seatId });
      onSeatToggle(seatData, true);
    }
  };

  return (
    <div className="interactive-map-container">
      <div className="stage-indicator">STAGE</div>
      
      <svg viewBox="0 0 500 300" className="stadium-svg">
        {rows.map((row, rowIndex) => (
          <g key={row} transform={`translate(50, ${50 + rowIndex * 40})`}>
            <text x="-20" y="15" className="row-label">{row}</text>
            {Array.from({ length: seatsPerRow }).map((_, seatIndex) => {
              const number = seatIndex + 1;
              const seatId = `${section.id}-${row}-${number}`;
              const isLockedByOther = lockedSeats[seatId] && lockedSeats[seatId].socketId !== socket?.id;
              const isSelected = selectedSeats.some(s => s.id === seatId);
              
              let seatClass = 'seat-available';
              if (isLockedByOther) seatClass = 'seat-locked';
              else if (isSelected) seatClass = 'seat-selected';

              return (
                <circle
                  key={number}
                  cx={seatIndex * 40}
                  cy="10"
                  r="12"
                  className={`seat ${seatClass}`}
                  onClick={() => handleSeatClick(row, number)}
                />
              );
            })}
          </g>
        ))}
      </svg>
      
      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-dot available"></span> Available
        </div>
        <div className="legend-item">
          <span className="legend-dot selected"></span> Your Selection
        </div>
        <div className="legend-item">
          <span className="legend-dot locked"></span> Taken
        </div>
      </div>
    </div>
  );
}
