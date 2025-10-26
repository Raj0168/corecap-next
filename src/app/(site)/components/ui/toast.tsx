// app/(site)/components/ui/toast.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  JSX,
  useEffect,
} from "react";
import { CheckCircle2, AlertTriangle, XCircle, X } from "lucide-react";

// -------------------- TYPES --------------------
export type ToastType = "success" | "error" | "warning";

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  toast: (t: { type: ToastType; message: string }) => void;
}

// -------------------- CONTEXT --------------------
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// -------------------- GLOBAL TOAST --------------------
// This allows triggering a toast outside React components
let globalToast: (t: { type: ToastType; message: string }) => void;

export const toastGlobal = (t: { type: ToastType; message: string }) => {
  if (globalToast) globalToast(t);
};

// -------------------- PROVIDER --------------------
export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (t: { type: ToastType; message: string }) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, ...t }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((x) => x.id !== id)),
      3500
    );
  };

  // Set the global reference on mount
  useEffect(() => {
    globalToast = toast;
  }, []);

  const removeToast = (id: number) =>
    setToasts((prev) => prev.filter((x) => x.id !== id));

  // Icons for each toast type
  const iconMap: Record<ToastType, JSX.Element> = {
    success: (
      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
    ),
    warning: (
      <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
    ),
    error: <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />,
  };

  // Background / border / text color
  const colorMap: Record<ToastType, string> = {
    success:
      "bg-green-50 border-green-300 text-green-800 dark:bg-green-900/30 dark:text-green-100",
    warning:
      "bg-yellow-50 border-yellow-300 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-100",
    error:
      "bg-red-50 border-red-300 text-red-800 dark:bg-red-900/30 dark:text-red-100",
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* TOAST CONTAINER */}
      <div className="fixed top-5 right-5 z-50 flex flex-col space-y-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center justify-between w-80 p-4 rounded-xl shadow-lg border backdrop-blur-sm animate-fade-in-up ${
              colorMap[t.type]
            }`}
          >
            <div className="flex items-center gap-3">
              {iconMap[t.type]}
              <span className="text-sm font-medium">{t.message}</span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// -------------------- HOOK --------------------
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};
