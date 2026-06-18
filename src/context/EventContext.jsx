import { createContext, useContext, useState, useEffect } from 'react';

const EventContext = createContext();

export function useEvents() {
  return useContext(EventContext);
}

export function EventProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    fetch(`${API_BASE}/api/events`)
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching events:', err);
        setLoading(false);
      });
  }, []);

  const addEvent = async (newEvent) => {
    try {
      const res = await fetch(`${API_BASE}/api/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent)
      });
      if (!res.ok) throw new Error('Failed to create event');
      const savedEvent = await res.json();
      setEvents(prev => [...prev, savedEvent]);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateEventPrice = async (id, newPrice) => {
    try {
      const res = await fetch(`${API_BASE}/api/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: parseFloat(newPrice) })
      });
      if (!res.ok) throw new Error('Failed to update event');
      const updatedEvent = await res.json();
      setEvents(prev => prev.map(e => e.id === id ? updatedEvent : e));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateEvent = async (id, updatedData) => {
    try {
      const res = await fetch(`${API_BASE}/api/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (!res.ok) throw new Error('Failed to update event');
      const updatedEvent = await res.json();
      setEvents(prev => prev.map(e => e.id === id ? updatedEvent : e));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return (
    <EventContext.Provider value={{ events, loading, addEvent, updateEventPrice, updateEvent }}>
      {children}
    </EventContext.Provider>
  );
}
