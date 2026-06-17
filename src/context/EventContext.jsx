import { createContext, useContext, useState, useEffect } from 'react';
import { mockEvents as defaultEvents } from '../data/mockData';

const EventContext = createContext();

export function useEvents() {
  return useContext(EventContext);
}

export function EventProvider({ children }) {
  const [events, setEvents] = useState(() => {
    const savedEvents = localStorage.getItem('tickt_events');
    if (savedEvents) {
      try {
        return JSON.parse(savedEvents);
      } catch (e) {
        console.error("Failed to parse events from local storage", e);
        return defaultEvents;
      }
    }
    return defaultEvents;
  });

  useEffect(() => {
    localStorage.setItem('tickt_events', JSON.stringify(events));
  }, [events]);

  const addEvent = (newEvent) => {
    const eventWithId = {
      ...newEvent,
      id: Date.now().toString(), // simple ID generation
    };
    setEvents(prev => [eventWithId, ...prev]);
  };

  const updateEventPrice = (id, newPrice) => {
    setEvents(prev => prev.map(event => 
      event.id === id ? { ...event, price: parseFloat(newPrice) } : event
    ));
  };

  const updateEvent = (id, updatedData) => {
    setEvents(prev => prev.map(event =>
      event.id === id ? { ...event, ...updatedData } : event
    ));
  };

  return (
    <EventContext.Provider value={{ events, addEvent, updateEventPrice, updateEvent }}>
      {children}
    </EventContext.Provider>
  );
}
