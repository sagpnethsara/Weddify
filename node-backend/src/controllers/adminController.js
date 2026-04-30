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

module.exports = {
  getStats,
  getPendingVendors,
  updateVendorApproval
}
