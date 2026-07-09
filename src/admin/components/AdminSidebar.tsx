import { ChevronsLeft, ChevronsRight, CreditCard, LayoutDashboard, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/admin/context/AuthContext";
import { APP_NAME } from "@/home/constants/legal";
import logoUrl from "@/home/assets/pwa-192.png";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/share/ui/sidebar";

const navItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Pricing",
    href: "/admin/pricing",
    icon: CreditCard,
  },
];

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { state, toggleSidebar } = useSidebar();
  const sidebarExpanded = state === "expanded";

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login", { replace: true });
  };

  const isActive = (href: string) => location.pathname === href;

  return (
    <Sidebar collapsible="icon" className="!inset-auto !bottom-0 !left-0 !top-[var(--admin-header-height,3.5rem)] !h-[calc(100svh-var(--admin-header-height,3.5rem))]">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip={APP_NAME}>
              <Link to="/admin/dashboard">
                <img src={logoUrl} alt="" className="size-8 rounded-md object-contain" />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{APP_NAME}</span>
                  <span className="truncate text-xs text-muted-foreground">Admin CMS</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.title}
                  >
                    <Link to={item.href}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {sidebarExpanded && (
            <>
              <SidebarMenuItem>
                <SidebarMenuButton className="h-auto py-2">
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate text-xs text-muted-foreground">Masuk sebagai</span>
                    <span className="truncate font-medium">{user?.email ?? "—"}</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarSeparator />
            </>
          )}
          <SidebarMenuItem className="flex flex-row gap-1">
            {sidebarExpanded && (
              <SidebarMenuButton
                tooltip="Logout"
                className="flex-1"
                onClick={() => void handleSignOut()}
              >
                <LogOut />
                <span>Logout</span>
              </SidebarMenuButton>
            )}
            <SidebarMenuButton
              tooltip={sidebarExpanded ? "Ciutkan sidebar" : "Perluas sidebar"}
              className={sidebarExpanded ? "flex-1 justify-center" : "w-full justify-center"}
              onClick={toggleSidebar}
            >
              {sidebarExpanded ? <ChevronsLeft /> : <ChevronsRight />}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
