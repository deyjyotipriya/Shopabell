import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary-purple': '#8B5CF6',
        'secondary-pink': '#EC4899',
        'background-light': '#FAF5FF',
        'background-white': '#FFFFFF',
        'text-primary': '#1F2937',
        'text-secondary': '#6B7280',
        'success-green': '#10B981',
        'error-red': '#EF4444',
        'warning-orange': '#F59E0B',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'hero': ['48px', { lineHeight: '1.2', fontWeight: '700' }],
        'h1': ['36px', { lineHeight: '1.2', fontWeight: '700' }],
        'h2': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'h3': ['20px', { lineHeight: '1.3', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'small': ['12px', { lineHeight: '1.5', fontWeight: '400' }],
      },
    },
  },
  plugins: [],
}

export default config
