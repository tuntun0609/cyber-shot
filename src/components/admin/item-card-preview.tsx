import { ImageIcon } from "lucide-react";
import { ItemImage } from "@/components/catalog/item-image";
import { Badge } from "@/components/ui/badge";
import type { Category, ItemView } from "@/lib/catalog/view";
import { GENDER_LABELS } from "@/lib/catalog/view";

const MINI_BADGE_CLASS = "h-4 px-1.5 text-[10px]";

export function ItemCardPreview({
  category,
  gender,
  imageSrc,
  name,
  tags,
  thumbAspectRatio,
}: {
  category: Category;
  gender: ItemView["gender"];
  imageSrc?: string;
  name: string;
  tags: string[];
  thumbAspectRatio?: number;
}) {
  const previewAspectRatio =
    category === "pose" ? (thumbAspectRatio ?? 3 / 4) : 4 / 5;
  const ratio = thumbAspectRatio ?? previewAspectRatio;
  const artworkHeight = `${Math.min(1, previewAspectRatio / ratio) * 100}%`;
  const artworkWidth = `${Math.min(1, ratio / previewAspectRatio) * 100}%`;
  const backdropScale = Math.max(1, previewAspectRatio / ratio) * 1.1;

  return (
    <div className="bg-card text-card-foreground ring-foreground/8 dark:ring-foreground/10 w-full max-w-44 overflow-hidden rounded-[min(var(--radius-4xl),24px)] ring-1">
      <div
        className="bg-muted relative overflow-hidden"
        style={{ aspectRatio: previewAspectRatio }}
      >
        {imageSrc ? (
          <>
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{ transform: `scale(${backdropScale})` }}
            >
              <ItemImage
                alt=""
                aspectRatio={ratio}
                className="object-cover opacity-70 blur-2xl"
                sizes="64px"
                src={imageSrc}
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="relative shrink-0"
                style={{ height: artworkHeight, width: artworkWidth }}
              >
                <ItemImage
                  alt={name || "素材预览"}
                  aspectRatio={ratio}
                  className="object-cover"
                  sizes="176px"
                  src={imageSrc}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="text-muted-foreground flex size-full flex-col items-center justify-center gap-1">
            <ImageIcon className="size-5" />
            <span className="text-[10px]">暂无图片</span>
          </div>
        )}
      </div>
      <div className="grid gap-1.5 p-2.5">
        <div className="truncate text-xs font-medium">
          {name.trim() || "未命名素材"}
        </div>
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 2).map((tag) => (
            <Badge className={MINI_BADGE_CLASS} key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
          {tags.length > 2 && (
            <Badge className={MINI_BADGE_CLASS} variant="secondary">
              +{tags.length - 2}
            </Badge>
          )}
          <Badge className={MINI_BADGE_CLASS} variant="outline">
            {GENDER_LABELS[gender]}
          </Badge>
        </div>
      </div>
    </div>
  );
}
