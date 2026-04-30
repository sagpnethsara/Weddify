const Booking = require('../models/Booking')
const User = require('../models/User')

const createBooking = async (req, res) => {
  try {
    const { vendorId, date, package: packageName, amount, notes, vendorName: bodyVendorName } = req.body
    const isCatalogueVendor = String(vendorId).startsWith('py_')

    let resolvedVendorName = bodyVendorName || ''

    if (isCatalogueVendor) {
      // Catalogue (CSV) vendor — store the external ID and snapshot name
      const booking = await Booking.create({
        coupleId: req.user._id,
        vendorId: null,
        vendorExternalId: String(vendorId),
        vendorName: resolvedVendorName,
        date,
        package: packageName,
        amount,
        notes,
        status: 'pending'
      })
      return res.status(201).json({ booking })
    }

    const vendor = await User.findOne({ _id: vendorId, role: 'vendor' })
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' })
    }

    const booking = await Booking.create({
      coupleId: req.user._id,
      vendorId,
      vendorName: vendor.businessName || '',
      date,
      package: packageName,
      amount,
      notes,
      status: 'pending'
    })

    return res.status(201).json({ booking })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create booking' })
  }
}

const getMyBookings = async (req, res) => {
  try {
    let bookings

    if (req.user.role === 'couple') {
      bookings = await Booking.find({ coupleId: req.user._id }).populate('vendorId', 'businessName')
    } else if (req.user.role === 'vendor') {
      bookings = await Booking.find({ vendorId: req.user._id }).populate('coupleId', 'groomName brideName')
    } else {
      bookings = await Booking.find({}).limit(100)
    }

    const normalized = bookings.map((booking) => {
      const obj = booking.toObject()
      return {
        ...obj,
        vendorName: booking.vendorId?.businessName || obj.vendorName || obj.vendorExternalId || 'Catalogue Vendor',
        coupleName: booking.coupleId ? `${booking.coupleId.groomName || ''} ${booking.coupleId.brideName || ''}`.trim() : undefined
      }
    })

    return res.json({ bookings: normalized })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch bookings' })
  }
}

const updateBookingStatus = async (req, res) => {
  try {
    const { id, action } = req.params
    const booking = await Booking.findById(id)

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' })
    }

    if (action === 'cancel') {
      if (req.user.role !== 'couple' || String(booking.coupleId) !== String(req.user._id)) {
        return res.status(403).json({ message: 'Forbidden' })
      }
      booking.status = 'cancelled'
    }

    if (action === 'accept' || action === 'decline') {
      if (req.user.role !== 'vendor' || String(booking.vendorId) !== String(req.user._id)) {
        return res.status(403).json({ message: 'Forbidden' })
      }
      booking.status = action === 'accept' ? 'accepted' : 'declined'
    }

    await booking.save()
    return res.json({ booking })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update booking' })
  }
}

module.exports = {
  createBooking,
  getMyBookings,
  updateBookingStatus
}
