'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Gem, LayoutDashboard, LogOut, MessageCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { nodeAPI } from '@/lib/api'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Find Vendors', href: '/vendors' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' }
]

const dashboardByRole = {
  couple: '/dashboard',
  vendor: '/vendor/dashboard',
  admin: '/admin'
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const { user, isAuthenticated, logout } = useAuth()
  const pathname = usePathname()

  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    if (!isAuthenticated) return
    const poll = async () => {
      try {
        const { data } = await nodeAPI.get('/api/messages/unread-count')
        setUnread(data.count || 0)
      } catch (_) {}
    }
    poll()
    const id = setInterval(poll, 20000)
    return () => clearInterval(id)
  }, [isAuthenticated])

  const userLabel = user?.groomName || user?.businessName || user?.email

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/25 bg-background/85 backdrop-blur-2xl">
      <nav className="section-container flex h-[var(--nav-height)] items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-gradient text-white shadow-soft">
            <Gem size={18} />
          </div>
          <span className="font-heading text-3xl font-semibold text-primary">Weddify</span>
        </Link>

        <div className="hidden items-center gap-2 lg:flex">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                pathname === item.href ? 'bg-primary/10 text-primary' : 'text-textPrimary hover:bg-white hover:text-primary'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2.5 lg:flex">
          {!isAuthenticated ? (
            <>
              <Link href="/login" className="btn-secondary">
                Login
              </Link>
              <Link href="/register" className="btn-primary">
                Register
              </Link>
            </>
          ) : (
            <>
              <span className="hidden rounded-full border border-border/80 bg-white/80 px-4 py-2 text-sm font-medium text-textPrimary xl:inline-flex">
                {userLabel}
              </span>
              <span className="chip">{user?.role}</span>
              <Link href="/messages" className="relative rounded-xl border border-border bg-white/80 p-2.5 text-textPrimary hover:border-primary/40 hover:text-primary transition-colors">
                <MessageCircle size={18} />
                {unread > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white">
                    {unread > 99 ? '99+' : unread}
                  </span>
                )}
              </Link>
              <Link href={dashboardByRole[user?.role] || '/dashboard'} className="btn-primary gap-2 px-4">
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <button onClick={logout} className="btn-ghost gap-2 border-error/50 text-error hover:border-error/70 hover:text-error">
                <LogOut size={16} /> Logout
              </button>
            </>
          )}
        </div>

        <button onClick={() => setOpen((v) => !v)} className="rounded-xl border border-border bg-white/80 p-2.5 text-textPrimary lg:hidden" aria-label="Toggle menu">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="border-t border-white/35 bg-background/95 backdrop-blur-2xl lg:hidden"
          >
            <div className="section-container py-5">
              {isAuthenticated && (
                <div className="mb-4 surface-card p-4">
                  <p className="text-sm font-semibold text-textPrimary">{userLabel}</p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-textSecondary">Signed in as {user?.role}</p>
                </div>
              )}

              <div className="flex flex-col gap-2">
                {navLinks.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`rounded-xl px-3 py-2.5 text-sm font-semibold ${
                      pathname === item.href ? 'bg-primary/10 text-primary' : 'text-textPrimary hover:bg-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <div className="mt-5 flex flex-col gap-2 border-t border-border/70 pt-5">
                {!isAuthenticated ? (
                  <>
                    <Link href="/login" onClick={() => setOpen(false)} className="btn-secondary w-full">
                      Login
                    </Link>
                    <Link href="/register" onClick={() => setOpen(false)} className="btn-primary w-full">
                      Register
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href={dashboardByRole[user?.role] || '/dashboard'} onClick={() => setOpen(false)} className="btn-primary w-full">
                      Dashboard
                    </Link>
                    <Link href="/messages" onClick={() => setOpen(false)} className="btn-ghost relative w-full gap-2">
                      <MessageCircle size={16} /> Messages
                      {unread > 0 && (
                        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">
                          {unread}
                        </span>
                      )}
                    </Link>
                    <button onClick={logout} className="btn-ghost w-full border-error/50 text-error">
                      Logout
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
