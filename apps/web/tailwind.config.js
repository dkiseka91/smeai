/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy:      '#1A2744',
        amber:     '#F5A623',
        copper:    '#C07940',
        'near-black': '#1C1C1C',
        'dark-grey': '#404040',
        'light-grey': '#F2F2F2',
        'steel-grey': '#6B7A8D',
      },
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
        opensans:   ['Open Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
