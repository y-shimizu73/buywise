import { getProfile } from "@/actions/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Header } from "@/components/layout/Header";

export async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        userName={profile?.full_name}
        userAvatar={profile?.avatar_url}
      />
      <div className="lg:pl-64">
        <Header
          userName={profile?.full_name}
          userAvatar={profile?.avatar_url}
        />
        <main className="px-4 py-6 sm:px-6 lg:px-8 pb-24 lg:pb-8">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
