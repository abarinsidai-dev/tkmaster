const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const authMiddleware = require('../middleware/auth');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const { sendReceiptEmail } = require('../utils/email');

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
    
    // FOMO Engine: Emit a live purchase notification to all connected clients
    const io = req.app.get('io');
    if (io) {
      // Send only the first name for privacy
      const firstName = req.user.name ? req.user.name.split(' ')[0] : 'Someone';
      io.emit('new_purchase', {
        name: firstName,
        eventTitle: savedOrder.eventTitle
      });
    }

    // Send receipt email asynchronously
    if (req.user && req.user.email) {
      sendReceiptEmail(savedOrder, req.user.email);
    }

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

// @route   GET /api/orders/:id/pdf
// @desc    Download ticket as a PDF
// @access  Private
router.get('/:id/pdf', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    if (order.userId !== req.user.id && req.user.email !== 'admin@tickt.com') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Create a PDF document
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    
    // Set response headers to trigger download
    res.setHeader('Content-disposition', `attachment; filename=tickt-${order._id}.pdf`);
    res.setHeader('Content-type', 'application/pdf');
    
    // Pipe the PDF into the response
    doc.pipe(res);
    
    // Design the ticket
    doc.rect(40, 40, 515, 250).fillAndStroke('#f9fafb', '#e5e7eb');
    
    doc.fillColor('#0a0a0b').fontSize(24).text('tickt', 60, 60, { width: 400, align: 'left' });
    doc.fontSize(10).text('OFFICIAL ADMISSION TICKET', 60, 90);
    
    doc.moveDown();
    doc.fontSize(20).text(order.eventTitle, 60, 120);
    doc.fontSize(12).fillColor('#4b5563').text(`${order.eventDate} • ${order.eventVenue}`, 60, 150);
    
    doc.moveDown();
    const sectionName = order.section ? order.section.name : 'General Admission';
    doc.fontSize(14).fillColor('#0a0a0b').text(`Section: ${sectionName}`, 60, 180);
    doc.fontSize(12).text(`Tickets: ${order.ticketCount}`, 60, 200);

    // Generate QR Code buffer
    const qrDataUrl = await QRCode.toDataURL(order._id.toString(), { margin: 1, width: 150 });
    // Strip the prefix to get the raw base64 string
    const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, "");
    const imgBuffer = Buffer.from(base64Data, 'base64');
    
    doc.image(imgBuffer, 380, 80, { width: 150 });
    doc.fontSize(8).fillColor('#9ca3af').text(`ID: ${order._id}`, 380, 240, { width: 150, align: 'center' });
    
    doc.end();

  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ error: 'Server error generating PDF' });
  }
});

module.exports = router;
