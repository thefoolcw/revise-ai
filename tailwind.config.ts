import type { Config } from 'tailwindcss';
import forms from '@tailwindcss/forms';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1',
          400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155',
          800: '#1e293b', 900: '#0f172a', 950: '#080d1a'
        },
        brand: {
          50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd',
          400: '#60a5fa', 500: '#3b82f6', 600: '#1d4ed8', 700: '#1e40af',
          800: '#1e3a8a', 900: '#172554', 950: '#0c1633'
        },
        gold: {
          50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d',
          400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309',
          800: '#92400e', 900: '#78350f'
        }
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace']
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,.04), 0 8px 24px -12px rgba(15,23,42,.12)',
        lift: '0 2px 4px rgba(15,23,42,.05), 0 18px 40px -16px rgba(15,23,42,.20)'
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(.16,1,.3,1)',
        spring: 'cubic-bezier(.34,1.4,.5,1)'
      },
      keyframes: {
        rise: { from: { opacity: '0', transform: 'translateY(14px)' }, to: { opacity: '1', transform: 'none' } },
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        shimmer: { '100%': { transform: 'translateX(100%)' } }
      },
      animation: {
        rise: 'rise .5s cubic-bezier(.16,1,.3,1) both',
        fadeIn: 'fadeIn .35s ease both',
        shimmer: 'shimmer 1.6s infinite'
      }
    }
  },
  plugins: [forms]
};
export default config;
