const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['couple', 'vendor', 'admin'],
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      default: ''
    },
    groomName: String,
    brideName: String,
    weddingDate: Date,
    businessName: String,
    ownerName: String,
    category: String,
    location: String,
    experience: Number,
    description: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved'
    },
    rating: {
      type: Number,
      default: 0
    },
    verified: {
      type: Boolean,
      default: false
    },
    priceTier: {
      type: String,
      default: 'Mid-Range'
    },
    price: {
      type: Number,
      default: 0
    },
    weddingsCompleted: {
      type: Number,
      default: 30
    },
    responseTime: {
      type: Number,
      default: 4
    },
    numberOfPackages: {
      type: Number,
      default: 3
    },
    socialFollowers: {
      type: Number,
      default: 1500
    },
    repeatClientRate: {
      type: Number,
      default: 0.3
    },
    budget: {
      type: Number,
      default: 0
    },
    guests: {
      type: [
        {
          name: { type: String, required: true },
          side: { type: String, enum: ['Bride', 'Groom'], required: true },
          status: { type: String, enum: ['Pending', 'Confirmed'], default: 'Pending' }
        }
      ],
      default: []
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('User', userSchema)
