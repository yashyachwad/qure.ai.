/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        coda: ['Coda', 'cursive'],
        fredericka: ['Fredericka the Great', 'cursive'],
        gorditas: ['Gorditas', 'cursive'],
        lobster: ['Lobster Two', 'cursive'],
        outfit: ['Outfit', 'sans-serif'],
        protest: ['Protest Guerrilla', 'sans-serif'],
        strike: ['Protest Strike', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

