"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, user, isLoading: isAuthLoading } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated && user?.role === "ADMIN") {
      router.push("/admin");
    } else if (!isAuthLoading && isAuthenticated && user?.role === "CUSTOMER") {
      router.push("/account");
    }
  }, [isAuthenticated, user, router, isAuthLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setIsLoading(true);
      await login({ email, password });
      router.push("/admin");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to authenticate. Please check your credentials.");
      setIsLoading(false);
    }
  };

  if (isAuthLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080e1a]">
        <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080e1a] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background styling elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] bg-[var(--gold)]/5 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-[var(--gold)]/5 rounded-full blur-[100px] mix-blend-screen pointer-events-none" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Logo/Brand area */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-serif text-[var(--ivory)] tracking-wider mb-2">VINVERSE</h1>
          <div className="h-px w-16 bg-[var(--gold)]/50 mx-auto mb-4"></div>
          <p className="text-[var(--gold)] tracking-[0.2em] text-xs uppercase font-medium">Secure Portal</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-[#0a1122]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-serif text-white mb-6 text-center">Admin Access</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/60 uppercase tracking-wider pl-1">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@vinverse.com"
                  disabled={isLoading}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[var(--gold)]/50 focus:bg-white/10 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/60 uppercase tracking-wider pl-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[var(--gold)]/50 focus:bg-white/10 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-8 bg-[var(--gold)] text-[#080e1a] rounded-xl py-3.5 font-semibold tracking-wide hover:bg-[var(--gold)]/90 hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                "Authorize Access"
              )}
            </button>
            
            {process.env.NODE_ENV === "development" && (
              <button
                type="button"
                onClick={() => {
                  setEmail("dev@admin.com");
                  setPassword("dev");
                  setTimeout(() => {
                    // Trigger form submit or just call login
                    document.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                  }, 100);
                }}
                className="w-full mt-4 bg-white/5 text-white/70 border border-white/10 rounded-xl py-2.5 text-sm font-medium hover:bg-white/10 transition-all duration-300"
              >
                Dev Bypass Login
              </button>
            )}
          </form>
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center text-xs text-white/30">
          <p>Restricted area. Authorized personnel only.</p>
        </div>
      </div>
    </div>
  );
}
