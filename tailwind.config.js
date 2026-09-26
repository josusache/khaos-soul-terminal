/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        khaos: {
          black: '#050505',
          void: '#080808',
          panel: '#0B0B0C',
          white: '#EDEDEA',
          clinical: '#F5F5F0',
          gold: '#B99A53',
          goldBright: '#D6BA72',
          goldMuted: '#8E7443',
          red: '#B5161B',
          redAlert: '#EA1D25',
        }
      },
      fontFamily: {
        display: ['"Barlow Condensed"', '"Space Grotesk"', 'sans-serif'],
        sans: ['"Space Grotesk"', '"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Share Tech Mono"', 'monospace'],
      },
      letterSpacing: {
        terminal: '0.18em',
        brutal: '0.26em',
      }
    },
  },
  plugins: [],
}
