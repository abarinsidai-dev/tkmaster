const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const authMiddleware = require('../middleware/auth');

// @route   GET /api/resale
// @desc    Get all tickets listed for resale
// @access  Public
router.get('/', async (req, res) => {
  try {
    const listings = await Order.find({ isListed: true }).lean();
    res.json(listings.map(o => ({ ...o, id: o._id.toString() })));
  } catch (err) {
    console.error('Resale fetch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/resale/:id/list
// @desc    List a ticket for resale
// @access  Private
router.put('/:id/list', authMiddleware, async (req, res) => {
  try {
    const { resalePrice } = req.body;
    if (!resalePrice || resalePrice <= 0) {
      return res.status(400).json({ error: 'A valid resale price is required.' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Ticket not found' });
    if (order.userId !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });
    if (order.checkedIn) return res.status(400).json({ error: 'Cannot resell a checked-in ticket.' });

    order.isListed = true;
    order.resalePrice = parseFloat(resalePrice);
    const updated = await order.save();
    res.json(updated);
  } catch (err) {
    console.error('List resale error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/resale/:id/unlist
// @desc    Remove a ticket from resale
// @access  Private
router.put('/:id/unlist', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Ticket not found' });
    if (order.userId !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

    order.isListed = false;
    order.resalePrice = null;
    const updated = await order.save();
    res.json(updated);
  } catch (err) {
    console.error('Unlist resale error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/resale/:id/purchase
// @desc    Buy a resale ticket — transfers ownership
// @access  Private
router.post('/:id/purchase', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Ticket not found' });
    if (!order.isListed) return res.status(400).json({ error: 'This ticket is no longer available.' });
    if (order.userId === req.user.id) return res.status(400).json({ error: 'You cannot buy your own ticket.' });

    // Transfer ownership
    order.originalBuyerId = order.userId;
    order.userId = req.user.id;
    order.totalPaid = order.resalePrice;
    order.isListed = false;
    order.resalePrice = null;
    order.checkedIn = false; // Reset check-in for new owner
    order.purchaseDate = new Date();

    const updated = await order.save();
    res.json(updated);
  } catch (err) {
    console.error('Buy resale error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
