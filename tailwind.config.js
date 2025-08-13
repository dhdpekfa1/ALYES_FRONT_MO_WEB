/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        green: {
          100: '#FBFEFC',
          200: '#ECF9F1',
          300: '#D8F3E3',
          400: '#9EE0B9',
          500: '#76D39C',
          600: '#51C781',
          700: '#38AE68',
        },

        grey: {
          0: '#FFFFFF',
          50: '#FAFAFA',
          100: '#EFEFEF',
          200: '#E8E8E8',
          300: '#D4D4D4',
          400: '#B3B3B3',
          500: '#9A9999',
          600: '#747373',
          700: '#4D4D4D',
          800: '#373737',
          900: '#303030',
        },
        error: '#FF6E69',
        caution: '#FFE29D',
        confirm: '#699DFF',
        border: '#E8E8E8',
        input: '#E8E8E8',
        ring: '#699DFF',
        background: '#FFFFFF',
        foreground: '#303030',
        primary: {
          DEFAULT: '#699DFF',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#F5F5F5',
          foreground: '#303030',
        },
        destructive: {
          DEFAULT: '#FF6E69',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#F5F5F5',
          foreground: '#747373',
        },
        accent: {
          DEFAULT: '#F5F5F5',
          foreground: '#303030',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#303030',
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#303030',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
