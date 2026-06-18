require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes   = require('./routes/auth');
const eventRoutes  = require('./routes/events');
const orderRoutes  = require('./routes/orders');
const aiRoutes     = require('./routes/ai');

const app = express();
const server = http.createServer(app);

// Allow the frontend URL from environment variable, or allow all origins as a fallback
const allowedOrigins = process.env.CLIENT_URL || '*';
app.use(cors({ origin: allowedOrigins }));

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  }
});

// ── In-Memory Seat Locks ──────────────────────────────────
// Structure: { eventId: { seatId: { socketId, timestamp } } }
const lockedSeats = {};

io.on('connection', (socket) => {
  console.log('🔗 Client connected:', socket.id);

  // When a user views an event, send them the current locked seats
  socket.on('join_event', (eventId) => {
    socket.join(eventId);
    const eventLocks = lockedSeats[eventId] || {};
    socket.emit('initial_locks', eventLocks);
  });

  // Handle seat lock
  socket.on('lock_seat', ({ eventId, seatId }) => {
    if (!lockedSeats[eventId]) lockedSeats[eventId] = {};
    
    // Check if already locked by someone else
    if (lockedSeats[eventId][seatId] && lockedSeats[eventId][seatId].socketId !== socket.id) {
      socket.emit('lock_failed', { seatId, reason: 'Already locked' });
      return;
    }

    lockedSeats[eventId][seatId] = { socketId: socket.id, timestamp: Date.now() };
    io.to(eventId).emit('seat_locked', { seatId, socketId: socket.id });
  });

  // Handle seat unlock
  socket.on('unlock_seat', ({ eventId, seatId }) => {
    if (lockedSeats[eventId] && lockedSeats[eventId][seatId]) {
      // Only the socket that locked it can unlock it
      if (lockedSeats[eventId][seatId].socketId === socket.id) {
        delete lockedSeats[eventId][seatId];
        io.to(eventId).emit('seat_unlocked', { seatId });
      }
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
    // Find and clear any locks held by this socket
    for (const eventId in lockedSeats) {
      for (const seatId in lockedSeats[eventId]) {
        if (lockedSeats[eventId][seatId].socketId === socket.id) {
          delete lockedSeats[eventId][seatId];
          io.to(eventId).emit('seat_unlocked', { seatId });
        }
      }
    }
  });
});

// ── Middleware ────────────────────────────────────────────
app.use(express.json());

// ── Routes ────────────────────────────────────────────────
app.use('/api/auth',   authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/recommend', aiRoutes);

// ── Health check ──────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// ── Connect & Listen ──────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
