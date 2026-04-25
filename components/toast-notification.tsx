"use client";

import { cn } from "@/lib/utils";
import { useEffect } from "react";

interface ToastNotificationProps {
  message: string;
  type: "success" | "error" | "info";
  isVisible: boolean;
  onClose: () => void;
}

export function ToastNotification({
  message,
  type,
  isVisible,
  onClose,
}: ToastNotificationProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  const typeStyles = {
    success: "bg-neon-green/20 border-neon-green/50 text-neon-green",
    error: "bg-neon-red/20 border-neon-red/50 text-neon-red",
    info: "bg-neon-blue/20 border-neon-blue/50 text-neon-blue",
  };

  const iconStyles = {
    success: "drop-shadow-[0_0_8px_rgba(0,255,136,0.6)]",
    error: "drop-shadow-[0_0_8px_rgba(255,88,88,0.6)]",
    info: "drop-shadow-[0_0_8px_rgba(88,166,255,0.6)]",
  };

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "px-5 py-3 rounded-xl border backdrop-blur-xl",
        "flex items-center gap-3",
        "transition-all duration-300 ease-out",
        typeStyles[type],
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
      )}
    >
      <span className={cn("w-5 h-5", iconStyles[type])}>
        {type === "success" && <CheckIcon />}
        {type === "error" && <XIcon />}
        {type === "info" && <InfoIcon />}
      </span>
      <span className="text-sm font-mono">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 p-1 rounded-lg hover:bg-white/10 transition-colors"
        aria-label="Close notification"
      >
        <XIcon className="w-4 h-4" />
      </button>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("w-full h-full", className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
