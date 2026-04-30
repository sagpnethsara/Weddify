const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema(
  {
    coupleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // MongoDB-registered vendor (optional — null for catalogue vendors)
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    // CSV catalogue vendor ID (e.g. "py_123") — set when vendorId is null
    vendorExternalId: {
      type: String,
      default: ''
    },
    // Snapshot name so bookings display correctly regardless of vendor type
    vendorName: {
      type: String,
      default: ''
    },
    date: {
      type: Date,
      required: true
    },
    package: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    notes: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'cancelled'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Booking', bookingSchema)
