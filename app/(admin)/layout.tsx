export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-base text-white selection:bg-brand selection:text-white">
      <nav className="h-16 border-b border-white/10 bg-[#16162A] flex items-center px-6 justify-between sticky top-0 z-50 shadow-md">
        <h1 className="font-display text-xl text-brand-light tracking-wide">ESUTSphere Admin</h1>
        <div className="flex gap-6 text-sm font-medium">
          <a href="/admin" className="text-text-secondary hover:text-brand-light transition-colors">Dashboard</a>
          <a href="/class-admin" className="text-text-secondary hover:text-brand-light transition-colors">Class Admin</a>
          <div className="w-px h-5 bg-white/10" />
          <a href="/feed" className="text-text-muted hover:text-white transition-colors">Exit</a>
        </div>
      </nav>
      <main className="p-6 md:p-10 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
}
