const express = require('express')
const { 
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
} = require('../controllers/adminController')
const { auth, requireRole } = require('../middleware/auth')

const router = express.Router()

router.get('/stats', auth, requireRole('admin'), getStats)
router.get('/vendors/pending', auth, requireRole('admin'), getPendingVendors)
router.put('/vendors/:id/approve', auth, requireRole('admin'), (req, res) => {
  req.params.action = 'approve'
  return updateVendorApproval(req, res)
})
router.put('/vendors/:id/reject', auth, requireRole('admin'), (req, res) => {
  req.params.action = 'reject'
  return updateVendorApproval(req, res)
})

router.get('/users', auth, requireRole('admin'), getUsers)
router.get('/vendors', auth, requireRole('admin'), getVendors)
router.get('/bookings', auth, requireRole('admin'), getBookings)
router.delete('/users/:id', auth, requireRole('admin'), deleteUser)
router.delete('/vendors/:id', auth, requireRole('admin'), deleteUser)
router.delete('/bookings/:id', auth, requireRole('admin'), deleteBooking)
router.put('/users/:id', auth, requireRole('admin'), updateUser)
router.put('/vendors/:id', auth, requireRole('admin'), updateUser)
router.put('/bookings/:id', auth, requireRole('admin'), updateBooking)

module.exports = router
