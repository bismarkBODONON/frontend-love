/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pink-vivid': '#E4117F',
        'pink-deep': '#9C0F52',
        'pink-pale': '#FBD9E7',
        'text-dark': '#2B1420',
        'text-secondary': '#8A5A70',
      },
      boxShadow: {
        'rose': '0 8px 24px rgba(228,17,127,0.12)',
        'rose-strong': '0 8px 32px rgba(228,17,127,0.25)',
      },
      backgroundImage: {
        'gradient-rose': 'linear-gradient(135deg, #9C0F52, #E4117F)',
        'gradient-aquarelle': 'linear-gradient(180deg, #FDF3F7, #FCE4EE)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}