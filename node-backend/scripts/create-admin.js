require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') })
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('../src/models/User')

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@weddify.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@12345'
const ADMIN_PHONE = process.env.ADMIN_PHONE || '0770000000'

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing in .env')
  }

  await mongoose.connect(process.env.MONGODB_URI)

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10)

  const adminDoc = {
    role: 'admin',
    email: ADMIN_EMAIL.toLowerCase().trim(),
    passwordHash,
    phone: ADMIN_PHONE,
    status: 'approved',
    verified: true
  }

  const user = await User.findOneAndUpdate(
    { email: adminDoc.email },
    { $set: adminDoc },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )

  console.log('Admin account is ready')
  console.log(`Email: ${user.email}`)
  console.log(`Password: ${ADMIN_PASSWORD}`)

  await mongoose.disconnect()
}

main().catch(async (err) => {
  console.error('Failed to create admin account:', err.message)
  try {
    await mongoose.disconnect()
  } catch (_err) {
    // ignore disconnect errors during failure cleanup
  }
  process.exit(1)
})
