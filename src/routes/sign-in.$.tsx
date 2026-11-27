import { SignIn } from "@clerk/tanstack-react-start";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ADMIN_FORBIDDEN_HREF, getAdminReturnTo } from "@/lib/admin/access";
import { loadAdminAccess } from "@/lib/admin/auth.functions";

export const Route = createFileRoute("/sign-in/$")({
  beforeLoad: async ({ search }) => {
    const access = await loadAdminAccess();
    if (access === "admin") {
      throw redirect({ href: search.redirect_url });
    }
    if (access === "forbidden") {
      throw redirect({ href: ADMIN_FORBIDDEN_HREF });
    }
  },
  component: SignInPage,
  head: () => ({
    meta: [
      { title: "登录 · cyber-shot" },
      { content: "noindex, nofollow", name: "robots" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    redirect_url: getAdminReturnTo(search.redirect_url),
  }),
});

function SignInPage() {
  const { redirect_url: returnTo } = Route.useSearch();
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-4">
      <Link
        className="font-heading flex items-center gap-2 font-semibold"
        to="/"
      >
        <img alt="" className="size-8" height={32} src="/logo.svg" width={32} />
        cyber-shot
      </Link>
      <SignIn forceRedirectUrl={returnTo} path="/sign-in" routing="path" />
      <Link className="text-muted-foreground text-sm underline" to="/">
        返回素材库
      </Link>
    </main>
  );
}
