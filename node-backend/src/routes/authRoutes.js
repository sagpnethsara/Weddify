const express = require('express')
const { registerCouple, registerVendor, login, me, logout } = require('../controllers/authController')
const { auth } = require('../middleware/auth')

const router = express.Router()

router.post('/register/couple', registerCouple)
router.post('/register/vendor', registerVendor)
router.post('/login', login)
router.get('/me', auth, me)
router.post('/logout', auth, logout)

module.exports = router
