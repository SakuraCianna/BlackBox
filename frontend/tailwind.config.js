/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Microsoft YaHei UI"', '"Noto Sans SC"', 'sans-serif'],
        mono: ['"Cascadia Code"', '"JetBrains Mono"', 'monospace'],
      },
      colors: {
        cockpit: '#071011',
        panel: '#0d1c1c',
        radar: '#74f2c6',
        amber: '#ffb454',
        danger: '#ff6b57',
        paper: '#e8ddc7',
      },
      boxShadow: {
        glow: '0 0 32px rgba(116, 242, 198, 0.18)',
        amber: '0 0 24px rgba(255, 180, 84, 0.2)',
      },
    },
  },
  plugins: [],
};
