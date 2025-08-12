// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
      extend: {
        colors: {
          'diambars-blue': {
            primary: '#040DBF',
            secondary: '#1F64BF',
            light: '#032CA6',
          }
        }
      },
    },
    plugins: [],
  }