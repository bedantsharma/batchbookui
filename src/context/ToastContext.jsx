import { useEffect, useState } from "react";
import { Alert, Snackbar } from "@mui/material";
import { toastEmitter } from "../lib/toastEmitter";

/**
 * ToastProvider — renders a single MUI Snackbar anchored to the bottom-centre.
 *
 * Register it once near the root of the app (inside ThemeProvider, outside
 * Router). Any module can call `toastEmitter.emit(message, severity)` to
 * trigger a toast without threading React context through the call stack.
 */
export function ToastProvider({ children }) {
  const [toast, setToast] = useState({ open: false, message: "", severity: "error" });

  useEffect(() => {
    toastEmitter.register((message, severity = "error") => {
      setToast({ open: true, message, severity });
    });
    return () => toastEmitter.register(null);
  }, []);

  function handleClose(_event, reason) {
    if (reason === "clickaway") return;
    setToast((t) => ({ ...t, open: false }));
  }

  return (
    <>
      {children}
      <Snackbar
        open={toast.open}
        autoHideDuration={5000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={toast.severity} onClose={handleClose} sx={{ width: "100%" }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </>
  );
}
