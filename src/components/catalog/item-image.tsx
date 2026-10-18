import Image from "next/image";

export function ItemImage({
  alt,
  className,
  priority,
  sizes,
  src,
  unoptimized = false,
}: {
  alt: string;
  className?: string;
  priority?: boolean;
  sizes: string;
  src: string;
  unoptimized?: boolean;
}) {
  return (
    <Image
      alt={alt}
      className={className}
      fill
      priority={priority}
      sizes={sizes}
      src={src}
      // SVG 和预压缩缩略图无需再次优化。
      unoptimized={unoptimized || src.endsWith(".svg")}
    />
  );
}
