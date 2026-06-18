const express = require('express');
const router = express.Router();
const Waitlist = require('../models/Waitlist');
const authMiddleware = require('../middleware/auth');
const { sendReceiptEmail } = require('../utils/email');

// @route   POST /api/waitlist/:eventId
// @desc    Join the waitlist for an event
// @access  Private
router.post('/:eventId', authMiddleware, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { eventTitle } = req.body;
    const { id: userId, email: userEmail, name: userName } = req.user;

    // Check if already on the list
    const existing = await Waitlist.findOne({ eventId, userId });
    if (existing) {
      return res.status(400).json({ error: 'You are already on the waitlist for this event.' });
    }

    // Get position (count of people ahead)
    const count = await Waitlist.countDocuments({ eventId });

    const entry = new Waitlist({
      eventId,
      eventTitle,
      userId,
      userEmail,
      userName: userName || 'Fan',
      position: count + 1
    });

    await entry.save();
    res.status(201).json({ message: 'Added to waitlist!', position: count + 1 });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'You are already on the waitlist.' });
    }
    console.error('Waitlist join error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/waitlist/mine
// @desc    Get all waitlist entries for the logged-in user
// @access  Private
router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const entries = await Waitlist.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    console.error('Waitlist fetch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/waitlist/:eventId
// @desc    Leave the waitlist for an event
// @access  Private
router.delete('/:eventId', authMiddleware, async (req, res) => {
  try {
    await Waitlist.findOneAndDelete({ eventId: req.params.eventId, userId: req.user.id });
    res.json({ message: 'Removed from waitlist.' });
  } catch (err) {
    console.error('Waitlist delete error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
