/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#00fff5", // Custom Blue
        secondary: "#001d3d", // Custom Red
        darkGray: "#374151", // Custom Gray
      },
    },
  },
  daisyui: {
    themes: ["light", "dark","black"],
  },
  plugins: [
    require('daisyui'),
  ],
}