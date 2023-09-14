/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: {
    content: [
      './src/*.{tsx,ts}',
      './src/components/*.{tsx,ts}'
    ],
    enabled: false, // Disable tree shaking
  },
  safelist: [
    {
      pattern: /^.*$/, // Match any class pattern during development
    },
  ],
  content: [],
  theme: {
    extend: {
      colors: {
        prodPrimary: "#edf4fc",
        prodSecondary: "#add0f7",
        prodMainArea: "#c5d2e0",
        prodError: "#f59a9a",
        prodMessage: "#c4ffc4",
        prodWarning: "#fe5d5d",
      },
    },
  },
  plugins: [],
}
