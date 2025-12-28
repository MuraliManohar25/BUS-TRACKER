/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#2b8cee",
        "background-light": "#f6f7f8",
        "background-dark": "#101922",
      },
      fontFamily: {
<<<<<<< HEAD
        "display": ["Inter", "system-ui","sans-serif"]
=======
        "display": ["Inter","system-ui", "sans-serif"]
>>>>>>> dc43d9005eadfc665dee902509676fa6e79b112f
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "full": "9999px"
      },
    },
  },
  plugins: [],
}

