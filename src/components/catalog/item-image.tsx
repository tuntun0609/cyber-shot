import Image from "next/image";

export function ItemImage({
  alt,
  className,
  priority,
  sizes,
  src,
}: {
  alt: string;
  className?: string;
  priority?: boolean;
  sizes: string;
  src: string;
}) {
  return (
    <Image
      alt={alt}
      className={className}
      fill
      priority={priority}
      sizes={sizes}
      src={src}
      // SVG 无需图片优化
      unoptimized={src.endsWith(".svg")}
    />
  );
}
