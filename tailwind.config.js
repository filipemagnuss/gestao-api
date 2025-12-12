/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0f172a', 
          800: '#1e293b', 
          700: '#334155', 
        },
        brand: {
          green: '#10b981',
          red: '#ef4444',
          yellow: '#f59e0b'
        }
      }
    },
  },
  plugins: [],
}