/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#eef1f7',
          100: '#dbe1ee',
          200: '#b3c0d9',
          300: '#8a9fc4',
          400: '#4f6695',
          500: '#2c3e6b',
          600: '#1e2a4f',
          700: '#18213e',
          800: '#121830',
          900: '#0c1020',
        },
        gold: {
          50: '#fbf6e9',
          100: '#f5e9c4',
          200: '#ecd584',
          300: '#dfbe5a',
          400: '#cda647',
          500: '#bd923a',
          600: '#a47c2e',
          700: '#856425',
        },
      },
    },
  },
  plugins: [],
}
