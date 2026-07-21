export default function AccountLoading() {
  return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="w-10 h-10 border-4 border-[var(--gold)]/20 border-t-[var(--gold)] rounded-full animate-spin" />
      <p className="text-sm text-white/50 animate-pulse">Loading account data...</p>
    </div>
  );
}
