const express = require('express')
const { getPlan, updatePlan } = require('../controllers/coupleController')
const { auth, requireRole } = require('../middleware/auth')

const router = express.Router()

router.get('/plan', auth, requireRole('couple'), getPlan)
router.put('/plan', auth, requireRole('couple'), updatePlan)

module.exports = router
