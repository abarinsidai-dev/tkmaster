import { useState } from 'react';
import './SeatSelector.css';

// Generate a simple seating grid per section
function generateSeats(section, rows = 5, seatsPerRow = 10) {
  const seatData = [];
  // Random unavailable seats
  const unavailableCount = Math.floor(Math.random() * 15) + 5;
  const unavailableSeats = new Set();
  while (unavailableSeats.size < unavailableCount) {
    unavailableSeats.add(Math.floor(Math.random() * rows * seatsPerRow));
  }

  let seatIndex = 0;
  for (let r = 0; r < rows; r++) {
    const rowLetter = String.fromCharCode(65 + r); // A, B, C...
    for (let s = 1; s <= seatsPerRow; s++) {
      seatData.push({
        id: `${section.id}-${rowLetter}${s}`,
        row: rowLetter,
        number: s,
        available: !unavailableSeats.has(seatIndex),
        price: section.price + (r < 2 ? 30 : r < 4 ? 15 : 0), // front rows cost more
      });
      seatIndex++;
    }
  }
  return seatData;
}

function SeatSelector({ section, onSeatSelect, selectedSeats }) {
  const [seats] = useState(() => generateSeats(section));
  const rows = [...new Set(seats.map(s => s.row))];

  const toggleSeat = (seat) => {
    if (!seat.available) return;
    const alreadySelected = selectedSeats.some(s => s.id === seat.id);
    if (alreadySelected) {
      onSeatSelect(selectedSeats.filter(s => s.id !== seat.id));
    } else {
      onSeatSelect([...selectedSeats, seat]);
    }
  };

  return (
    <div className="seat-selector animate-fade-in">
      <div className="seat-selector-header">
        <div className="stage-label">— STAGE —</div>
      </div>

      <div className="seat-grid">
        {rows.map(row => (
          <div key={row} className="seat-row">
            <span className="row-label">{row}</span>
            <div className="seats-in-row">
              {seats.filter(s => s.row === row).map(seat => {
                const isSelected = selectedSeats.some(s => s.id === seat.id);
                return (
                  <button
                    key={seat.id}
                    className={`seat-btn ${!seat.available ? 'unavailable' : ''} ${isSelected ? 'selected' : ''}`}
                    style={{ '--seat-color': section.color }}
                    onClick={() => toggleSeat(seat)}
                    disabled={!seat.available}
                    title={seat.available ? `Row ${seat.row}, Seat ${seat.number} — $${seat.price}` : 'Unavailable'}
                  >
                    {seat.number}
                  </button>
                );
              })}
            </div>
            <span className="row-label">{row}</span>
          </div>
        ))}
      </div>

      <div className="seat-legend">
        <div className="legend-item"><span className="legend-dot available" style={{ '--seat-color': section.color }}></span> Available</div>
        <div className="legend-item"><span className="legend-dot selected"></span> Selected</div>
        <div className="legend-item"><span className="legend-dot unavailable-dot"></span> Taken</div>
      </div>
    </div>
  );
}

export default SeatSelector;
