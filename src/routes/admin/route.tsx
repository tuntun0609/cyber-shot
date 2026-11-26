import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
} from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { PersonStandingIcon, ScissorsIcon, ShirtIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import type { Category } from "@/lib/catalog/view";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/catalog/view";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
  head: () => ({
    meta: [
      { title: "素材后台 · cyber-shot" },
      { content: "noindex, nofollow", name: "robots" },
    ],
  }),
});

const CATEGORY_ICONS: Record<Category, LucideIcon> = {
  body: ShirtIcon,
  hair: ScissorsIcon,
  pose: PersonStandingIcon,
};

function CategoryNavItem({ category }: { category: Category }) {
  const pathname = useLocation({ select: (location) => location.pathname });
  const Icon = CATEGORY_ICONS[category];
  const active =
    pathname === `/admin/${category}` ||
    pathname.startsWith(`/admin/${category}/`);
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={active}
        render={
          <Link params={{ category }} search={{}} to="/admin/$category" />
        }
      >
        <Icon />
        <span>{CATEGORY_LABELS[category]}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function AdminLayout() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="px-4 py-3 font-semibold">
          cyber-shot 素材后台
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>素材类别</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {CATEGORY_ORDER.map((category) => (
                  <CategoryNavItem category={category} key={category} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton render={<Link to="/" />}>
                返回前台
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-12 items-center gap-2 border-b px-4 md:hidden">
          <SidebarTrigger />
          <span className="text-sm font-medium">素材后台</span>
        </header>
        <main className="min-w-0 p-4 sm:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
