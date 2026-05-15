const express = require('express')
const { chat } = require('../controllers/chatController')

const router = express.Router()

// Public — no auth required so guests can also use the chatbot
router.post('/', chat)

module.exports = router
