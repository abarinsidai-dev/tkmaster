const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema(
  {
    eventId:   { type: String, required: true },
    eventTitle:{ type: String, required: true },
    userId:    { type: String, required: true },
    userEmail: { type: String, required: true },
    userName:  { type: String, required: true },
    notified:  { type: Boolean, default: false },
    position:  { type: Number }
  },
  { timestamps: true }
);

// Compound index: one user per event on the waitlist
waitlistSchema.index({ eventId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Waitlist', waitlistSchema);
