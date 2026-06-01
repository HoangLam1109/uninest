/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#F28C1B",
          ink: "#181A20",
          muted: "#98A0AB",
          line: "#E7E2DA",
          surface: "#FFFFFF",
        },
      },
    },
  },
  plugins: [],
};
