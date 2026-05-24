/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        auto: 'repeat(auto-fill, minmax(240px, 1fr))'
      },
      colors: {
        primary: '#145A72',
        ink: '#16323F',
        mist: '#F2F6F8',
        linen: '#F6F0E8',
        accent: '#D8893D'
      },
      boxShadow: {
        float: '0 24px 60px rgba(18, 47, 60, 0.14)',
        soft: '0 14px 40px rgba(18, 47, 60, 0.1)'
      }
    },
  },
  plugins: [],
}
