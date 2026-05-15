const User = require('../models/User')
const Booking = require('../models/Booking')

const getStats = async (_req, res) => {
  try {
    const [totalUsers, totalVendors, totalBookings, approvedVendors] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: 'vendor' }),
      Booking.countDocuments({}),
      User.countDocuments({ role: 'vendor', status: 'approved' })
    ])

    const categoriesAgg = await User.aggregate([
      { $match: { role: 'vendor', status: 'approved' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { _id: 0, category: '$_id', count: 1 } }
    ])

    return res.json({ totalUsers, totalVendors, totalBookings, approvedVendors, categories: categoriesAgg })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch stats' })
  }
}

const getPendingVendors = async (_req, res) => {
  try {
    const vendors = await User.find({ role: 'vendor', status: 'pending' }).select('-passwordHash')
    return res.json({ vendors })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch pending vendors' })
  }
}

const updateVendorApproval = async (req, res) => {
  try {
    const { id, action } = req.params
    const vendor = await User.findOne({ _id: id, role: 'vendor' })

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' })
    }

    if (action === 'approve') {
      vendor.status = 'approved'
      vendor.verified = true
    }

    if (action === 'reject') {
      vendor.status = 'rejected'
      vendor.verified = false
    }

    await vendor.save()
    return res.json({ vendor })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update vendor status' })
  }
}

const getUsers = async (_req, res) => {
  try {
    const users = await User.find({ role: 'couple' }).select('-passwordHash')
    return res.json(users)
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching users' })
  }
}

const getVendors = async (_req, res) => {
  try {
    const vendors = await User.find({ role: 'vendor' }).select('-passwordHash')
    return res.json(vendors)
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching vendors' })
  }
}

const getBookings = async (_req, res) => {
  try {
    const bookings = await Booking.find().populate('coupleId vendorId', 'groomName brideName ownerName businessName email')
    return res.json(bookings)
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching bookings' })
  }
}

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    if (user.role === 'vendor') {
      await Booking.deleteMany({ vendorId: req.params.id })
    } else {
      await Booking.deleteMany({ coupleId: req.params.id })
    }
    return res.json({ message: 'Deleted' })
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting' })
  }
}

const deleteBooking = async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id)
    return res.json({ message: 'Booking deleted' })
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting booking' })
  }
}

const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: 'Error updating user' });
  }
}

const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    return res.json(booking);
  } catch (error) {
    return res.status(500).json({ message: 'Error updating booking' });
  }
}

module.exports = {
  getStats,
  getPendingVendors,
  updateVendorApproval,
  getUsers,
  getVendors,
  getBookings,
  deleteUser,
  deleteBooking,
  updateUser,
  updateBooking
}
