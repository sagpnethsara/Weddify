const express = require('express')
const { getVendors, getVendorById, updateVendor, myProfile, getRecommendedVendors } = require('../controllers/vendorController')
const { auth } = require('../middleware/auth')

const router = express.Router()

router.get('/', getVendors)
router.get('/recommended', getRecommendedVendors)
router.get('/my/profile', auth, myProfile)
router.get('/:id', getVendorById)
router.put('/:id', auth, updateVendor)

module.exports = router
