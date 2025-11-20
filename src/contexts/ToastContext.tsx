import React, { createContext, useContext } from 'react';
import { useToast } from '../hooks';
import { Toast } from '../components/common/Toast';
import type { AlertColor } from '@mui/material';

interface ToastContextValue {
  showToast: (message: string, severity?: AlertColor) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => undefined,
});

export const ToastProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { toast, showToast, hideToast } = useToast();

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={hideToast}
      />
    </ToastContext.Provider>
  );
};

export const useGlobalToast = () => useContext(ToastContext);
