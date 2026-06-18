import { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc,
  setDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { mockEvents as defaultEvents } from '../data/mockData';

const EventContext = createContext();

export function useEvents() {
  return useContext(EventContext);
}

export function EventProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Seed Firestore with mock data if the collection is empty
  const seedFirestore = async (data) => {
    console.log('Seeding Firestore with default events...');
    for (const event of data) {
      await setDoc(doc(db, 'events', String(event.id)), event);
    }
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'events'), async (snapshot) => {
      if (snapshot.empty) {
        // No events in Firestore yet, seed with mock data
        await seedFirestore(defaultEvents);
      } else {
        const firestoreEvents = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        }));
        setEvents(firestoreEvents);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const addEvent = async (newEvent) => {
    const eventWithId = {
      ...newEvent,
      id: Date.now().toString(),
    };
    await setDoc(doc(db, 'events', eventWithId.id), eventWithId);
  };

  const updateEventPrice = async (id, newPrice) => {
    const eventRef = doc(db, 'events', String(id));
    await updateDoc(eventRef, { price: parseFloat(newPrice) });
  };

  const updateEvent = async (id, updatedData) => {
    const eventRef = doc(db, 'events', String(id));
    await updateDoc(eventRef, updatedData);
  };

  return (
    <EventContext.Provider value={{ events, loading, addEvent, updateEventPrice, updateEvent }}>
      {children}
    </EventContext.Provider>
  );
}
