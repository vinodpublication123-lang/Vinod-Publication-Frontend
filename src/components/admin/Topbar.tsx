import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const lastSegment = pathname.split("/").filter(Boolean).at(-1);
  const routeTitle = lastSegment
    ? `${lastSegment.charAt(0).toUpperCase()}${lastSegment.slice(1)} Management`
    : "Dashboard Overview";
  
  // Create a nice title from the pathname
  const title = pathname === "/admin" 
    ? "Dashboard Overview" 
    : routeTitle;

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 border-b border-white/10 bg-[#0a1122]/90 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 text-white/70 hover:text-white lg:hidden rounded-md hover:bg-white/10 transition-colors"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-lg sm:text-xl font-semibold text-[var(--ivory)] hidden sm:block">
          {title}
        </h1>
      </div>

      {/* Additional header items could go here */}
    </header>
  );
}
