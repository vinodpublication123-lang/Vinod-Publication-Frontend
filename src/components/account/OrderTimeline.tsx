import { Check, Clock, Package, Truck, Home } from "lucide-react";

export type OrderStatus = "Pending" | "Processing" | "Packed" | "Shipped" | "Delivered" | "Cancelled";

const steps = [
  { id: "Placed", label: "Order Placed", icon: Clock },
  { id: "Processing", label: "Processing", icon: Package },
  { id: "Packed", label: "Packed", icon: Check },
  { id: "Shipped", label: "Shipped", icon: Truck },
  { id: "Delivered", label: "Delivered", icon: Home },
];

export function OrderTimeline({ currentStatus }: { currentStatus: OrderStatus }) {
  if (currentStatus === "Cancelled") {
    return (
      <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
        <h3 className="text-lg font-medium text-red-400 mb-1">Order Cancelled</h3>
        <p className="text-sm text-red-400/70">This order has been cancelled.</p>
      </div>
    );
  }

  const currentStepIndex = steps.findIndex(s => {
    if (currentStatus === "Pending") return s.id === "Placed";
    return s.id === currentStatus;
  });

  const activeIndex = currentStepIndex >= 0 ? currentStepIndex : 0;

  return (
    <div className="py-6 overflow-x-auto custom-scrollbar">
      <div className="relative flex justify-between min-w-[500px]">
        {/* Progress bar background */}
        <div className="absolute top-5 left-8 right-8 h-[2px] bg-white/10 -z-10" />
        
        {/* Active progress bar */}
        <div 
          className="absolute top-5 left-8 h-[2px] bg-[var(--gold)] -z-10 transition-all duration-500" 
          style={{ width: `calc(${(activeIndex / (steps.length - 1)) * 100}% - 4rem)` }} 
        />

        {steps.map((step, index) => {
          const isCompleted = index <= activeIndex;

          return (
            <div key={step.id} className="flex flex-col items-center gap-3 relative z-10 w-24">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 bg-[#0c1427]
                  ${isCompleted 
                    ? "border-[var(--gold)] text-[var(--gold)] shadow-[0_0_15px_rgba(212,175,55,0.3)]" 
                    : "border-white/20 text-white/30"
                  }
                `}
              >
                <step.icon size={18} />
              </div>
              <span className={`text-xs font-medium text-center ${isCompleted ? "text-white" : "text-white/40"}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
