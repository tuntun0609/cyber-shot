import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("bg-muted animate-pulse rounded-3xl", className)}
      data-slot="skeleton"
      {...props}
    />
  );
}

export { Skeleton };
