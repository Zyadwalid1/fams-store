import { toast } from 'react-hot-toast';
import { createElement } from 'react';
import { FaCheck, FaTimes, FaInfoCircle } from 'react-icons/fa';

const createIcon = (Icon, className) => createElement(Icon, { className });

const baseStyles = {
  style: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    padding: '12px 24px',
    color: '#1a1a1a',
    borderRadius: '12px',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
    fontSize: '14px',
    fontWeight: '500',
    minWidth: '300px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  success: {
    style: {
      background: 'rgba(34, 197, 94, 0.1)',
      border: '1px solid rgba(34, 197, 94, 0.2)',
      color: '#16a34a',
    },
    icon: () => createIcon(FaCheck, "w-5 h-5 text-green-500"),
  },
  error: {
    style: {
      background: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid rgba(239, 68, 68, 0.2)',
      color: '#dc2626',
    },
    icon: () => createIcon(FaTimes, "w-5 h-5 text-red-500"),
  },
  loading: {
    style: {
      background: 'rgba(59, 130, 246, 0.1)',
      border: '1px solid rgba(59, 130, 246, 0.2)',
      color: '#2563eb',
    },
    icon: () => createElement('div', {
      className: "animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"
    }),
  },
};

const darkStyles = {
  style: {
    background: 'rgba(31, 41, 55, 0.95)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#f3f4f6',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
  },
  success: {
    style: {
      background: 'rgba(34, 197, 94, 0.2)',
      border: '1px solid rgba(34, 197, 94, 0.3)',
      color: '#4ade80',
    },
  },
  error: {
    style: {
      background: 'rgba(239, 68, 68, 0.2)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      color: '#f87171',
    },
  },
  loading: {
    style: {
      background: 'rgba(59, 130, 246, 0.2)',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      color: '#60a5fa',
    },
  },
};

// Dark mode styles
export const darkToastStyles = {
  ...baseStyles,
  style: { ...baseStyles.style, ...darkStyles.style },
  success: { ...baseStyles.success, style: { ...baseStyles.success.style, ...darkStyles.success.style } },
  error: { ...baseStyles.error, style: { ...baseStyles.error.style, ...darkStyles.error.style } },
  loading: { ...baseStyles.loading, style: { ...baseStyles.loading.style, ...darkStyles.loading.style } },
};

// Custom toast functions
export const showToast = {
  success: (message) => {
    toast.success(message, {
      duration: 3000,
      style: baseStyles.style,
      icon: baseStyles.success.icon(),
    });
  },
  error: (message) => {
    toast.error(message, {
      duration: 4000,
      style: baseStyles.style,
      icon: baseStyles.error.icon(),
    });
  },
  loading: (message) => {
    toast.loading(message, {
      style: baseStyles.style,
      icon: baseStyles.loading.icon(),
    });
  },
  promise: async (promise, messages) => {
    return toast.promise(
      promise,
      {
        loading: {
          message: messages.loading || 'Loading...',
          style: { ...baseStyles.style, ...baseStyles.loading.style },
          icon: baseStyles.loading.icon(),
        },
        success: {
          message: messages.success || 'Success!',
          style: { ...baseStyles.style, ...baseStyles.success.style },
          icon: baseStyles.success.icon(),
        },
        error: {
          message: messages.error || 'An error occurred.',
          style: { ...baseStyles.style, ...baseStyles.error.style },
          icon: baseStyles.error.icon(),
        },
      }
    );
  },
  custom: (message, options = {}) => {
    return toast(message, {
      duration: 3000,
      style: baseStyles.style,
      ...options,
    });
  },
};

export const toastStyles = baseStyles; 