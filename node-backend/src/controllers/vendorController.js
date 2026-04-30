const User = require('../models/User')
const { getMLRecommendations } = require('../services/mlService')
const axios = require('axios')

const flaskBaseUrl = process.env.FLASK_API_URL || 'http://localhost:5000'
const FLASK_TIMEOUT_MS = Number(process.env.FLASK_TIMEOUT_MS || 5000)

const parsePagination = (query) => {
  const page = Math.max(Number(query.page) || 1, 1)
  const limit = Math.min(Math.max(Number(query.limit) || 24, 1), 100)
  return { page, limit, skip: (page - 1) * limit }
}

const buildFilter = (query) => {
  const filter = { role: 'vendor', status: 'approved' }

  if (query.category) filter.category = query.category
  if (query.location) filter.location = query.location
  if (query.priceTier) filter.priceTier = query.priceTier
  if (query.rating) filter.rating = { $gte: Number(query.rating) }

  if (query.minPrice || query.maxPrice) {
    filter.price = {}
    if (query.minPrice) filter.price.$gte = Number(query.minPrice)
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice)
  }

  return filter
}

const getVendors = async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query)
    const mongoFilter = buildFilter(req.query)

    // Always fetch admin-approved MongoDB vendors (expected to be few)
    const dbVendors = await User.find(mongoFilter).select('-passwordHash').lean()

    // Try Flask for the large CSV dataset vendors
    let flaskVendors = []
    let flaskTotal = 0
    try {
      const { data } = await axios.get(`${flaskBaseUrl}/vendors`, {
        params: req.query,
        timeout: FLASK_TIMEOUT_MS
      })
      if (Array.isArray(data.vendors)) {
        flaskVendors = data.vendors
        flaskTotal = data.total || data.vendors.length
      }
    } catch (_flaskError) {
      // Flask unavailable — fall back to MongoDB only
    }

    if (flaskVendors.length > 0) {
      // Merge: DB approved vendors first, then Flask CSV vendors
      const combined = [...dbVendors, ...flaskVendors]
      return res.json({
        vendors: combined,
        total: flaskTotal + dbVendors.length,
        page,
        limit
      })
    }

    // Pure MongoDB fallback (Flask completely unavailable)
    const [total, vendors] = await Promise.all([
      User.countDocuments(mongoFilter),
      User.find(mongoFilter).select('-passwordHash').skip(skip).limit(limit)
    ])
    return res.json({ vendors, total, page, limit })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch vendors' })
  }
}

const getVendorById = async (req, res) => {
  try {
    if (req.params.id.startsWith('py_')) {
      const { data } = await axios.get(`${flaskBaseUrl}/vendors/${req.params.id}`, {
        timeout: FLASK_TIMEOUT_MS
      })
      return res.json({ vendor: data.vendor })
    }

    const vendor = await User.findOne({ _id: req.params.id, role: 'vendor' }).select('-passwordHash')
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' })
    }

    return res.json({ vendor })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch vendor' })
  }
}

const updateVendor = async (req, res) => {
  try {
    const vendor = await User.findOne({ _id: req.params.id, role: 'vendor' })
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' })
    }

    if (req.user.role !== 'admin' && String(req.user._id) !== String(vendor._id)) {
      return res.status(403).json({ message: 'Forbidden' })
    }

    const allowed = ['businessName', 'ownerName', 'phone', 'category', 'location', 'experience', 'description', 'price', 'priceTier']
    for (const field of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        vendor[field] = req.body[field]
      }
    }

    await vendor.save()
    return res.json({ vendor })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update vendor' })
  }
}

const myProfile = async (req, res) => {
  try {
    const vendor = await User.findOne({ _id: req.user._id, role: 'vendor' }).select('-passwordHash')
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' })
    }

    return res.json({ vendor })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch profile' })
  }
}

const getRecommendedVendors = async (req, res) => {
  try {
    const mongoFilter = buildFilter(req.query)

    // Always include MongoDB approved vendors
    const dbVendors = await User.find(mongoFilter).select('-passwordHash').lean()

    // Try Flask for CSV dataset vendors
    let flaskVendors = []
    try {
      const { data } = await axios.get(`${flaskBaseUrl}/vendors`, {
        params: req.query,
        timeout: FLASK_TIMEOUT_MS
      })
      if (Array.isArray(data.vendors)) {
        flaskVendors = data.vendors
      }
    } catch (_flaskError) {}

    const vendors = [...dbVendors, ...flaskVendors]

    if (!vendors.length) {
      return res.json({ vendors: [], total: 0 })
    }

    let predictions = []
    try {
      predictions = await getMLRecommendations(vendors)
    } catch (_predictionError) {}

    const merged = vendors.map((vendorDoc) => {
      const vendor = vendorDoc.toObject ? vendorDoc.toObject() : vendorDoc
      const vendorId = String(vendor._id || vendor.vendor_id || '')
      const prediction = predictions.find((p) => p._vendor_id && p._vendor_id === vendorId)
        || predictions.find((p) => p.vendor_name === (vendor.businessName || vendor.vendor_name))
        || {}
      return { ...vendor, ...prediction }
    })

    merged.sort((a, b) => (b.probability_yes || 0) - (a.probability_yes || 0))
    return res.json({ vendors: merged, total: merged.length })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to get recommendations' })
  }
}

module.exports = {
  getVendors,
  getVendorById,
  updateVendor,
  myProfile,
  getRecommendedVendors
}
