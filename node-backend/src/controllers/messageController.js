const Message = require('../models/Message')
const User = require('../models/User')

const displayName = (u) =>
  u.businessName ||
  [u.groomName, u.brideName].filter(Boolean).join(' & ') ||
  u.email ||
  'Unknown'

// POST /api/messages/:userId — send a message
const sendMessage = async (req, res) => {
  try {
    const { content } = req.body
    const receiverId = req.params.userId

    if (!content?.trim()) {
      return res.status(400).json({ message: 'Message content is required' })
    }

    if (String(req.user._id) === String(receiverId)) {
      return res.status(400).json({ message: 'Cannot message yourself' })
    }

    const receiver = await User.findById(receiverId).select('_id')
    if (!receiver) {
      return res.status(404).json({ message: 'User not found' })
    }

    const msg = await Message.create({
      senderId: req.user._id,
      receiverId,
      content: content.trim()
    })

    return res.status(201).json({ message: msg })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to send message' })
  }
}

// GET /api/messages/:userId — fetch conversation with a user
const getMessages = async (req, res) => {
  try {
    const otherId = req.params.userId
    const myId = req.user._id

    const other = await User.findById(otherId).select('businessName groomName brideName role category location verified')
    if (!other) return res.status(404).json({ message: 'User not found' })

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: otherId },
        { senderId: otherId, receiverId: myId }
      ]
    })
      .sort({ createdAt: 1 })
      .limit(150)
      .lean()

    // Mark received messages as read
    await Message.updateMany(
      { senderId: otherId, receiverId: myId, read: false },
      { $set: { read: true } }
    )

    return res.json({
      messages,
      other: {
        _id: other._id,
        name: displayName(other),
        role: other.role,
        category: other.category,
        location: other.location,
        verified: other.verified
      }
    })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch messages' })
  }
}

// GET /api/messages — list all conversations
const getConversations = async (req, res) => {
  try {
    const myId = req.user._id

    const [sentTo, receivedFrom] = await Promise.all([
      Message.distinct('receiverId', { senderId: myId }),
      Message.distinct('senderId', { receiverId: myId })
    ])

    const partnerSet = new Set([
      ...sentTo.map(String),
      ...receivedFrom.map(String)
    ])
    const partnerIds = [...partnerSet]

    const conversations = await Promise.all(
      partnerIds.map(async (partnerId) => {
        const [lastMsg, unreadCount, partner] = await Promise.all([
          Message.findOne({
            $or: [
              { senderId: myId, receiverId: partnerId },
              { senderId: partnerId, receiverId: myId }
            ]
          })
            .sort({ createdAt: -1 })
            .lean(),
          Message.countDocuments({ senderId: partnerId, receiverId: myId, read: false }),
          User.findById(partnerId).select('businessName groomName brideName role category location verified').lean()
        ])

        if (!partner || !lastMsg) return null

        return {
          partnerId,
          partnerName: displayName(partner),
          partnerRole: partner.role,
          partnerCategory: partner.category,
          partnerLocation: partner.location,
          partnerVerified: partner.verified,
          lastMessage: lastMsg.content,
          lastMessageAt: lastMsg.createdAt,
          lastMessageMine: String(lastMsg.senderId) === String(myId),
          unreadCount
        }
      })
    )

    const sorted = conversations
      .filter(Boolean)
      .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))

    return res.json({ conversations: sorted })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch conversations' })
  }
}

// GET /api/messages/unread-count — badge count for navbar
const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({ receiverId: req.user._id, read: false })
    return res.json({ count })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to get unread count' })
  }
}

module.exports = { sendMessage, getMessages, getConversations, getUnreadCount }
