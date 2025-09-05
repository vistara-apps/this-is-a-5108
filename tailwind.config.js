/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(210, 70%, 50%)',
        accent: 'hsl(160, 70%, 45%)',
        surface: 'hsl(0, 0%, 100%)',
        'text-primary': 'hsl(210, 40%, 15%)',
        'text-secondary': 'hsl(210, 20%, 40%)',
        'bg-main': 'hsl(210, 36%, 96%)',
      },
      borderRadius: {
        'xs': '4px',
        'sm': '6px',
        'md': '10px',
        'lg': '16px',
        'xl': '100%',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
      },
      boxShadow: {
        'card': '0 4px 12px hsla(210, 40%, 10%, 0.1)',
        'modal': '0 12px 28px hsla(210, 40%, 10%, 0.16)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}