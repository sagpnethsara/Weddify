const axios = require('axios')
const User = require('../models/User')

const flaskBaseUrl = process.env.FLASK_API_URL || 'http://localhost:5000'
const FLASK_TIMEOUT_MS = Number(process.env.FLASK_TIMEOUT_MS || 5000)

// ── Exact category names matching the CSV dataset ─────────────────────────────
const CATEGORY_ALIASES = {
  'Photographers':       ['photo', 'photograph', 'photographer', 'photography', 'camera', 'shoot', 'shooting', 'pictures', 'pic'],
  'Catering':            ['cater', 'catering', 'food', 'meal', 'menu', 'buffet', 'cuisine', 'cook', 'chef', 'lunch', 'dinner'],
  'Decorators':          ['decor', 'decoration', 'decorator', 'theme', 'setup', 'arrange', 'centerpiece', 'floral', 'flower', 'design'],
  'Venues':              ['venue', 'venues', 'hall', 'hotel', 'garden', 'banquet', 'ballroom', 'reception', 'resort', 'function'],
  'Entertainment':       ['entertainment', 'entertain', 'music', 'band', 'dj', 'singer', 'performance', 'sound', 'dance', 'live'],
  'Attire & Beauty':     ['attire', 'beauty', 'makeup', 'make up', 'bridal', 'gown', 'dress', 'hair', 'stylist', 'saree', 'salon', 'spa'],
  'Wedding Cakes':       ['cake', 'cakes', 'wedding cake', 'tiered', 'bakery', 'dessert', 'pastry', 'sweet'],
  'Wedding Cars':        ['wedding car', 'bridal car', 'limo', 'limousine', 'carriage', 'rolls royce', 'transport', 'vehicle'],
  'Wedding Invitations': ['invitation', 'invitations', 'card', 'cards', 'stationery', 'invite', 'printing']
}

// ── Typo normalizer ───────────────────────────────────────────────────────────
const fixTypos = (text) => text
  .toLowerCase()
  .replace(/\bwed+i+n+g?\b/g, 'wedding')
  .replace(/\bpht?o+gr?[ae]+ph?\w*/g, 'photography')  // phtograpy, photgraphy, photgraph
  .replace(/\bcolobo\b|\bcolumb[ao]\b|\bcoloumbo\b|\bcolumbo\b/g, 'colombo')
  .replace(/\bkangdy\b|\bkadny\b|\bkanday\b|\bkady\b/g, 'kandy')
  .replace(/\bgale\b(?![\w])/g, 'galle')
  .replace(/\bmatrea\b/g, 'matara')
  .replace(/\bnegambo\b/g, 'negombo')
  .replace(/\bnuwara[\s-]?eli?y?a?\b/g, 'nuwara eliya')
  .replace(/\btrincomali\b|\btrincomale\b|\btrinco\b/g, 'trincomalee')
  .replace(/\bkurunegal[ae]\b/g, 'kurunegala')
  .replace(/\bhambanth?ota\b/g, 'hambantota')
  .replace(/\banuradhpura\b|\banuradhapurah\b/g, 'anuradhapura')
  .replace(/\bcateri?n?g?\b/g, 'catering')
  .replace(/\bdecoratio?n?\b/g, 'decoration')
  .replace(/\benterti?a?i?n?\w*/g, 'entertainment')
  .replace(/\binvit[ae]tion\w*/g, 'invitation')
  .replace(/\blimosine\b|\blimusine\b/g, 'limousine')
  .replace(/\bmake[\s-]?up\b/g, 'makeup')
  .replace(/\brestauran\w*/g, 'catering')  // restaurant → catering context

// Detect category from typo-fixed text
const detectCategory = (text) => {
  const normalized = fixTypos(text)
  for (const [cat, aliases] of Object.entries(CATEGORY_ALIASES)) {
    if (aliases.some((a) => normalized.includes(a))) return cat
  }
  return null
}

