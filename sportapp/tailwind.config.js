/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Orange action buttons
        orange: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316', // Main orange
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        // Black and gray palette
        black: '#000000',
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
        // Updated theme colors
        background: '#000000',
        foreground: '#f9fafb',
        card: '#111827',
        'card-foreground': '#f9fafb',
        border: '#374151',
        input: '#1f2937',
        ring: '#f97316',
        accent: '#1f2937',
        'accent-foreground': '#f9fafb',
        secondary: '#374151',
        'secondary-foreground': '#f9fafb',
        muted: '#374151',
        'muted-foreground': '#9ca3af',
        primary: '#f97316',
        'primary-foreground': '#ffffff',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 50%, #7c3aed 100%)',
        'card-gradient': 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        dark: {
          "primary": "#3b82f6",
          "secondary": "#374151",
          "accent": "#06b6d4",
          "neutral": "#1f2937",
          "base-100": "#0a0e1a",
          "base-200": "#1a1f2e",
          "base-300": "#2a3441",
          "info": "#06b6d4",
          "success": "#10b981",
          "warning": "#f59e0b",
          "error": "#ef4444",
        },
      },
    ],
    darkTheme: "dark",
  },
}
