/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#191825',       //Bleu nuit profond
        'primary-ghost': 'rgba(25, 24, 37, 0.8)', // Bleu nuit profond 0.8
        secondary: '#FFFFFF',     //Blanc
        'secondary-ghost': 'rgba(255, 255, 255, 0.8)', // Blanc 0.8
        accent: '#476EF6',        //Bleu cobalt vif
        'accent-ghost': 'rgba(71, 110, 246, 0.8)', // Bleu cobalt vif 0.8
        emphasis: '#865DFF',      //Violet électrique
        'emphasis-ghost': 'rgba(134, 93, 255, 0.8)', // Violet électrique 0.8
      },
      fontFamily: {
        geologica: ['Geologica', 'serif'],
        genos: ['Genos', 'serif']
      },
      backgroundImage: {
        'site-pattern': "url('/assets/backgrounds/nature-space-background-star-nebula-cosmos-2025-02-21-13-04-50-utc.jpg')",
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