// Detect Sri Lankan district — exact then fuzzy prefix match
const detectLocation = (text) => {
  const normalized = fixTypos(text)
  for (const d of SRI_LANKA_DISTRICTS) {
    if (normalized.includes(d.toLowerCase())) return d
  }
  const words = normalized.split(/\W+/).filter((w) => w.length >= 4)
  for (const d of SRI_LANKA_DISTRICTS) {
    const prefix = d.toLowerCase().slice(0, 5)
    if (words.some((w) => w.startsWith(prefix) || prefix.startsWith(w.slice(0, 4)))) return d
  }
  return null
}

// All 25 districts from weddify_dataset_v_final.csv
const SRI_LANKA_DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
  'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
  'Kandy', 'Kegalle', 'Kurunegala', 'Mannar', 'Matale',
  'Matara', 'Monaragala', 'Mullaitivu', 'Negombo', 'Nuwara Eliya',
  'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
]

// Wedding budget allocation (total = 100%)
const BUDGET_ALLOCATION = [
  { category: 'Venues',              pct: 0.30, label: 'Venue (30%)' },
  { category: 'Catering',            pct: 0.25, label: 'Catering (25%)' },
  { category: 'Photographers',       pct: 0.13, label: 'Photography (13%)' },
  { category: 'Decorators',          pct: 0.10, label: 'Decoration (10%)' },
  { category: 'Attire & Beauty',     pct: 0.08, label: 'Attire & Beauty (8%)' },
  { category: 'Entertainment',       pct: 0.06, label: 'Entertainment (6%)' },
  { category: 'Wedding Cars',        pct: 0.04, label: 'Wedding Cars (4%)' },
  { category: 'Wedding Cakes',       pct: 0.02, label: 'Wedding Cakes (2%)' },
  { category: 'Wedding Invitations', pct: 0.02, label: 'Invitations (2%)' }
]

// ── Budget parser ─────────────────────────────────────────────────────────────
const parseBudget = (text) => {
  const patterns = [
    /(?:my\s+)?budget\s+(?:is|=|:)?\s*(?:rs\.?|lkr)?\s*([\d,]+)\s*k?/i,
    /(?:i\s+have|i've\s+got|i\s+got|with)\s+(?:rs\.?|lkr)?\s*([\d,]+)\s*k?\s*(?:budget|lkr|rs|rupees)?/i,
    /(?:under|below|within|around|up\s+to|max|maximum|atmost)\s+(?:rs\.?|lkr)?\s*([\d,]+)\s*k?/i,
    /(?:rs\.?|lkr)\s*([\d,]+)\s*k?\s*(?:budget|max|maximum|limit)?/i,
    /([\d,]+)\s*k\s*(?:budget|lkr|rs|rupees|max)?/i,
    /(?:spend|spending|afford)\s+(?:rs\.?|lkr)?\s*([\d,]+)/i,
    /([\d]{4,})\s*(?:lkr|rs|rupees)/i
  ]
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      let amount = parseInt(match[1].replace(/,/g, ''))
      if (/\d+\s*k\b/i.test(match[0]) && amount < 10000) amount *= 1000
      if (amount >= 1000) return amount
    }
  }
  return null
}

// ── Price range parser — "between 50k and 100k", "50000 to 150000" ─────────────
const parsePriceRange = (text) => {
  const m = text.match(/([\d,]+)\s*(k?)\s*(?:to|and|-|–)\s*([\d,]+)\s*(k?)/i)
  if (!m) return null
  let min = parseInt(m[1].replace(/,/g, ''))
  let max = parseInt(m[3].replace(/,/g, ''))
  if (m[2].toLowerCase() === 'k') min *= 1000
  if (m[4].toLowerCase() === 'k') max *= 1000
  // also handle plain numbers under 10k that look like they should be thousands
  if (min < 1000 || max < 1000 || max <= min) return null
  return { minPrice: min, maxPrice: max }
}

