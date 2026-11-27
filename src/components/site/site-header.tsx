import { Link } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "发型库", to: "/hair" },
  { label: "姿势库", to: "/pose" },
] as const;

export function SiteHeader({ wide = false }: { wide?: boolean }) {
  return (
    <header className="bg-background/85 sticky top-0 z-30 h-14 border-b backdrop-blur-md">
      <div
        className={cn(
          "mx-auto flex h-full items-center justify-between gap-4 px-4",
          wide ? "md:px-6" : "max-w-6xl sm:px-6"
        )}
      >
        <Link className="flex shrink-0 items-center gap-2" to="/">
          <img
            alt=""
            className="size-7 shrink-0"
            height={28}
            src="/logo.svg"
            width={28}
          />
          <span className="font-heading font-semibold tracking-tight">
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
        </nav>
      </div>
    </header>
  );
}
