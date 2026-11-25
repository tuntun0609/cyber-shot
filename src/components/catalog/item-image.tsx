import { Image } from "@unpic/react/base";
import { useCallback, useState } from "react";
import { transform } from "unpic/providers/cloudflare";
import { cn } from "@/lib/utils";

const REMOTE_URL = /^https?:\/\//iu;
function getDomain(src: string): string | null {
  if (!REMOTE_URL.test(src)) {
    return null;
  }
  try {
    return new URL(src).host;
  } catch {
    return null;
  }
}

export function ItemImage({
  alt,
  aspectRatio,
  className,
  fit = "cover",
  priority,
  sizes,
  src,
}: {
  alt: string;
  aspectRatio: number;
  className?: string;
  fit?: "contain" | "cover";
  priority?: boolean;
  sizes?: string;
  src: string;
}) {
  // 转换失败（未开启 Transformations、额度用尽）时回退到原图
  const [failed, setFailed] = useState(false);
  const handleError = useCallback(() => setFailed(true), []);
  const domain = getDomain(src);
  const height = 1000;
  const imageClassName = cn(
    "absolute inset-0 size-full",
    fit === "contain" ? "object-contain" : "object-cover",
    className
  );

  if (!domain || failed) {
    return (
      <img
        alt={alt}
        className={imageClassName}
        decoding="async"
        fetchPriority={priority ? "high" : undefined}
        height={height}
        loading={priority ? "eager" : "lazy"}
        src={src}
        width={Math.round(aspectRatio * height)}
      />
    );
  }

  return (
    <Image
      alt={alt}
      className={imageClassName}
      decoding="async"
      fetchPriority={priority ? "high" : undefined}
      height={height}
      layout="fullWidth"
      loading={priority ? "eager" : "lazy"}
      onError={handleError}
      options={{ domain }}
      sizes={sizes}
      src={src}
      transformer={transform}
      unstyled
    />
  );
}
