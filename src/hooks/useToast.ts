// Toast hook for easy usage throughout the application
import { useState, useCallback } from "react";
import type { AlertColor } from "@mui/material";

interface ToastState {
  open: boolean;
  message: string;
  severity: AlertColor;
}

export const useToast = () => {
  const [toast, setToast] = useState<ToastState>({
    open: false,
    message: "",
    severity: "info",
  });

  const showToast = useCallback(
    (message: string, severity: AlertColor = "info") => {
      setToast({ open: true, message, severity });
    },
    []
  );

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, open: false }));
  }, []);

  return { toast, showToast, hideToast };
};
