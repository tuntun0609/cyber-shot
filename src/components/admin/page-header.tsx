import { Link } from "@tanstack/react-router";
import { ChevronLeftIcon } from "lucide-react";
import type { ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button";
import type { Category } from "@/lib/catalog/view";
import { cn } from "@/lib/utils";

export function AdminPageHeader({
  actions,
  backTo,
  description,
  title,
}: {
  actions?: ReactNode;
  backTo?: { category: Category; label: string };
  description?: ReactNode;
  title: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="grid gap-1">
        {backTo ? (
          <Link
            className={cn(
              buttonVariants({ size: "sm", variant: "ghost" }),
              "text-muted-foreground -ml-2.5 w-fit"
            )}
            params={{ category: backTo.category }}
            search={{}}
            to="/admin/$category"
          >
            <ChevronLeftIcon />
            {backTo.label}
          </Link>
        ) : null}
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="text-muted-foreground text-sm">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
