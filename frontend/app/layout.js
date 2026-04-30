import { Manrope, Cormorant_Garamond } from 'next/font/google'
import './globals.css'
import AppProviders from '@/components/common/AppProviders'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ChatWidget from '@/components/chat/ChatWidget'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope'
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['400', '500', '600', '700']
})

export const metadata = {
  title: 'Weddify | AI Wedding Vendor Platform',
  description: 'Plan your perfect Sri Lankan wedding with AI-powered vendor recommendations.'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${cormorant.variable}`}>
        <AppProviders>
          <div className="relative min-h-screen overflow-x-clip">
            <div className="pointer-events-none absolute left-[-14rem] top-16 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
            <div className="pointer-events-none absolute bottom-20 right-[-14rem] h-80 w-80 rounded-full bg-accent/15 blur-3xl" />
            <Navbar />
            <main className="relative z-10 pt-[var(--nav-height)]">{children}</main>
            <Footer />
            <ChatWidget />
          </div>
        </AppProviders>
      </body>
    </html>
  )
}
