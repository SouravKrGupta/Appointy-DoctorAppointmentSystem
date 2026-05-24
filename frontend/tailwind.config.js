/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      gridTemplateColumns:{
        'auto':'repeat(auto-fill, minmax(240px, 1fr))'
      },
      colors:{
        'primary':'#0F766E',
        'ink':'#183533',
        'mist':'#F4EEE5',
        'sand':'#D78D5F'
      },
      boxShadow: {
        soft: '0 20px 45px rgba(24, 53, 51, 0.1)',
        float: '0 35px 80px rgba(24, 53, 51, 0.18)',
      }
    },
  },
  plugins: [],
}