// ── Intent extraction ─────────────────────────────────────────────────────────
const extractIntent = (messages) => {
  const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')
  const rawCurrent = (lastUserMsg?.content || '').trim()
  const currentText = fixTypos(rawCurrent)

  const prevUserMessages = messages
    .filter((m) => m.role === 'user')
    .slice(0, -1)
    .slice(-4)
    .map((m) => fixTypos(m.content))
    .join(' ')

  const intent = {
    filters: {},
    wantsHelp: false,
    isGreeting: false,
    isBudgetPlanning: false,
    isStatsQuery: false,
    isFollowUp: false,
    totalBudget: null
  }

  // ── Greeting ──────────────────────────────────────────────────────────────
  if (/^(hi|hello|hey|good morning|good evening|hola|ayubowan|vanakkam|sup|yo)[\s!.]*$/.test(currentText)) {
    intent.isGreeting = true
    return intent
  }

  // ── Help ──────────────────────────────────────────────────────────────────
  if (/^(help|what can you|what do you|how do you|options|commands)/.test(currentText)) {
    intent.wantsHelp = true
    return intent
  }

  // ── Stats / count query ───────────────────────────────────────────────────
  const isStatsQuery = /\b(how many|count|total|number of|how much|statistics|stats|available)\b/.test(currentText)
    && /\b(vendor|photographer|caterer|decorator|venue|entertain|cake|car|invitation|attire|beauty|wedding)\b/.test(currentText)

  // ── Follow-up detection — "show more", "cheaper", "better rated" ──────────
  const isShowMore = /\b(show more|more results|more options|more vendors|next page|see more|show others|another)\b/.test(currentText)
  const isCheaperReq = /\b(cheaper|less expensive|lower price|more affordable|budget option)\b/.test(currentText)
  const isBetterRated = /\b(better rated|higher rated|more stars|higher stars|top rated|best rated)\b/.test(currentText)
  const isMoreExperienced = /\b(more experienced|most experienced|veteran|senior|years of experience)\b/.test(currentText)

  if ((isShowMore || isCheaperReq || isBetterRated || isMoreExperienced) && prevUserMessages) {
    const prevCategory = detectCategory(prevUserMessages)
    const prevLocation = detectLocation(prevUserMessages)
    if (prevCategory || prevLocation) {
      if (prevCategory) intent.filters.category = prevCategory
      if (prevLocation) intent.filters.location = prevLocation
      if (isCheaperReq) intent.filters.priceTier = 'Budget'
      if (isBetterRated) intent.filters.minRating = 4.0
      if (isMoreExperienced) intent.filters.sortBy = 'experience'
      intent.isFollowUp = true
      return intent
    }
  }

  // ── Budget (current message only) ─────────────────────────────────────────
  const priceRange = parsePriceRange(currentText)
  const budget = parseBudget(currentText)

  // ── Category (current message only for mode decision) ─────────────────────
  const categoryInCurrent = detectCategory(currentText)

  // "full/total/all" + "budget" → full wedding plan
  const isFullPlanRequest = /\b(full|total|whole|complete|entire|all)\b.{0,20}\bbudget\b/.test(currentText)
                         || /\bbudget.{0,20}\b(all|full|plan|breakdown|complete)\b/.test(currentText)

  if (priceRange) {
    // Price range query: "photographers between 50k and 100k"
    intent.filters.minPrice = priceRange.minPrice
    intent.filters.maxPrice = priceRange.maxPrice
    const cat = categoryInCurrent
    const loc = detectLocation(currentText)
    if (cat) intent.filters.category = cat
    if (loc) intent.filters.location = loc
    return intent
  }

  if (budget) {
    intent.totalBudget = budget
    if (!isFullPlanRequest && categoryInCurrent) {
      // Mode 1: Category-specific budget
      intent.filters.category = categoryInCurrent
      intent.filters.maxPrice = budget
      const loc = detectLocation(currentText)
      if (loc) intent.filters.location = loc
    } else {
      // Mode 2: Full wedding budget plan
      intent.isBudgetPlanning = true
      const loc = detectLocation(currentText)
      if (loc) intent.filters.location = loc
    }
    return intent
  }

  // ── Vendor search — current message + previous context for follow-up ───────
  const categoryNow = categoryInCurrent
  const locationNow = detectLocation(currentText)
  const categoryPrev = categoryNow ? null : detectCategory(prevUserMessages)
  const locationPrev = locationNow ? null : detectLocation(prevUserMessages)

  if (categoryNow || categoryPrev) intent.filters.category = categoryNow || categoryPrev
  if (locationNow || locationPrev) intent.filters.location = locationNow || locationPrev

  // ── Stats query ───────────────────────────────────────────────────────────
  if (isStatsQuery) {
    intent.isStatsQuery = true
    return intent
  }

  // ── Price tier ────────────────────────────────────────────────────────────
  if (/\b(budget|cheap|affordable|low.?cost|inexpensive|economic)\b/.test(currentText)) {
    intent.filters.priceTier = 'Budget'
  } else if (/\b(premium|luxury|high.?end|exclusive|top.?tier|lavish)\b/.test(currentText)) {
    intent.filters.priceTier = 'Premium'
  } else if (/\b(mid.?range|moderate|average|standard|middle)\b/.test(currentText)) {
    intent.filters.priceTier = 'Mid-Range'
  }

  // ── Rating ────────────────────────────────────────────────────────────────
  const ratingMatch = currentText.match(/(\d(?:\.\d)?)\s*(?:star|stars|rating|rated|\/5)/)
  if (ratingMatch) intent.filters.minRating = parseFloat(ratingMatch[1])
  if (/\b(top.?rated|best.?rated|highest.?rated|best|highly.?rated|great)\b/.test(currentText)) {
    intent.filters.minRating = intent.filters.minRating || 4.0
  }
  if (/\b(worst|low.?rated|lowest|bad|poor)\b/.test(currentText)) {
    intent.filters.maxRating = 3.5
  }

  // ── Verified ──────────────────────────────────────────────────────────────
  if (/\b(verified|trusted|certified|official)\b/.test(currentText)) {
    intent.filters.verified = true
  }

  // ── Sort modes ────────────────────────────────────────────────────────────
  if (/\b(most experienced|experienced|veteran|senior)\b/.test(currentText)) {
    intent.filters.sortBy = 'experience'
  } else if (/\b(fastest response|quick response|fast reply|response time)\b/.test(currentText)) {
    intent.filters.sortBy = 'responseTime'
  } else if (/\b(most popular|popular|trending|social media|followers)\b/.test(currentText)) {
    intent.filters.sortBy = 'social'
  } else if (/\b(most weddings|most events|highest weddings)\b/.test(currentText)) {
    intent.filters.sortBy = 'weddings'
  }

  return intent
}

