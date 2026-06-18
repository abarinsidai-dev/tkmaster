const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

// @route   GET /api/events
// @desc    Get all events
// @access  Public
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ dateISO: 1 });
    res.json(events);
  } catch (err) {
    console.error('Get events error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/events
// @desc    Create an event
// @access  Public (should be Admin but making it public for demo)
router.post('/', async (req, res) => {
  try {
    const newEvent = new Event(req.body);
    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (err) {
    console.error('Create event error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/events/:id
// @desc    Update an event (e.g. price)
// @access  Public (should be Admin)
router.put('/:id', async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true } // return updated document
    );
    
    if (!updatedEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(updatedEvent);
  } catch (err) {
    console.error('Update event error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
