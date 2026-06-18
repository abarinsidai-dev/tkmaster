const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    date: { type: String, required: true }, // Formatted display date e.g. 'Oct 31, 2026 • 8:00 PM'
    dateISO: { type: Date, required: true },
    venue: { type: String, required: true },
    price: { type: Number, required: true },
    category: { 
      type: String, 
      enum: ['concerts', 'sports', 'arts', 'family'],
      required: true 
    },
    image: { type: String },
    description: { type: String },
    isHighDemand: { type: Boolean, default: false },
    isPlatinum: { type: Boolean, default: false },
    isSellingFast: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Map _id to id in JSON output to keep frontend compatible
eventSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model('Event', eventSchema);
