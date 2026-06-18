const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const authMiddleware = require('../middleware/auth');

// @route   GET /api/orders/mine
// @desc    Get orders for the logged in user
// @access  Private
router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ purchaseDate: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Get my orders error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
  try {
    const orderData = {
      ...req.body,
      userId: req.user.id
    };
    
    const newOrder = new Order(orderData);
    const savedOrder = await newOrder.save();
    
    res.status(201).json(savedOrder);
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/orders/:id/checkin
// @desc    Mark an order/ticket as checked in
// @access  Private (Admin only conceptually, but simply auth'd here)
router.put('/:id/checkin', authMiddleware, async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (order.checkedIn) {
      return res.status(400).json({ error: 'Ticket has already been scanned and used!' });
    }

    order.checkedIn = true;
    const updatedOrder = await order.save();
    
    res.json(updatedOrder);
  } catch (err) {
    console.error('Checkin error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
