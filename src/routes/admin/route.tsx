import {
  createFileRoute,
  Link,
  Outlet,
  useLocation,
} from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftIcon,
  PersonStandingIcon,
  ScissorsIcon,
  ShirtIcon,
} from "lucide-react";
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
        <SidebarHeader className="p-3">
          <Link
            className="flex items-center gap-2 rounded-xl px-2 py-1.5"
            to="/"
          >
            <img
              alt=""
              className="size-7 shrink-0"
              height={28}
              src="/logo.svg"
              width={28}
            />
            <div className="grid leading-tight">
              <span className="font-heading font-semibold tracking-tight">
                cyber-shot
              </span>
              <span className="text-muted-foreground text-xs">素材后台</span>
            </div>
          </Link>
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
                <ArrowLeftIcon />
                <span>返回前台</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="bg-background/85 sticky top-0 z-20 flex h-12 items-center gap-2 border-b px-4 backdrop-blur-md md:hidden">
          <SidebarTrigger />
          <img
            alt=""
            className="size-6 shrink-0"
            height={24}
            src="/logo.svg"
            width={24}
          />
          <span className="text-sm font-medium">素材后台</span>
        </header>
        <main className="min-w-0 p-4 sm:p-6">
          <div className="mx-auto grid w-full max-w-6xl gap-6">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
