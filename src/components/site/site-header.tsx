import { SignInButton, UserButton, useUser } from "@clerk/tanstack-react-start";
import { Link, useLocation } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "发型库", to: "/hair" },
  { label: "姿势库", to: "/pose" },
] as const;

function SiteAccount() {
  const { isLoaded, isSignedIn } = useUser();
  const returnTo = useLocation({ select: (location) => location.href });

  if (!isLoaded) {
    return <Skeleton aria-hidden className="size-8 rounded-full" />;
  }

  if (isSignedIn) {
    return (
      <UserButton
        appearance={{ elements: { userButtonAvatarBox: "size-8" } }}
      />
    );
  }

  return (
    <SignInButton
      forceRedirectUrl={returnTo}
      mode="modal"
      signUpForceRedirectUrl={returnTo}
    >
      <Button>登录</Button>
    </SignInButton>
  );
}

export function SiteHeader({ wide = false }: { wide?: boolean }) {
  return (
    <header className="bg-background/85 sticky top-0 z-30 h-14 border-b backdrop-blur-md">
      <div
        className={cn(
          "mx-auto flex h-full items-center justify-between gap-2 px-4 sm:gap-4",
          wide ? "md:px-6" : "max-w-6xl sm:px-6"
        )}
      >
        <Link
          aria-label="cyber-shot 首页"
          className="flex shrink-0 items-center gap-2"
          to="/"
        >
          <img
            alt=""
            className="size-7 shrink-0"
            height={28}
            src="/logo.svg"
            width={28}
          />
          <span className="font-heading hidden font-semibold tracking-tight sm:inline">
            cyber-shot
          </span>
        </Link>
        <nav aria-label="主导航" className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              activeProps={{ className: "bg-muted text-foreground" }}
              className="text-muted-foreground can-hover:hover:text-foreground rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors"
              key={item.to}
              to={item.to}
            >
              {item.label}
            </Link>
          ))}
          <ThemeToggle />
          <div className="ml-1 flex min-w-8 shrink-0 items-center justify-center">
            <SiteAccount />
          </div>
        </nav>
      </div>
    </header>
  );
}
