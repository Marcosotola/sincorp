/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./app/**/*.{js,jsx}",
      "./pages/**/*.{js,jsx}",
      "./components/**/*.{js,jsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: {
            DEFAULT: 'var(--primary)',
            light: 'var(--primary-light)',
          },
          secondary: {
            DEFAULT: 'var(--secondary)',
            light: 'var(--secondary-light)',
          },
          info: 'var(--info)',
          success: 'var(--success)',
          warning: 'var(--warning)',
          danger: 'var(--danger)',
        },
        fontFamily: {
          montserrat: ['var(--font-montserrat)'],
          opensans: ['var(--font-sans)'],
        }
      },
    },
    plugins: [],
  }