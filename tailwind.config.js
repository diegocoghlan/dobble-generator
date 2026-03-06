/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        '10': '10px',
      },
      colors: {
        palette: {
          accent: '#7C3AED',
          accentHover: '#5B21B6',
          primary: '#111827',
          muted: '#6B7280',
          bg: '#FFFFFF',
          surface: '#F3F4F6',
          border: '#D1D5DB',
          borderLight: '#E5E7EB',
          purpleLight: '#EDE9FE',
        },
      },
    },
  },
  plugins: [],
}
