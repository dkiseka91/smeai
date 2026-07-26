/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0B0F14',
        surface: '#111826',
        'surface-alt': '#1A2333',
        border: '#232E42',
        primary: '#7C5CFC',
        accent: '#22D3EE',
        pass: '#22C55E',
        warn: '#F5A623',
        fail: '#EF4444',
        ink: '#E6EDF3',
        'ink-muted': '#8B98A5',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(124, 92, 252, 0.35)',
      },
    },
  },
  plugins: [],
};
