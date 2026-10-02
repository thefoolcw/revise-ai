import type { Config } from 'tailwindcss';
import forms from '@tailwindcss/forms';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { 50:'#f6f8fa',100:'#eaeef3',200:'#d3dbe5',300:'#a9b7c8',400:'#7b8ea6',500:'#5a6d85',600:'#455569',700:'#364455',800:'#26303d',900:'#161d26',950:'#0b0f14' },
        brand: { 50:'#eef7f4',100:'#d6ece5',200:'#aed9cb',300:'#7cc0ac',400:'#4da38b',500:'#2c8871',600:'#1f6d5b',700:'#1a5749',800:'#16453b',900:'#123931',950:'#08201b' },
        amber2: { 400:'#e8a33d', 500:'#d18f22' },
        plum: { 400:'#8b7bd8', 500:'#6f5cc4' }
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace']
      },
      boxShadow: {
        card: '0 1px 2px rgba(11,15,20,.05), 0 8px 24px -12px rgba(11,15,20,.18)',
        lift: '0 2px 4px rgba(11,15,20,.06), 0 18px 40px -16px rgba(11,15,20,.28)'
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(.16,1,.3,1)',
        spring: 'cubic-bezier(.34,1.4,.5,1)'
      },
      keyframes: {
        rise: { from: { opacity: '0', transform: 'translateY(14px)' }, to: { opacity: '1', transform: 'none' } },
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        drift: { '0%,100%': { transform: 'translate3d(0,0,0)' }, '50%': { transform: 'translate3d(0,-14px,0)' } },
        pulseRing: { '0%': { transform:'scale(.9)',opacity:'.5' }, '70%': { transform:'scale(1.6)',opacity:'0' }, '100%':{opacity:'0'} }
      },
      animation: {
        rise: 'rise .6s cubic-bezier(.16,1,.3,1) both',
        fadeIn: 'fadeIn .4s ease both',
        shimmer: 'shimmer 1.6s infinite',
        drift: 'drift 9s ease-in-out infinite'
      }
    }
  },
  plugins: [forms]
};
export default config;
