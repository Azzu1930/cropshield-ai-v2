import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        farm: {
          50: '#f2fbf5',
          100: '#e1f6e9',
          200: '#c5ecd4',
          300: '#97dcb4',
          400: '#62c38e',
          500: '#3ba76f',
          600: '#2c8757',
          700: '#256c47',
          800: '#21563b',
          900: '#1d4732',
          950: '#0b271b',
        },
        earth: {
          50: '#fbf8f4',
          100: '#f5eee5',
          200: '#ebdcce',
          300: '#dcc3ad',
          400: '#cca589',
          500: '#bf8d6d',
          600: '#b0795c',
          700: '#92614b',
          800: '#765040',
          900: '#604236',
        }
      },
      fontSize: {
        'farmer-xl': ['1.625rem', { lineHeight: '2.125rem', fontWeight: '700' }],
        'farmer-2xl': ['2rem', { lineHeight: '2.5rem', fontWeight: '800' }],
      },
      boxShadow: {
        'touch': '0 8px 24px -4px rgba(33, 86, 59, 0.12), 0 4px 8px -2px rgba(0, 0, 0, 0.04)',
        'touch-active': '0 2px 6px -1px rgba(33, 86, 59, 0.2)',
      }
    },
  },
  plugins: [],
};
export default config;
