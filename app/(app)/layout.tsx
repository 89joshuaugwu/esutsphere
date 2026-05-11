import TopNav from "@/components/layout/TopNav";
import Sidebar from "@/components/layout/Sidebar";
import BottomTabBar from "@/components/layout/BottomTabBar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <TopNav />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 md:ml-[var(--sidebar-width)] pb-[calc(var(--nav-height)+env(safe-area-inset-bottom))] md:pb-0 relative min-h-[calc(100vh-var(--nav-height))]">
          <div className="mx-auto max-w-[var(--content-max)] lg:max-w-[800px] p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
      <BottomTabBar />
    </div>
  );
}
