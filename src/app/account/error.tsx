"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function AccountError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
        <AlertTriangle size={24} className="text-red-400" />
      </div>
      <div className="text-center space-y-2 max-w-md">
        <h2 className="text-xl font-medium text-white">Something went wrong!</h2>
        <p className="text-sm text-white/50">An error occurred while loading your profile data. Please try again.</p>
      </div>
      <button
        onClick={() => reset()}
        className="flex items-center gap-2 px-6 py-2.5 bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/30 hover:bg-[var(--gold)]/20 rounded-md text-sm font-medium transition-colors"
      >
        <RefreshCcw size={16} /> Try again
      </button>
    </div>
  );
}
