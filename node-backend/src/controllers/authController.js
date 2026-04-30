const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const signToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  })
}

const safeUser = (user) => {
  const base = {
    _id: user._id,
    role: user.role,
    email: user.email,
    phone: user.phone
  }

  if (user.role === 'couple') {
    base.groomName = user.groomName
    base.brideName = user.brideName
    base.weddingDate = user.weddingDate
    base.location = user.location
  }

  if (user.role === 'vendor') {
    base.businessName = user.businessName
    base.ownerName = user.ownerName
    base.category = user.category
    base.status = user.status
    base.location = user.location
    base.description = user.description
    base.experience = user.experience
    base.price = user.price
    base.priceTier = user.priceTier
    base.verified = user.verified
  }

  if (user.role === 'admin') {
    base.status = user.status
  }

  return base
}

const registerCouple = async (req, res) => {
  try {
    const { groomName, brideName, email, password, phone, weddingDate, location } = req.body

    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await User.create({
      role: 'couple',
      groomName,
      brideName,
      email,
      passwordHash,
      phone,
      weddingDate,
      location,
      status: 'approved'
    })

    const token = signToken(user._id)
    return res.status(201).json({ token, user: safeUser(user) })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to register couple' })
  }
}

const registerVendor = async (req, res) => {
  try {
    const { businessName, ownerName, email, password, phone, category, location, experience, description } = req.body

    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await User.create({
      role: 'vendor',
      businessName,
      ownerName,
      email,
      passwordHash,
      phone,
      category,
      location,
      experience,
      description,
      status: 'pending',
      verified: false
    })

    const token = signToken(user._id)
    return res.status(201).json({ token, user: safeUser(user) })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to register vendor' })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = signToken(user._id)
    return res.json({ token, user: safeUser(user) })
  } catch (error) {
    return res.status(500).json({ message: 'Login failed' })
  }
}

const me = async (req, res) => {
  return res.json({ user: safeUser(req.user) })
}

const logout = async (_req, res) => {
  return res.json({ message: 'Logged out successfully' })
}

module.exports = {
  registerCouple,
  registerVendor,
  login,
  me,
  logout
}
