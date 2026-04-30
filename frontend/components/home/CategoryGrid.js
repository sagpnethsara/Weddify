import Link from 'next/link'
import Image from 'next/image'

const categories = [
  {
    name: 'Venues',
    description: 'Banquet halls, hotels, garden venues',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Photographers',
    description: 'Photo and video coverage packages',
    image: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Decorators',
    description: 'Floral arrangements, themes, full setup',
    image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Catering',
    description: 'Sri Lankan, Western and fusion menus',
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Attire & Beauty',
    description: 'Bridal wear, makeup, groom attire',
    image: 'https://images.unsplash.com/photo-1519741347686-c1e0aadf4611?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Wedding Cakes',
    description: 'Custom designed tiered wedding cakes',
    image: 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Invitations',
    description: 'Printed cards, laser cut, digital invites',
    image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Wedding Cars',
    description: 'Vintage, luxury and decorated bridal cars',
    image: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Entertainment',
    description: 'Live bands, DJs, sound and lighting',
    image: 'https://images.unsplash.com/photo-1501612780327-45045538702b?auto=format&fit=crop&w=600&q=80'
  }
]

export default function CategoryGrid() {
  return (
    <section className="section-container py-20">
      <div className="text-center">
        <p className="chip">Vendor Categories</p>
        <h2 className="section-title mt-4">Explore Wedding Services</h2>
        <p className="mt-3 text-textSecondary">Everything you need for your perfect day, all in one place</p>
      </div>
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <article key={cat.name} className="surface-card group overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-primary/50">
            <div className="relative h-44 w-full overflow-hidden">
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
            <div className="p-6">
              <h3 className="font-heading text-2xl leading-tight">{cat.name}</h3>
              <p className="mt-2 text-sm text-textSecondary">{cat.description}</p>
              <Link
                href={`/vendors?category=${encodeURIComponent(cat.name)}`}
                className="mt-4 inline-block text-sm font-semibold text-primary transition group-hover:translate-x-0.5"
              >
                Browse Vendors →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
