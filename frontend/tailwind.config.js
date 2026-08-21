/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0B2D5C',
          'navy-dark': '#071F40',
          'navy-light': '#164380',
          royal: '#145DA0',
          'royal-light': '#2A76BE',
          orange: '#F59A23',
          'orange-hover': '#E08512',
          gold: '#E7B44A',
          bg: '#F7F9FC',
          card: '#FFFFFF',
          secondary: '#F1F5F9',
        },
        primary: {
          50:  '#F0F7FF',
          100: '#E6F0FA',
          200: '#CBE0F5',
          300: '#94C0EB',
          400: '#4D96DD',
          500: '#145DA0',
          600: '#0B2D5C',
          700: '#082348',
          800: '#061A36',
          900: '#041124',
        },
        accent: {
          50:  '#FFF9F0',
          100: '#FEF4E6',
          200: '#FDE4C3',
          300: '#FCCA8B',
          400: '#F9AC50',
          500: '#F59A23',
          600: '#E08512',
        },
        text: {
          primary: '#172033',
          secondary: '#64748B',
          muted: '#94A3B8',
        },
        status: {
          success: '#22A06B',
          'success-bg': '#E8F6F0',
          warning: '#F5A524',
          'warning-bg': '#FEF7E6',
          error: '#E5484D',
          'error-bg': '#FDE8E9',
          info: '#3B82F6',
          'info-bg': '#EFF6FF',
          inactive: '#94A3B8',
          'inactive-bg': '#F1F5F9',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'Mukta', 'system-ui', 'sans-serif'],
        marathi: ['Mukta', 'Plus Jakarta Sans', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        'control': '12px',
        'button': '14px',
        'card': '18px',
        'panel': '22px',
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'soft': '0 2px 8px -2px rgba(11, 45, 92, 0.05), 0 1px 3px 0 rgba(0, 0, 0, 0.02)',
        'card-hover': '0 10px 25px -5px rgba(11, 45, 92, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.02)',
        'dropdown': '0 12px 32px -4px rgba(11, 45, 92, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.04)',
        'modal': '0 20px 40px -8px rgba(11, 45, 92, 0.2), 0 8px 16px -4px rgba(0, 0, 0, 0.06)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-up': 'slideUp 220ms cubic-bezier(0.16, 1, 0.3, 1)',
        'dropdown-in': 'dropdownIn 180ms cubic-bezier(0.16, 1, 0.3, 1)',
        'modal-in': 'modalIn 220ms cubic-bezier(0.16, 1, 0.3, 1)',
        'working-pulse': 'pulseWorking 1.8s ease-in-out infinite',
        'kpi-stagger': 'kpiEntrance 400ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        dropdownIn: {
          from: { opacity: 0, transform: 'translateY(-4px) scale(0.98)' },
          to: { opacity: 1, transform: 'translateY(0) scale(1)' },
        },
        modalIn: {
          from: { opacity: 0, transform: 'translateY(8px) scale(0.98)' },
          to: { opacity: 1, transform: 'translateY(0) scale(1)' },
        },
        pulseWorking: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(1.15)' },
        },
        kpiEntrance: {
          from: { opacity: 0, transform: 'translateY(12px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

