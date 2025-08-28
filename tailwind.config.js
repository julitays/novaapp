export default {
  darkMode: 'class',          // ← ключевая строка
  content: ["./index.html","./src/**/*.{js,jsx,ts,tsx}"],
  theme: { extend: {} },
  safelist: [
    { pattern: /(bg|text)-(green|red|amber|slate)-100/ },
    { pattern: /(text)-(green|red|amber|slate)-700/ },
  ],
  plugins: [],
}
