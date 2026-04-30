import Link from 'next/link'
import { Gem, Globe, MessageCircle, Send, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-border/70 bg-white/70 backdrop-blur">
      <div className="section-container py-14">
        <div className="glass-panel mb-10 grid gap-4 p-6 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="chip">Built For Sri Lankan Weddings</p>
            <h3 className="mt-3 font-heading text-3xl text-textPrimary">Plan better with data-backed vendor recommendations.</h3>
          </div>
          <Link href="/vendors" className="btn-primary whitespace-nowrap">Explore Vendors</Link>
        </div>

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-gradient text-white">
                <Gem size={17} />
              </div>
              <span className="font-heading text-3xl font-semibold text-primary">Weddify</span>
            </div>
            <p className="text-sm text-textSecondary">
              AI-powered wedding planning for Sri Lankan couples, from discovery to booking management.
            </p>
            <div className="mt-5 flex items-center gap-3 text-textSecondary">
              <Globe size={18} />
              <MessageCircle size={18} />
              <Send size={18} />
            </div>
          </div>

          <div>
            <h4 className="font-heading text-2xl">Quick Links</h4>
            <div className="mt-4 space-y-2 text-sm text-textSecondary">
              <Link href="/" className="block transition hover:text-primary">Home</Link>
              <Link href="/vendors" className="block transition hover:text-primary">Find Vendors</Link>
              <Link href="/#how-it-works" className="block transition hover:text-primary">How It Works</Link>
              <Link href="/about" className="block transition hover:text-primary">About</Link>
              <Link href="/contact" className="block transition hover:text-primary">Contact</Link>
            </div>
          </div>

          <div>
            <h4 className="font-heading text-2xl">For Vendors</h4>
            <div className="mt-4 space-y-2 text-sm text-textSecondary">
              <Link href="/register" className="block transition hover:text-primary">Register</Link>
              <Link href="/login" className="block transition hover:text-primary">Login</Link>
              <Link href="/about" className="block transition hover:text-primary">How It Works</Link>
              <Link href="/contact" className="block transition hover:text-primary">Support</Link>
            </div>
          </div>

          <div>
            <h4 className="font-heading text-2xl">Contact</h4>
            <div className="mt-4 space-y-3 text-sm text-textSecondary">
              <p className="flex items-center gap-2"><Mail size={16} /> info@weddify.lk</p>
              <p className="flex items-center gap-2"><Phone size={16} /> +94 11 234 5678</p>
              <p className="flex items-center gap-2"><MapPin size={16} /> Colombo 03, Sri Lanka</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border/70 py-4 text-center text-sm text-textSecondary">
        <p>© 2026 Weddify. All rights reserved.</p>
        <p className="mt-1">Built with love for Sri Lankan couples</p>
      </div>
    </footer>
  )
}
