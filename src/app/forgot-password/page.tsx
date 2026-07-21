import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-[#080e1a] pt-32 pb-20 flex items-center justify-center">
      <div className="container mx-auto px-6 max-w-md">
        
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-serif text-[var(--ivory)] mb-2">Reset Password</h1>
            <p className="text-sm text-white/50">Enter your email and we&apos;ll send you a link to reset your password.</p>
          </div>

          <form className="space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-medium text-white/70 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input 
                  type="email" 
                  placeholder="you@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--gold)]/50 focus:bg-white/10 transition-all"
                />
              </div>
            </div>

            <button
              type="button"
              className="w-full bg-[var(--gold)]/10 border border-[var(--gold)]/30 text-[var(--gold)] rounded-lg py-3 font-semibold tracking-wide hover:bg-[var(--gold)]/20 transition-all duration-300"
            >
              Send Reset Link
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="inline-flex items-center gap-2 text-xs text-white/40 hover:text-white transition-colors">
              <ArrowLeft size={14} /> Back to Login
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
