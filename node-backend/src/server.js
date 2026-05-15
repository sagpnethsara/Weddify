require('dotenv').config()

const app = require('./app')
const connectDB = require('./config/db')

const PORT = process.env.PORT || 8000

const start = async () => {
  try {
    await connectDB()
    app.listen(PORT, () => {
      console.log(`Node API listening on http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error.message)
    process.exit(1)
  }
}

start()
