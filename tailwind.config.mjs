/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Pastel colors for the English teacher
        pastel: {
          blue: "#A8DADC",
          mint: "#A8E6CF",
          peach: "#FFD3BA",
        },
        // Brand colors with variations
        brand: {
          blue: {
            light: "#A8DADC",
            DEFAULT: "#457B9D",
            dark: "#1D3557",
          },
          green: {
            light: "#A8E6CF",
            DEFAULT: "#52B788",
            dark: "#2D6A4F",
          },
        },
        // Neutral colors
        neutral: {
          light: "#F1FAEE",
          gray: "#E9ECEF",
        },
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-in": "slideIn 0.3s ease-out",
        "bounce-soft": "bounceSoft 0.6s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateX(-10px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        bounceSoft: {
          "0%, 20%, 53%, 80%, 100%": { transform: "translateY(0)" },
          "40%, 43%": { transform: "translateY(-8px)" },
          "70%": { transform: "translateY(-4px)" },
          "90%": { transform: "translateY(-2px)" },
        },
      },
      boxShadow: {
        "glow-blue": "0 0 20px rgba(168, 218, 220, 0.3)",
        "glow-green": "0 0 20px rgba(168, 230, 207, 0.3)",
        soft: "0 2px 15px rgba(0, 0, 0, 0.08)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
