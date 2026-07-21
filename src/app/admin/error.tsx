"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function AdminError({
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
        <p className="text-sm text-white/50">An error occurred while loading this module. Please try again or contact support if the issue persists.</p>
      </div>
      <button
        onClick={() => reset()}
        className="flex items-center gap-2 px-6 py-2.5 bg-white/5 hover:bg-white/10 rounded-md text-sm font-medium transition-colors text-white border border-white/10"
      >
        <RefreshCcw size={16} /> Try again
      </button>
    </div>
  );
}
