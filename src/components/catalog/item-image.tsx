import { cn } from "@/lib/utils";

export function ItemImage({
  alt,
  aspectRatio,
  className,
  priority,
  src,
}: {
  alt: string;
  aspectRatio: number;
  className?: string;
  priority?: boolean;
  src: string;
}) {
  return (
    <img
      alt={alt}
      className={cn("absolute inset-0 size-full", className)}
      decoding="async"
      fetchPriority={priority ? "high" : undefined}
      height={1000}
      loading={priority ? "eager" : "lazy"}
      src={src}
      width={Math.round(aspectRatio * 1000)}
    />
  );
}
