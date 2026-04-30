const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

const authRoutes = require('./routes/authRoutes')
const vendorRoutes = require('./routes/vendorRoutes')
const bookingRoutes = require('./routes/bookingRoutes')
const adminRoutes = require('./routes/adminRoutes')
const coupleRoutes = require('./routes/coupleRoutes')
const chatRoutes = require('./routes/chatRoutes')
const messageRoutes = require('./routes/messageRoutes')

const app = express()

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }))
app.use(express.json())
app.use(morgan('dev'))

app.get('/', (_req, res) => {
  res.json({ message: 'Weddify Node API is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/vendors', vendorRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/couple', coupleRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/messages', messageRoutes)

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ message: 'Internal server error' })
})

module.exports = app
