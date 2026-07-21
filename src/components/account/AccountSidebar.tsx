"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, User, ShoppingBag, LogOut, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/account", icon: LayoutDashboard },
  { name: "Profile", href: "/account/profile", icon: User },
  { name: "My Orders", href: "/account/orders", icon: ShoppingBag },
];

import { useAuth } from "@/components/auth/AuthProvider";

export function AccountSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
      {/* Back to site */}
      <Link
        href="/"
        className="flex items-center gap-2 px-4 py-2 mb-2 text-xs font-medium text-white/40 hover:text-white transition-colors rounded-lg hover:bg-white/5"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Website
      </Link>
      <nav className="flex flex-col gap-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/20 shadow-[0_4px_20px_rgba(212,175,55,0.1)]" 
                  : "text-white/70 hover:bg-white/5 hover:text-white border border-transparent"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-[var(--gold)]" : "text-white/50")} />
              {item.name}
            </Link>
          );
        })}
        <div className="h-px bg-white/10 my-2" />
        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 border border-transparent"
        >
          <LogOut className="w-5 h-5 text-red-400/70" />
          Logout
        </button>
      </nav>
    </div>
  );
}
