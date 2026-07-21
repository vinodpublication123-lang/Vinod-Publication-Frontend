import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

export function StatCard({ title, value, icon: Icon, trend, trendUp }: StatCardProps) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 transition-all duration-300 hover:bg-white/[0.04] hover:border-white/10 hover:-translate-y-1 hover:shadow-[0_8px_24px_-12px_rgba(212,175,55,0.2)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white/60">{title}</h3>
        <div className="w-10 h-10 rounded-full bg-[var(--gold)]/10 flex items-center justify-center text-[var(--gold)]">
          <Icon size={20} />
        </div>
      </div>
      
      <div className="flex items-end gap-3">
        <span className="text-3xl font-bold text-white tracking-tight">{value}</span>
        {trend && (
          <span className={`text-xs font-medium mb-1 ${trendUp ? "text-emerald-400" : "text-red-400"}`}>
            {trendUp ? "↑" : "↓"} {trend}
          </span>
        )}
      </div>
    </div>
  );
}
