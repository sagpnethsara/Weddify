import {
  Building2,
  Camera,
  Flower2,
  UtensilsCrossed,
  Sparkles,
  CakeSlice,
  Mail,
  Car,
  Music
} from 'lucide-react'

// Exact locations from weddify_dataset_v_final.csv (25 cities)
export const districts = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
  'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
  'Kandy', 'Kegalle', 'Kurunegala', 'Mannar', 'Matale',
  'Matara', 'Monaragala', 'Mullaitivu', 'Negombo', 'Nuwara Eliya',
  'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
]

export const categories = [
  'Venues',
  'Photographers',
  'Decorators',
  'Catering',
  'Attire & Beauty',
  'Wedding Cakes',
  'Invitations',
  'Wedding Cars',
  'Entertainment'
]

export function formatPrice(amount) {
  if (!amount && amount !== 0) return 'Rs. 0'
  return `Rs. ${Number(amount).toLocaleString('en-LK')}`
}

export function formatDate(date) {
  if (!date) return '-'
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

export function daysUntil(date) {
  if (!date) return 0
  const target = new Date(date)
  const now = new Date()
  const diff = target.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0)
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export function getCategoryIcon(category) {
  const iconMap = {
    Venues: Building2,
    Photographers: Camera,
    Decorators: Flower2,
    Catering: UtensilsCrossed,
    'Attire & Beauty': Sparkles,
    'Wedding Cakes': CakeSlice,
    Invitations: Mail,
    'Wedding Cars': Car,
    Entertainment: Music
  }
  return iconMap[category] || Building2
}

export function getStatusColor(status = '') {
  const value = status.toLowerCase()
  if (value === 'confirmed' || value === 'accepted' || value === 'approved') return 'bg-success/15 text-success'
  if (value === 'pending') return 'bg-warning/15 text-warning'
  if (value === 'cancelled' || value === 'declined' || value === 'rejected') return 'bg-error/15 text-error'
  return 'bg-gray-100 text-gray-700'
}
