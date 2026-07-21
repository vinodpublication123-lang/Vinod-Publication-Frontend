import { AccountSidebar } from "./AccountSidebar";

export function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#080e1a] pt-32 pb-20">
      <div className="container mx-auto px-6 max-w-6xl">
        <h1 className="text-3xl md:text-4xl font-serif text-[var(--ivory)] mb-8">My Account</h1>
        
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          <AccountSidebar />
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
