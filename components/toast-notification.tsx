"use client";

import { cn } from "@/lib/utils";
import { useEffect } from "react";

interface ToastNotificationProps {
  message: string;
  type: "success" | "error" | "info";
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export function ToastNotification({
  message,
  type,
  isVisible,
  onClose,
  duration = 2500,
}: ToastNotificationProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose, duration]);

  const typeStyles = {
    success: "bg-neon-green/5 border-neon-green/30 text-neon-green shadow-[0_0_20px_rgba(0,255,136,0.1)]",
    error: "bg-neon-red/5 border-neon-red/30 text-neon-red shadow-[0_0_20px_rgba(255,88,88,0.1)]",
    info: "bg-neon-blue/5 border-neon-blue/30 text-neon-blue shadow-[0_0_20px_rgba(88,166,255,0.1)]",
  };

  const iconStyles = {
    success: "text-neon-green shadow-[0_0_8px_rgba(0,255,136,0.4)]",
    error: "text-neon-red shadow-[0_0_8px_rgba(255,88,88,0.4)]",
    info: "text-neon-blue shadow-[0_0_8px_rgba(88,166,255,0.4)]",
  };

  return (
    <div
      className={cn(
        "fixed bottom-8 left-8 z-50",
        "px-5 py-3 rounded-xl border backdrop-blur-2xl",
        "flex items-center gap-4 min-w-[280px] max-w-sm",
        "transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1)",
        typeStyles[type],
        isVisible
          ? "opacity-100 translate-x-0"
          : "opacity-0 -translate-x-8 pointer-events-none"
      )}
    >
      <div className={cn("w-5 h-5 shrink-0 flex items-center justify-center rounded-lg bg-white/5 border border-white/10", iconStyles[type])}>
        {type === "success" && <CheckIcon className="w-3 h-3" />}
        {type === "error" && <XIcon className="w-3 h-3" />}
        {type === "info" && <InfoIcon className="w-3 h-3" />}
      </div>
      
      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-0.5 font-sans">System Notification</span>
        <span className="text-[11px] font-bold leading-relaxed font-mono tracking-tight">{message}</span>
      </div>

      <button
        onClick={onClose}
        className="ml-auto p-1 rounded-lg hover:bg-white/10 transition-colors opacity-30 hover:opacity-100"
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
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
