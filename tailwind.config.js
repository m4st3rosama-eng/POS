/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/renderer/index.html', './src/renderer/src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1c1712',
        cocoa: '#2b2019',
        bark: '#3c2c20',
        cream: '#f7f1e6',
        parchment: '#efe6d6',
        gold: '#b98a3d',
        goldLight: '#d9ad63',
        sage: '#5c6b52'
      },
      fontFamily: {
        display: ['"Georgia"', '"Times New Roman"', 'serif'],
        body: ['"Segoe UI"', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        card: '0 2px 10px rgba(28, 23, 18, 0.08)',
        panel: '0 0 0 1px rgba(28, 23, 18, 0.06)'
      }
    }
  },
  plugins: []
}
