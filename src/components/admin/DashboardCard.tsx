import { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function DashboardCard({ title, action, children, className = "" }: DashboardCardProps) {
  return (
    <div className={`bg-[#0c1427] border border-white/5 rounded-xl ${className}`}>
      <div className="flex items-center justify-between p-6 border-b border-white/5">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {action && <div>{action}</div>}
      </div>
      <div className="p-0">
        {children}
      </div>
    </div>
  );
}
