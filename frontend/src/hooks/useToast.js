import { toast as hotToast } from 'react-hot-toast';

/**
 * useToast — thin wrapper around react-hot-toast
 * Provides consistent styling aligned with the dark-violet design system.
 */
const toastStyles = {
  style: {
    background: '#16162e',
    color: '#f1f5f9',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    fontSize: '14px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
  },
};

const toast = {
  success: (message, options = {}) =>
    hotToast.success(message, {
      ...toastStyles,
      iconTheme: { primary: '#22c55e', secondary: '#16162e' },
      duration: 3500,
      ...options,
    }),

  error: (message, options = {}) =>
    hotToast.error(message, {
      ...toastStyles,
      iconTheme: { primary: '#ef4444', secondary: '#16162e' },
      duration: 4500,
      ...options,
    }),

  info: (message, options = {}) =>
    hotToast(message, {
      ...toastStyles,
      icon: 'ℹ️',
      duration: 3500,
      ...options,
    }),

  loading: (message, options = {}) =>
    hotToast.loading(message, {
      ...toastStyles,
      iconTheme: { primary: '#5840f0', secondary: '#16162e' },
      ...options,
    }),

  dismiss: (id) => hotToast.dismiss(id),
};

const useToast = () => ({ toast });

export { toast };
export default useToast;
