/** @type {import('tailwindcss').Config} */
import forms from "@tailwindcss/forms";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#F8FAFC',
        surface: '#FFFFFF',
        sidebar: '#1A2B1F',
        primary: {
          DEFAULT: '#5BC470',
          hover: '#4AAF5E',
          light: '#EEF8F0',
        },
        secondary: {
          DEFAULT: '#A8C94A',
          hover: '#92B03A',
          light: '#F5FAE8',
        },
        text: {
          DEFAULT: '#0F1F12',
          secondary: '#4A6352',
        },
        border: '#D8EAD8',
        success: '#5BC470',
        warning: '#D97706',
        danger: '#DC2626',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [
    forms({
      strategy: 'class',
    }),
  ],
};
