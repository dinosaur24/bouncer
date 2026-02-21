"use client";

import { type ReactNode, useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: string;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  width = "max-w-lg",
}: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 animate-[fadeIn_0.15s_ease-out]"
        onClick={onClose}
      />
      <div
        className={`relative bg-white border border-border p-8 ${width} w-full mx-4 animate-[scaleIn_0.15s_ease-out]`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-lg font-semibold text-dark">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray hover:text-dark cursor-pointer transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
