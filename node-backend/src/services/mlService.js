const axios = require('axios')

const getMLRecommendations = async (vendors) => {
  const flaskUrl = process.env.FLASK_API_URL || 'http://localhost:5000'
  const timeout = Number(process.env.FLASK_TIMEOUT_MS || 5000)
  const payload = {
    vendors: vendors.map((vendor) => ({
      _vendor_id: String(vendor._id || vendor.vendor_id || ''),
      vendor_name: vendor.businessName || vendor.vendor_name || 'Vendor',
      Category: vendor.category || vendor.Category || 'Venues',
      Location: vendor.location || vendor.Location || 'Colombo',
      'Price Tier': vendor.priceTier || vendor['Price Tier'] || 'Mid-Range',
      'Price (LKR)': Number(vendor.price || vendor['Price (LKR)'] || 0),
      'Rating (out of 5)': Number(vendor.rating || vendor['Rating (out of 5)'] || 0),
      'Experience (Years)': Number(vendor.experience || vendor['Experience (Years)'] || 1),
      'Weddings Completed': Number(vendor.weddingsCompleted || vendor['Weddings Completed'] || 10),
      'Response Time (Hours)': Number(vendor.responseTime || vendor['Response Time (Hours)'] || 4),
      Verified: vendor.verified ? 'Yes' : (vendor.Verified || 'No'),
      'Number of Packages': Number(vendor.numberOfPackages || vendor['Number of Packages'] || 1),
      'Social Media Followers': Number(vendor.socialFollowers || vendor['Social Media Followers'] || 0),
      'Repeat Client Rate': Number(vendor.repeatClientRate || vendor['Repeat Client Rate'] || 0.2)
    }))
  }

  const response = await axios.post(`${flaskUrl}/predict/batch`, payload, { timeout })
  return response.data.results || []
}

module.exports = { getMLRecommendations }