// ── Vendor normalizer ─────────────────────────────────────────────────────────
const normalize = (v) => ({
  id: v._id || v.id || v.vendor_id || '',
  name: v.businessName || v.vendor_name || 'Unknown',
  category: v.category || v.Category || '',
  location: v.location || v.Location || '',
  price: Number(v.price || v['Price (LKR)'] || 0),
  priceTier: v.priceTier || v['Price Tier'] || '',
  rating: Number(v.rating || v['Rating (out of 5)'] || 0),
  experience: Number(v.experience || v['Experience (Years)'] || 0),
  verified: v.verified === true || v.verified === 'Yes',
  recommended: v.recommended === true || v.recommended === 'Yes' || v.Recommended === 'Yes',
  weddings: Number(v.weddingsCompleted || v['Weddings Completed'] || 0),
  repeatRate: Number(v.repeatClientRate || v.repeatRate || v['Repeat Client Rate'] || v['Repeat Client Rate (%)'] || 0),
  responseTime: Number(v.responseTime || v['Response Time (Hours)'] || 99),
  numberOfPackages: Number(v.numberOfPackages || v['Number of Packages'] || 0),
  socialFollowers: Number(v.socialFollowers || v['Social Media Followers'] || 0),
  _raw: v
})

const score = (v) => {
  let s = 0
  s += v.rating * 20                               // 0–100 (primary factor)
  s += v.verified ? 15 : 0                         // meaningful: ~60% are verified
  s += v.recommended ? 10 : 0                      // ML-recommended by dataset
  s += Math.min(v.experience, 20) * 0.5            // 0–10 (capped at 20 yrs)
  s += Math.min(v.weddings, 200) * 0.05            // 0–10
  s += v.repeatRate > 0 ? Math.min(v.repeatRate, 80) * 0.1 : 0  // 0–8
  s += Math.min(v.numberOfPackages, 10) * 0.3      // 0–3 (more packages = more choice)
  s -= Math.min(v.responseTime, 48) * 0.1          // 0 to –4.8
  return s
}

