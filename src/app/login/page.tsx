"use client";

import { Suspense } from "react";

import Link from "next/link";
import { Lock, Mail, Loader2, AlertCircle, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated, user, isLoading: isAuthLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isExpired = searchParams.get("expired") === "1";

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      if (user?.role === "ADMIN") {
        router.push("/admin");
      } else {
        // Go to callbackUrl if provided (e.g. from checkout redirect), otherwise stay on homepage
        const callbackUrl = searchParams.get("callbackUrl");
        router.push(callbackUrl ?? "/");
      }
    }
  }, [isAuthenticated, user, router, isAuthLoading, searchParams]);

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
      // Router redirection is handled by useEffect on auth state change
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid email or password.");
      setIsLoading(false);
    }
  };

  if (isAuthLoading || isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#080e1a] pt-32 pb-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080e1a] pt-32 pb-20 flex items-center justify-center">
      <div className="container mx-auto px-6 max-w-md">

        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-serif text-[var(--ivory)] mb-2">Welcome Back</h1>
            <p className="text-sm text-white/50">Sign in to your VINVERSE account</p>
          </div>

          {/* Session expired notice */}
          {isExpired && (
            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-300 mb-0.5">Session Expired</p>
                <p className="text-xs text-amber-400/80">Your session timed out for security. Please sign in again to continue.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-medium text-white/70 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={isLoading}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--gold)]/50 focus:bg-white/10 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-white/70 uppercase tracking-wider">Password</label>
                <Link href="/forgot-password" className="text-xs text-[var(--gold)] hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--gold)]/50 focus:bg-white/10 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" className="rounded border-white/10 bg-white/5 text-[var(--gold)] focus:ring-[var(--gold)]" />
              <label htmlFor="remember" className="text-sm text-white/70">Remember me</label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[var(--gold)]/10 border border-[var(--gold)]/30 text-[var(--gold)] rounded-lg py-3 font-semibold tracking-wide hover:bg-[var(--gold)]/20 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-4">
            <p className="text-sm text-white/50">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-[var(--gold)] hover:underline font-medium">
                Create Account
              </Link>
            </p>
            <div>
              <Link href="/" className="text-xs text-white/40 hover:text-white transition-colors">
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#080e1a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--gold)] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginPageInner />
    </Suspense>
  );
}
