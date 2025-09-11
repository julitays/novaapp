// tailwind.config.js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 6px 24px rgba(31,41,55,0.06)",
        card: "0 10px 30px rgba(31,41,55,0.08)",
      },
      colors: {
        brand: {
          50:"#eef2ff",100:"#e0e7ff",200:"#c7d2fe",300:"#a5b4fc",
          400:"#818cf8",500:"#6366f1",600:"#4f46e5",700:"#4338ca"
        },
        mint: { 50:"#ecfeff",100:"#cffafe",200:"#a5f3fc" },
      },
    },
  },
  plugins: [],
};
