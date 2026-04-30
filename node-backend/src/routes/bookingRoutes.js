const express = require('express')
const { createBooking, getMyBookings, updateBookingStatus } = require('../controllers/bookingController')
const { auth } = require('../middleware/auth')

const router = express.Router()

router.post('/', auth, createBooking)
router.get('/my', auth, getMyBookings)
router.put('/:id/cancel', auth, (req, res) => {
  req.params.action = 'cancel'
  return updateBookingStatus(req, res)
})
router.put('/:id/accept', auth, (req, res) => {
  req.params.action = 'accept'
  return updateBookingStatus(req, res)
})
router.put('/:id/decline', auth, (req, res) => {
  req.params.action = 'decline'
  return updateBookingStatus(req, res)
})

module.exports = router
