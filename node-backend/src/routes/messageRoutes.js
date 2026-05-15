const express = require('express')
const { sendMessage, getMessages, getConversations, getUnreadCount } = require('../controllers/messageController')
const { auth } = require('../middleware/auth')

const router = express.Router()

router.use(auth)

router.get('/', getConversations)
router.get('/unread-count', getUnreadCount)
router.get('/:userId', getMessages)
router.post('/:userId', sendMessage)

module.exports = router
