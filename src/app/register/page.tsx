"use client";

import Link from "next/link";
import { Lock, Mail, User, Phone, Loader2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated, user, isLoading: isAuthLoading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) {
      if (user?.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/account");
      }
    }
  }, [isAuthenticated, user, router, isAuthLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsLoading(true);
      await register({ name, email, password, phone: phone || undefined });
      // Router redirection is handled by useEffect on auth state change

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
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
            <h1 className="text-2xl font-serif text-[var(--ivory)] mb-2">Create Account</h1>
            <p className="text-sm text-white/50">Join the VINVERSE community</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-white/70 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  disabled={isLoading}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--gold)]/50 focus:bg-white/10 transition-all disabled:opacity-50"
                />
              </div>
            </div>

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
              <label className="text-xs font-medium text-white/70 uppercase tracking-wider">Phone Number (Optional)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  disabled={isLoading}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--gold)]/50 focus:bg-white/10 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-white/70 uppercase tracking-wider">Password</label>
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
            
            <div className="space-y-1">
              <label className="text-xs font-medium text-white/70 uppercase tracking-wider">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--gold)]/50 focus:bg-white/10 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 bg-[var(--gold)]/10 border border-[var(--gold)]/30 text-[var(--gold)] rounded-lg py-3 font-semibold tracking-wide hover:bg-[var(--gold)]/20 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-6 text-center space-y-4">
            <p className="text-sm text-white/50">
              Already have an account?{" "}
              <Link href="/login" className="text-[var(--gold)] hover:underline font-medium">
                Sign In
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
