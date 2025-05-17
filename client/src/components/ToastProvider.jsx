import { Toaster } from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { toastStyles, darkToastStyles } from '../utils/toast';
import { useEffect, useState } from 'react';

export const ToastProvider = ({ children }) => {
  const { isDarkMode } = useTheme();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {children}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerStyle={{
          position: 'fixed',
          inset: `EGP{Math.max(scrollY + 80, 80)}px 16px auto auto`,
          zIndex: 9999,
        }}
        toastOptions={{
          style: {
            ...(isDarkMode ? darkToastStyles.style : toastStyles.style),
          },
          success: {
            style: isDarkMode ? darkToastStyles.success.style : toastStyles.success.style,
            icon: toastStyles.success.icon(),
          },
          error: {
            style: isDarkMode ? darkToastStyles.error.style : toastStyles.error.style,
            icon: toastStyles.error.icon(),
          },
          loading: {
            style: isDarkMode ? darkToastStyles.loading.style : toastStyles.loading.style,
            icon: toastStyles.loading.icon(),
          },
          duration: 4000,
        }}
      />
    </>
  );
}; 