// ── Get approximate count from Flask ─────────────────────────────────────────
const getVendorCount = async (filters) => {
  const params = { limit: 1 }
  if (filters.category) params.category = filters.category
  if (filters.location) params.location = filters.location
  if (filters.priceTier) params.priceTier = filters.priceTier
  try {
    const { data } = await axios.get(`${flaskBaseUrl}/vendors`, { params, timeout: FLASK_TIMEOUT_MS })
    return data.total || 0
  } catch (_) { return 0 }
}

// ── Fetch vendors ─────────────────────────────────────────────────────────────
const fetchVendors = async (filters, limit = 8) => {
  const { category, location, priceTier, minRating, maxRating, maxPrice, minPrice, verified, sortBy } = filters

  const params = { limit: 100 }
  if (category)  params.category  = category
  if (location)  params.location  = location
  if (priceTier) params.priceTier = priceTier
  if (minRating) params.rating    = minRating
  if (maxPrice)  params.maxPrice  = maxPrice
  if (minPrice)  params.minPrice  = minPrice

  let flaskVendors = []
  try {
    const { data } = await axios.get(`${flaskBaseUrl}/vendors`, { params, timeout: FLASK_TIMEOUT_MS })
    if (Array.isArray(data.vendors)) flaskVendors = data.vendors
  } catch (_) {}

  const mongoFilter = { role: 'vendor', status: 'approved' }
  if (category)  mongoFilter.category  = { $regex: new RegExp(`^${category}$`, 'i') }
  if (location)  mongoFilter.location  = { $regex: new RegExp(`^${location}$`, 'i') }
  if (priceTier) mongoFilter.priceTier = { $regex: new RegExp(`^${priceTier}$`, 'i') }
  if (minRating) mongoFilter.rating    = { $gte: minRating }
  if (maxPrice)  mongoFilter.price     = { ...(mongoFilter.price || {}), $lte: maxPrice, $gt: 0 }
  if (minPrice)  mongoFilter.price     = { ...(mongoFilter.price || {}), $gte: minPrice }

  let dbVendors = []
  try {
    dbVendors = await User.find(mongoFilter).select('-passwordHash').lean()
  } catch (_) {}

  let all = [...dbVendors, ...flaskVendors].map(normalize)

  // Post-filters
  if (maxPrice)  all = all.filter((v) => v.price > 0 && v.price <= maxPrice)
  if (minPrice)  all = all.filter((v) => v.price > 0 && v.price >= minPrice)
  if (maxRating) all = all.filter((v) => v.rating > 0 && v.rating <= maxRating)
  if (verified)  all = all.filter((v) => v.verified)

  // Deduplicate by name+location
  const seen = new Set()
  all = all.filter((v) => {
    const key = `${v.name}|${v.location}`.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  // Sort
  if (sortBy === 'experience') {
    all.sort((a, b) => b.experience - a.experience)
  } else if (sortBy === 'responseTime') {
    all.sort((a, b) => a.responseTime - b.responseTime) // ascending: faster is better
  } else if (sortBy === 'social') {
    all.sort((a, b) => b.socialFollowers - a.socialFollowers)
  } else if (sortBy === 'weddings') {
    all.sort((a, b) => b.weddings - a.weddings)
  } else if (maxRating) {
    all.sort((a, b) => a.rating - b.rating)
  } else {
    all.sort((a, b) => score(b) - score(a))
  }

  return all.slice(0, limit)
}

// ── Full wedding budget planner ───────────────────────────────────────────────
const buildBudgetPlan = async (totalBudget, location) => {
  const fmt = (n) => `Rs. ${Math.round(n).toLocaleString()}`

  const rows = await Promise.all(
    BUDGET_ALLOCATION.map(async ({ category, pct, label }) => {
      const alloc = Math.round(totalBudget * pct)
      const vendors = await fetchVendors(
        { category, ...(location ? { location } : {}), maxPrice: alloc },
        2
      )
      return { label, alloc, vendors }
    })
  )

  let reply = `📊 **Full Wedding Budget Plan — ${fmt(totalBudget)}**\n`
  reply += `_(For a category-specific budget, say e.g. "my photography budget is 50,000")_\n`
  if (location) reply += `📍 Location: **${location}**\n`
  reply += `\n`

  for (const { label, alloc, vendors } of rows) {
    reply += `**${label}** — ${fmt(alloc)}\n`
    if (vendors.length) {
      for (const v of vendors) {
        const parts = []
        if (v.rating) parts.push(`⭐ ${v.rating}/5`)
        if (v.price)  parts.push(`Rs. ${v.price.toLocaleString()}`)
        if (v.verified) parts.push(`✓`)
        if (v.recommended) parts.push(`★ Recommended`)
        reply += `   • ${v.name} (${v.location || 'Sri Lanka'}) ${parts.join(' · ')}\n`
      }
    } else {
      reply += `   • No vendors found within this budget\n`
    }
    reply += `\n`
  }

  reply += `💡 Click vendor cards below to view full profiles and send enquiries.`
  return reply
}

// ── Stats query response builder ──────────────────────────────────────────────
const buildStatsReply = async (intent) => {
  const { category, location } = intent.filters
  const [count, vendors] = await Promise.all([
    getVendorCount(intent.filters),
    fetchVendors(intent.filters, 6)
  ])

  let reply = `📊 **${category || 'Vendor'} Statistics`
  if (location) reply += ` — ${location}`
  reply += `**\n\n`

  if (count > 0) {
    reply += `Found approximately **${count.toLocaleString()} vendors** in our dataset.\n`
  }

  if (vendors.length > 0) {
    const rated = vendors.filter((v) => v.rating > 0)
    if (rated.length) {
      const avgRating = (rated.reduce((s, v) => s + v.rating, 0) / rated.length).toFixed(1)
      reply += `⭐ Avg rating (top results): **${avgRating}/5**\n`
    }

    const prices = vendors.filter((v) => v.price > 0).map((v) => v.price)
    if (prices.length) {
      const minP = Math.min(...prices)
      const maxP = Math.max(...prices)
      reply += `💰 Price range in top results: **Rs. ${minP.toLocaleString()} – Rs. ${maxP.toLocaleString()}**\n`
    }

    const verifiedCount = vendors.filter((v) => v.verified).length
    reply += `✅ Verified: **${verifiedCount}/${vendors.length}** in top results\n\n`

    reply += `**Top ${vendors.length} ${category || 'vendors'}${location ? ` in ${location}` : ''}:**\n`
    vendors.forEach((v, i) => {
      const parts = []
      if (v.rating) parts.push(`⭐ ${v.rating}`)
      if (v.price)  parts.push(`Rs. ${v.price.toLocaleString()}`)
      if (v.priceTier) parts.push(v.priceTier)
      if (v.verified) parts.push(`✓`)
      reply += `**${i + 1}. ${v.name}** (${v.location || 'Sri Lanka'}) — ${parts.join(' · ')}\n`
    })
  } else {
    reply += `No vendors found for your search. Try a different category or location.`
  }

  return { reply, vendors }
}

// ── Response builder ──────────────────────────────────────────────────────────
const fmt = (p) => p > 0 ? `Rs. ${Number(p).toLocaleString()}` : 'Contact for price'

const buildReply = (intent, vendors) => {
  const { filters, isGreeting, wantsHelp, isFollowUp } = intent
  const { category, location, priceTier, minRating, maxRating, maxPrice, minPrice, sortBy } = filters

  if (isGreeting) {
    return `Hi! Welcome to Weddify 💍\n\nI search our database of 13,000+ real vendors to help plan your perfect Sri Lankan wedding.\n\nTry:\n• **"Photographers in Colombo under Rs. 100,000"**\n• **"My total budget is 500,000"** — full wedding plan\n• **"Top-rated catering in Kandy"**\n• **"How many decorators are in Galle?"**\n• **"Most experienced venues in Colombo"**`
  }

  if (wantsHelp) {
    return `Here's what I can do:\n\n🔍 **Find vendors by category:**\nPhotographers · Catering · Venues · Decorators · Entertainment · Attire & Beauty · Wedding Cakes · Wedding Cars · Wedding Invitations\n\n📍 **Filter by district:** All 25 Sri Lankan districts (Colombo, Kandy, Galle…)\n\n💰 **Filter by budget:**\n• _"Under Rs. 100,000"_ — single price cap\n• _"Between 50k and 150k"_ — price range\n• _"My photography budget is 80,000"_ — category budget\n\n📊 **Full budget plan:** _"My total budget is 500,000"_\n\n⭐ **Sort options:** best rated · most experienced · fastest response · most popular\n✅ **Verified vendors only:** say "verified"\n📈 **Stats:** _"How many photographers in Colombo?"_`
  }

  if (!vendors.length) {
    let msg = `I couldn't find vendors`
    if (category) msg += ` for **${category}**`
    if (location) msg += ` in **${location}**`
    if (maxPrice) msg += ` under **Rs. ${maxPrice.toLocaleString()}**`
    if (minPrice && maxPrice) msg += ` (between Rs. ${minPrice.toLocaleString()} – Rs. ${maxPrice.toLocaleString()})`
    msg += `.\n\nTry:\n• Removing the price limit\n• Searching a nearby district\n• A different category`
    return msg
  }

  let intro = ''
  if (isFollowUp) {
    intro = `Here are more options`
    if (category) intro += ` for **${category}**`
    if (location) intro += ` in **${location}**`
    intro += `:\n`
  } else if (minPrice && maxPrice) {
    intro = `💰 **${category || 'Vendors'} priced Rs. ${minPrice.toLocaleString()} – Rs. ${maxPrice.toLocaleString()}`
    if (location) intro += ` in ${location}`
    intro += `:**\n`
  } else if (maxPrice && category) {
    intro = `💰 **${category} within your Rs. ${maxPrice.toLocaleString()} budget`
    if (location) intro += ` in ${location}`
    intro += `:**\n`
  } else {
    const sortLabel = sortBy === 'experience' ? 'most experienced'
      : sortBy === 'responseTime' ? 'fastest response'
      : sortBy === 'social' ? 'most popular'
      : sortBy === 'weddings' ? 'most weddings completed'
      : maxRating ? 'lowest-rated'
      : minRating ? 'top-rated'
      : priceTier ? priceTier
      : 'best'

    intro = `Here are the **${sortLabel}`
    if (category) intro += ` ${category}`
    else intro += ` wedding vendors`
    if (location) intro += ` in **${location}**`
    if (minRating && !maxRating) intro += ` (${minRating}★+)`
    if (maxRating) intro += ` (≤${maxRating}★)`
    intro += `:\n`
  }

  const list = vendors.map((v, i) => {
    const parts = []
    if (v.rating)     parts.push(`⭐ ${v.rating}/5`)
    if (v.price)      parts.push(fmt(v.price))
    if (v.priceTier)  parts.push(v.priceTier)

    // Contextual extras based on sort mode
    if (sortBy === 'experience' && v.experience) {
      parts.push(`${v.experience} yrs experience`)
    } else if (sortBy === 'responseTime' && v.responseTime) {
      parts.push(`${v.responseTime}h response`)
    } else if (sortBy === 'social' && v.socialFollowers) {
      parts.push(`${v.socialFollowers.toLocaleString()} followers`)
    } else if (sortBy === 'weddings' && v.weddings) {
      parts.push(`${v.weddings} weddings`)
    } else {
      if (v.experience) parts.push(`${v.experience} yrs`)
      if (v.weddings)   parts.push(`${v.weddings} weddings`)
    }

    if (v.numberOfPackages > 0) parts.push(`${v.numberOfPackages} packages`)
    if (v.repeatRate > 0)       parts.push(`${v.repeatRate}% repeat clients`)
    if (v.verified)  parts.push(`✓ Verified`)
    if (v.recommended) parts.push(`★ Recommended`)

    return `**${i + 1}. ${v.name}** — ${v.location || 'Sri Lanka'}\n   ${parts.join(' · ')}`
  })

  let reply = intro + list.join('\n\n')

  if (vendors.length >= 3) {
    reply += `\n\n💡 Click vendor cards below to view profiles and book.`
  }

  // Show price stats if relevant
  const priced = vendors.filter((v) => v.price > 0)
  if (priced.length > 1 && !minPrice && !maxPrice) {
    const avg = Math.round(priced.reduce((s, v) => s + v.price, 0) / priced.length)
    const min = Math.min(...priced.map((v) => v.price))
    const max = Math.max(...priced.map((v) => v.price))
    reply += `\n💰 Price range: **Rs. ${min.toLocaleString()} – Rs. ${max.toLocaleString()}** · Avg: **Rs. ${avg.toLocaleString()}**`
  }

  return reply
}

// ── No-filter fallback ────────────────────────────────────────────────────────
const buildNoFilterReply = () =>
  `I can help you find wedding vendors! 🎊\n\nTell me:\n• A **category** — Photographers, Catering, Venues, Decorators, Entertainment, Attire & Beauty, Wedding Cakes, Wedding Cars, Wedding Invitations\n• A **location** — Colombo, Kandy, Galle, or any of the 25 Sri Lankan districts\n• Your **budget** — e.g. "photographers under Rs. 100,000" or "between 50k and 150k"\n\nOr say **"my total budget is 500,000"** for a full wedding budget breakdown!\n\n_Example: "Best photographers in Colombo under 80,000"_`

// ── Main handler ──────────────────────────────────────────────────────────────
const chat = async (req, res) => {
  try {
    const { messages } = req.body

    if (!Array.isArray(messages) || !messages.length) {
      return res.status(400).json({ message: 'Messages array is required' })
    }

    const lastMessage = messages[messages.length - 1]
    if (!lastMessage?.content || lastMessage.role !== 'user') {
      return res.status(400).json({ message: 'Last message must be a user message with content' })
    }

    const intent = extractIntent(messages)

    // ── Greeting / help ──────────────────────────────────────────────────────
    if (intent.isGreeting || intent.wantsHelp) {
      return res.json({ message: buildReply(intent, []), vendors: [], filters: {} })
    }

    // ── Full budget planning mode ────────────────────────────────────────────
    if (intent.isBudgetPlanning && intent.totalBudget) {
      const location = intent.filters.location || null
      const reply = await buildBudgetPlan(intent.totalBudget, location)
      const topVendors = await fetchVendors(
        { maxPrice: intent.totalBudget, ...(location ? { location } : {}) },
        5
      )
      return res.json({
        message: reply,
        vendors: topVendors.map((v) => v._raw),
        filters: { totalBudget: intent.totalBudget }
      })
    }

    // ── Stats query mode ─────────────────────────────────────────────────────
    if (intent.isStatsQuery) {
      const { reply, vendors } = await buildStatsReply(intent)
      return res.json({
        message: reply,
        vendors: vendors.slice(0, 5).map((v) => v._raw),
        filters: intent.filters
      })
    }

    // ── Vendor search mode ───────────────────────────────────────────────────
    const hasFilters = Object.keys(intent.filters).length > 0

    if (!hasFilters) {
      return res.json({ message: buildNoFilterReply(), vendors: [], filters: {} })
    }

    const vendors = await fetchVendors(intent.filters, 6)
    const reply = buildReply(intent, vendors)

    return res.json({
      message: reply,
      vendors: vendors.slice(0, 5).map((v) => v._raw),
      filters: intent.filters
    })
  } catch (error) {
    console.error('Chat error:', error?.message || error)
    return res.status(500).json({ message: 'Something went wrong. Please try again.' })
  }
}

module.exports = { chat }
