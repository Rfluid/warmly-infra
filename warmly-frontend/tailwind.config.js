/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        warmly: {
          primary: '#FF7A59',
          secondary: '#FF4E3A',
          bg: '#F8FAFC',
          surface: '#FFFFFF',
          'text-primary': '#0F172A',
          'text-muted': '#334155',
          success: '#22C55E',
          warning: '#F59E0B',
          danger: '#EF4444',
          border: '#E2E8F0',
        },
        warmth: {
          cool: '#60A5FA',
          warm: '#F59E0B',
          hot: '#EF4444',
        },
      },
      borderRadius: {
        'warmly-sm': '8px',
        'warmly-md': '12px',
        'warmly-lg': '16px',
        'warmly-xl': '24px',
      },
      boxShadow: {
        'warmly-card': '0 10px 30px rgba(0, 0, 0, 0.12)',
        'warmly-fab': '0 8px 24px rgba(255, 122, 89, 0.3)',
        'warmly-glass': '0 8px 32px rgba(0, 0, 0, 0.08)',
      },
      backdropBlur: {
        'warmly': '24px',
        'warmly-strong': '28px',
      },
      backgroundImage: {
        'gradient-warmly': 'linear-gradient(135deg, #FF7A59 0%, #FF4E3A 100%)',
        'gradient-warmly-soft': 'linear-gradient(135deg, rgba(255, 122, 89, 0.06) 0%, rgba(255, 78, 58, 0.08) 100%)',
      },
    },
  },
  plugins: [],
}

