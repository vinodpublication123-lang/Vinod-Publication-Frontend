import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

export interface SelectDropdownProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SelectDropdown = ({ options, value, onChange, placeholder = "Select an option", className }: SelectDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative w-full", className)} ref={dropdownRef}>
      <motion.button
        type="button"
        whileTap={{ scale: 0.99 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#080e1a] border border-white/10 rounded-md px-4 py-2.5 text-white flex items-center justify-between group hover:border-[var(--gold)]/50 transition-colors focus:outline-none text-left"
      >
        <span className={cn("text-sm block truncate", !selectedOption && "text-white/50")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="shrink-0 ml-2"
        >
          <ChevronDown className="w-4 h-4 text-white/50 group-hover:text-[var(--gold)] transition-colors" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-[100] w-full mt-2 rounded-md border border-white/10 bg-[#0a1122] shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            <div className="max-h-60 overflow-y-auto">
              {options.map((option, index) => (
                <motion.button
                  type="button"
                  key={option.value}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full px-4 py-3 text-left transition-colors duration-200 flex items-center justify-between group border-b border-white/5 last:border-0",
                    value === option.value ? "bg-[var(--gold)]/10 text-[var(--gold)]" : "text-white hover:bg-white/5 hover:text-[var(--gold)]"
                  )}
                >
                  <div>
                    <div className="text-sm font-medium">{option.label}</div>
                    {option.description && (
                      <div className="text-xs text-white/40 group-hover:text-[var(--gold)]/70 mt-0.5 transition-colors">
                        {option.description}
                      </div>
                    )}
                  </div>
                  {value === option.value && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      <Check className="w-4 h-4 shrink-0 ml-2" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
