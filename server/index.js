require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes   = require('./routes/auth');
const eventRoutes  = require('./routes/events');
const orderRoutes  = require('./routes/orders');

const app = express();

// ── Middleware ────────────────────────────────────────────
// Allow the frontend URL from environment variable, or allow all origins as a fallback
const allowedOrigins = process.env.CLIENT_URL || '*';
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────
app.use('/api/auth',   authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/orders', orderRoutes);

// ── Health check ──────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// ── Connect & Listen ──────────────────────────────────────
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
