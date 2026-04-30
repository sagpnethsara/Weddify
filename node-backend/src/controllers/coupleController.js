const User = require('../models/User')

const getPlan = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('budget guests')
    if (!user) return res.status(404).json({ message: 'User not found' })
    return res.json({ budget: user.budget || 0, guests: user.guests || [] })
  } catch (error) {
    console.error('getPlan error:', error)
    return res.status(500).json({ message: 'Failed to fetch plan' })
  }
}

const updatePlan = async (req, res) => {
  try {
    const update = {}
    if (req.body.budget !== undefined) {
      update.budget = Number(req.body.budget) || 0
    }
    if (req.body.guests !== undefined) {
      update.guests = req.body.guests.map(({ name, side, status }) => ({
        name,
        side,
        status: status || 'Pending'
      }))
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: update },
      { new: true, runValidators: false }
    ).select('budget guests')

    if (!user) return res.status(404).json({ message: 'User not found' })
    return res.json({ budget: user.budget, guests: user.guests })
  } catch (error) {
    console.error('updatePlan error:', error)
    return res.status(500).json({ message: 'Failed to update plan', detail: error.message })
  }
}

module.exports = { getPlan, updatePlan }
