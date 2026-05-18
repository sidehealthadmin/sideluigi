import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#F0F1FF',
          100: '#E0E1FF',
          200: '#C7CBFF',
          300: '#9FA4F4',
          400: '#7C8AF0',
          500: '#6472E8',
          600: '#4F5FD4',
          700: '#4F46E5',
          800: '#3730A3',
          900: '#312E81',
        },
        surface: '#FFFFFF',
        bg: {
          DEFAULT: '#F8F9FC',
          2: '#F1F3F8',
          3: '#E8ECF4',
        },
        border: {
          DEFAULT: '#E2E6F0',
          2: '#C8CDD9',
        },
        txt: {
          DEFAULT: '#0C0F1A',
          2: '#2D3148',
          3: '#606880',
          4: '#9CA3B4',
        },
        status: {
          red: '#E83E3E',
          'red-bg': '#FEF2F2',
          'red-border': '#FECACA',
          green: '#16A34A',
          'green-bg': '#F0FDF4',
          'green-border': '#BBF7D0',
          amber: '#D97706',
          'amber-bg': '#FFFBEB',
          'amber-border': '#FDE68A',
        },
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '8px',
        lg: '12px',
      },
    },
  },
  plugins: [],
}
export default config
