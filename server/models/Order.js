const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    row: { type: String, required: true },
    number: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const sectionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    color: { type: String },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    eventTitle: { type: String, required: true },
    eventDate: { type: String, required: true },
    eventVenue: { type: String, required: true },
    eventImage: { type: String },
    section: { type: sectionSchema },
    seats: [seatSchema],
    ticketCount: { type: Number, required: true, default: 1 },
    totalPaid: { type: Number, required: true },
    purchaseDate: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Map _id to id in JSON output
orderSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Order', orderSchema);
