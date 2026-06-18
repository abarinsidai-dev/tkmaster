require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./models/Event');

const mockEvents = [
  {
    title: 'The Weeknd: After Hours Til Dawn Tour',
    date: 'Jun 17, 2026 • 8:00 PM',
    dateISO: new Date('2026-06-17T20:00:00'),
    venue: 'SoFi Stadium, Inglewood, CA',
    price: 150,
    category: 'concerts',
    image: 'https://images.unsplash.com/photo-1540039155732-6847350357a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    description: 'Experience the stadium tour of the year with The Weeknd.',
    isHighDemand: true
  },
  {
    title: 'Los Angeles Lakers vs. Golden State Warriors',
    date: 'Jun 20, 2026 • 7:30 PM',
    dateISO: new Date('2026-06-20T19:30:00'),
    venue: 'Crypto.com Arena, Los Angeles, CA',
    price: 120,
    category: 'sports',
    image: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    description: 'Western Conference rivalry game.',
    isPlatinum: true
  },
  {
    title: 'Hamilton (Touring)',
    date: 'Jul 05, 2026 • 2:00 PM',
    dateISO: new Date('2026-07-05T14:00:00'),
    venue: 'Hollywood Pantages Theatre, Los Angeles, CA',
    price: 85,
    category: 'arts',
    image: 'https://images.unsplash.com/photo-1507676184212-d0330a156f97?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    description: 'The story of America then, told by America now.'
  },
  {
    title: 'Coldplay: Music Of The Spheres Tour',
    date: 'Jul 10, 2026 • 7:00 PM',
    dateISO: new Date('2026-07-10T19:00:00'),
    venue: 'Rose Bowl, Pasadena, CA',
    price: 95,
    category: 'concerts',
    image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    description: 'Join Coldplay for a visually stunning stadium experience.',
    isSellingFast: true
  },
  {
    title: 'Cirque du Soleil - O',
    date: 'Aug 10, 2026 • 7:00 PM',
    dateISO: new Date('2026-08-10T19:00:00'),
    venue: 'Bellagio Hotel and Casino, Las Vegas, NV',
    price: 110,
    category: 'arts',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    description: 'An aquatic masterpiece of surrealism and theatrical romance.'
  },
  {
    title: 'Taylor Swift | The Eras Tour',
    date: 'Sep 14, 2026 • 6:30 PM',
    dateISO: new Date('2026-09-14T18:30:00'),
    venue: 'Allegiant Stadium, Las Vegas, NV',
    price: 250,
    category: 'concerts',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    description: 'A journey through all of Taylor\'s musical eras.',
    isHighDemand: true,
    isPlatinum: true
  }
];

const seedDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI is not set in .env');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing events
    await Event.deleteMany({});
    console.log('🗑️  Cleared existing events');

    // Insert mock events
    await Event.insertMany(mockEvents);
    console.log('🌱 Successfully seeded events');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedDB();
