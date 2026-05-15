import { getCategoryIcon } from '@/lib/utils'

export default function CategoryIcon({ category, className = 'h-5 w-5' }) {
  const Icon = getCategoryIcon(category)
  return <Icon className={className} />
}
