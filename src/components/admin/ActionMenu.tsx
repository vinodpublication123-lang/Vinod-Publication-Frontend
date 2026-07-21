"use client";

import { MoreHorizontal, Edit, Trash, Eye } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function ActionMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 text-white/40 hover:text-[var(--gold)] hover:bg-white/10 rounded-md transition-colors focus:outline-none"
      >
        <MoreHorizontal size={18} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 rounded-md bg-[#131b2e] border border-white/10 shadow-xl z-50 overflow-hidden origin-top-right animate-in fade-in zoom-in-95 duration-100">
          <div className="py-1">
            <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors">
              <Eye size={14} /> View
            </button>
            <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors">
              <Edit size={14} /> Edit
            </button>
            <div className="h-px bg-white/10 my-1" />
            <button className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
              <Trash size={14} /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
