import type { CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "@/admin/components/AdminSidebar";
import { useAuth } from "@/admin/context/AuthContext";
import { APP_NAME } from "@/home/constants/legal";
import { Button } from "@/share/ui/button";
import { SidebarInset, SidebarProvider } from "@/share/ui/sidebar";
import { Toaster } from "@/share/ui/sonner";

const ADMIN_HEADER_HEIGHT = "3.5rem";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login", { replace: true });
  };

  return (
    <SidebarProvider
      className="admin-shell flex min-h-svh flex-col"
      style={{ "--admin-header-height": ADMIN_HEADER_HEIGHT } as CSSProperties}
    >
      <header className="sticky top-0 z-50 flex h-14 w-full shrink-0 items-center justify-between gap-3 border-b bg-background px-4">
        <p className="text-sm font-semibold">{APP_NAME} Admin</p>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground md:inline">{user?.email}</span>
          <Button variant="outline" size="sm" className="hidden sm:inline-flex" onClick={() => void handleSignOut()}>
            Logout
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <AdminSidebar />
        <SidebarInset className="min-h-0 flex-1 overflow-auto">
          <div className="p-4 md:p-6">{children}</div>
        </SidebarInset>
      </div>
      <Toaster richColors position="top-right" />
    </SidebarProvider>
  );
}
