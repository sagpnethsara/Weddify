const express = require('express')
const { getStats, getPendingVendors, updateVendorApproval } = require('../controllers/adminController')
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

module.exports = router
