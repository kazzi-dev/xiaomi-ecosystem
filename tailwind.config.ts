import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#050505',
        mi: { DEFAULT: '#FF6900', soft: '#FF8A3D', deep: '#C94F00' },
        mist: '#A1A1AA',
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: { tightest: '-0.04em' },
    },
  },
  plugins: [],
};

export default config;
