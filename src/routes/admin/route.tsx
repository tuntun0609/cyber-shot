import { UserButton } from "@clerk/tanstack-react-start";
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useLocation,
} from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
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
  useSidebar,
} from "@/components/ui/sidebar";
import { ADMIN_FORBIDDEN_HREF, getSignInHref } from "@/lib/admin/access";
import { loadAdminAccess } from "@/lib/admin/auth.functions";
import type { Category } from "@/lib/catalog/view";
import { CATEGORY_LABELS, CATEGORY_ORDER } from "@/lib/catalog/view";

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }) => {
    const access = await loadAdminAccess();
    if (access === "signed-out") {
      throw redirect({ href: getSignInHref(location.href) });
    }
    if (access === "forbidden") {
      throw redirect({ href: ADMIN_FORBIDDEN_HREF });
    }
  },
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
        tooltip={CATEGORY_LABELS[category]}
      >
        <Icon />
        <span>{CATEGORY_LABELS[category]}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function SidebarCollapseMenuItem() {
  const { isMobile, state, toggleSidebar } = useSidebar();
  if (isMobile) {
    return null;
  }
  const collapsed = state === "collapsed";
  const label = collapsed ? "展开侧边栏" : "收起侧边栏";
  const Icon = collapsed ? PanelLeftOpenIcon : PanelLeftCloseIcon;
  return (
    <SidebarMenuItem>
      <SidebarMenuButton onClick={toggleSidebar} tooltip={label}>
        <Icon />
        <span>{label}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function AdminLayout() {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="p-3 group-data-[collapsible=icon]:p-2">
          <Link
            aria-label="cyber-shot 素材后台"
            className="flex items-center gap-2 rounded-xl px-2 py-1.5 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-0"
            title="cyber-shot 素材后台"
            to="/"
          >
            <img
              alt=""
              className="size-7 shrink-0"
              height={28}
              src="/logo.svg"
              width={28}
            />
            <div className="grid leading-tight group-data-[collapsible=icon]:hidden">
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
          <div className="flex items-center gap-2 px-2 py-1">
            <UserButton />
            <span className="text-muted-foreground text-xs group-data-[collapsible=icon]:hidden">
              管理员
            </span>
          </div>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton render={<Link to="/" />} tooltip="返回前台">
                <ArrowLeftIcon />
                <span>返回前台</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarCollapseMenuItem />
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
