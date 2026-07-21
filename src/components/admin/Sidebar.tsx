import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Package, BookOpen, Users, 
  ShoppingCart, MessageSquare, Settings, X, LogOut 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/AuthProvider";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Books", href: "/admin/books", icon: BookOpen },
  { name: "Authors", href: "/admin/authors", icon: Users },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Inquiries", href: "/admin/inquiries", icon: MessageSquare },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function Sidebar({ 
  isOpen, 
  setIsOpen 
}: { 
  isOpen: boolean; 
  setIsOpen: (isOpen: boolean) => void 
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-[#080e1a] border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:shrink-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 shrink-0">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[var(--gold)] flex items-center justify-center text-[var(--ink)] font-bold font-serif text-lg">
              V
            </div>
            <span className="text-xl font-serif text-[var(--ivory)] tracking-wider">VINVERSE</span>
          </Link>
          <button 
            className="p-2 lg:hidden text-white/50 hover:text-white"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 group overflow-hidden",
                  isActive 
                    ? "bg-[var(--gold)]/10 text-[var(--gold)]" 
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                )}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-[var(--gold)]" : "text-white/40 group-hover:text-white"
                )} />
                {item.name}
                {isActive && (
                  <div className="absolute left-0 w-1 h-8 bg-[var(--gold)] rounded-r-full" />
                )}
              </Link>
            );
          })}
        </nav>
        
        {/* User profile area at bottom */}
        <div className="p-4 border-t border-white/10 shrink-0">
          <div className="flex items-center gap-3 px-4 py-3 rounded-md bg-white/5 border border-white/10 relative group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--gold)] to-[var(--gold-light)] flex items-center justify-center text-[var(--ink)] font-bold text-xs uppercase">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-white truncate">{user?.name || "Admin"}</span>
              <span className="text-xs text-white/50 truncate">{user?.email || "admin@vinverse.com"}</span>
            </div>
            
            <button 
              onClick={() => logout("/admin/login")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded opacity-0 group-hover:opacity-100 transition-all"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
