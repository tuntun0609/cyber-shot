import { SignOutButton } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/site/home-page";
import { Button } from "@/components/ui/button";
import { loadHome } from "@/lib/catalog/home.functions";

export const Route = createFileRoute("/")({
  component: Home,
  loader: () => loadHome(),
  staleTime: Number.POSITIVE_INFINITY,
  validateSearch: (
    search: Record<string, unknown>
  ): { notice?: "admin-forbidden" } => ({
    notice: search.notice === "admin-forbidden" ? "admin-forbidden" : undefined,
  }),
});

function Home() {
  const { notice } = Route.useSearch();
  return (
    <>
      {notice === "admin-forbidden" && (
        <div
          className="bg-muted flex flex-wrap items-center justify-center gap-3 px-4 py-3 text-sm"
          role="alert"
        >
          <p>当前账号没有后台访问权限。</p>
          <SignOutButton redirectUrl="/sign-in">
            <Button size="sm" variant="outline">
              切换账号
            </Button>
          </SignOutButton>
        </div>
      )}
      <HomePage data={Route.useLoaderData()} />
    </>
  );
}
