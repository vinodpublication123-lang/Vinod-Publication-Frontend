import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.01]">
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/40 mb-4">
        <Icon size={32} />
      </div>
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      <p className="text-sm text-white/50 max-w-sm mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
