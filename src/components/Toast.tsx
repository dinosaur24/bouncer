"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { Check, AlertTriangle, X } from "lucide-react";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

const ToastContext = createContext<{
  addToast: (message: string, type?: Toast["type"]) => void;
}>({ addToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (message: string, type: Toast["type"] = "success") => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    },
    []
  );

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-6 right-6 flex flex-col gap-2 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-5 py-3.5 border shadow-lg animate-[slideIn_0.2s_ease-out] rounded-lg ${
              toast.type === "success"
                ? "bg-white border-[#22C55E]/20"
                : toast.type === "error"
                  ? "bg-white border-[#E42313]/20"
                  : "bg-white border-border"
            }`}
          >
            {toast.type === "success" && (
              <div className="w-5 h-5 bg-[#22C55E] rounded-md flex items-center justify-center shrink-0">
                <Check size={12} className="text-white" />
              </div>
            )}
            {toast.type === "error" && (
              <div className="w-5 h-5 bg-[#E42313] rounded-md flex items-center justify-center shrink-0">
                <AlertTriangle size={12} className="text-white" />
              </div>
            )}
            <span className="font-heading text-[13px] font-medium text-dark">
              {toast.message}
            </span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 text-gray hover:text-dark cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
