/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './context/**/*.{js,jsx}',
    './lib/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#B76E79',
        background: '#FFF8F0',
        accent: '#2D6A4F',
        textPrimary: '#1A1A1A',
        textSecondary: '#6B7280',
        border: '#E5E7EB',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        card: '#FFFFFF'
      },
      fontFamily: {
        heading: ['var(--font-cormorant)', 'serif'],
        body: ['var(--font-manrope)', 'sans-serif']
      },
      boxShadow: {
        soft: '0 12px 40px rgba(26, 26, 26, 0.08)',
        panel: '0 20px 60px rgba(38, 24, 29, 0.16)'
      },
      backgroundImage: {
        'rose-gradient': 'linear-gradient(135deg, #B76E79 0%, #d5929b 100%)',
        'green-gradient': 'linear-gradient(135deg, #2D6A4F 0%, #478e6c 100%)',
        'champagne-gradient': 'linear-gradient(140deg, #fff8f0 0%, #ffe9cf 50%, #ffd7cf 100%)'
      }
    }
  },
  plugins: []
}
