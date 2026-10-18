"use client";

import { DownloadIcon, TriangleAlertIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  CATEGORY_LABELS,
  GENDER_LABELS,
  type ItemView,
} from "@/lib/catalog/view";
import { cn } from "@/lib/utils";
import { CopyButton } from "./copy-button";
import { ItemImage } from "./item-image";

type ImageKind = "photo" | "skeleton";
type PromptLang = "zh" | "en";

const PROMPT_LANG_LABELS: Record<PromptLang, string> = {
  en: "English",
  zh: "中文",
};

// 单选分段控件：忽略取消选中，保证总有一项选中
function useSegment<T extends string>(initial: T) {
  const [value, setValue] = useState<T>(initial);
  const onValueChange = useCallback((next: unknown[]) => {
    const [first] = next;
    if (typeof first === "string") {
      setValue(first as T);
    }
  }, []);
  return { onValueChange, value };
}

function DownloadLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      className={buttonVariants({ size: "lg", variant: "outline" })}
      download
      href={href}
      rel="noopener"
    >
      <DownloadIcon />
      {label}
    </a>
  );
}

function ImagePanel({ item }: { item: ItemView }) {
  const kind = useSegment<ImageKind>("photo");
  const src =
    kind.value === "skeleton" && item.skeletonSrc
      ? item.skeletonSrc
      : item.imageSrc;

  return (
    <div className="grid content-start gap-3">
      <div
        className="relative overflow-hidden rounded-2xl bg-muted"
        style={{ aspectRatio: item.imageAspectRatio ?? 4 / 5 }}
      >
        <ItemImage
          alt={kind.value === "skeleton" ? `${item.name}骨架图` : item.name}
          className="object-contain"
          priority
          sizes="(min-width: 768px) 45vw, 100vw"
          src={src}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {item.skeletonSrc ? (
          <ToggleGroup
            aria-label="预览图"
            onValueChange={kind.onValueChange}
            spacing={0}
            value={[kind.value]}
            variant="outline"
          >
            <ToggleGroupItem value="photo">原图</ToggleGroupItem>
            <ToggleGroupItem value="skeleton">骨架图</ToggleGroupItem>
          </ToggleGroup>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <DownloadLink href={item.imageSrc} label="下载原图" />
          {item.skeletonSrc ? (
            <DownloadLink href={item.skeletonSrc} label="下载骨架图" />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function PromptCard({ item }: { item: ItemView }) {
  const lang = useSegment<PromptLang>("zh");
  const text = lang.value === "zh" ? item.promptZh : item.promptEn;

  return (
    <Card aria-labelledby="prompt-heading" role="region">
      <CardHeader>
        <CardTitle id="prompt-heading">提示词</CardTitle>
        <CardAction>
          <ToggleGroup
            aria-label="提示词语言"
            onValueChange={lang.onValueChange}
            spacing={0}
            value={[lang.value]}
            variant="outline"
          >
            {(["zh", "en"] as const).map((value) => (
              <ToggleGroupItem key={value} value={value}>
                {PROMPT_LANG_LABELS[value]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p
          className={cn(
            "leading-relaxed",
            lang.value === "en" ? "font-mono text-[15px]" : "text-base"
          )}
          lang={lang.value === "en" ? "en" : "zh-CN"}
        >
          {text}
        </p>
      </CardContent>
      <CardFooter className="flex-wrap gap-2">
        <CopyButton
          label={`复制${PROMPT_LANG_LABELS[lang.value]}`}
          size="lg"
          text={text}
          variant="default"
        />
        <CopyButton
          label="复制中英双语"
          size="lg"
          text={`${item.promptEn}\n${item.promptZh}`}
        />
      </CardFooter>
    </Card>
  );
}

export function ItemDetail({ item }: { item: ItemView }) {
  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-8">
      <ImagePanel item={item} />

      <div className="grid content-start gap-5">
        {item.deprecated ? (
          <div
            className="flex items-start gap-3 rounded-2xl bg-destructive/10 px-4 py-3 text-destructive text-sm"
            role="status"
          >
            <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" />
            该素材已下架，不再出现在素材库中，仅保留此页面供已有链接访问。
          </div>
        ) : null}

        <div className="grid gap-1.5">
          <p className="font-mono text-muted-foreground text-xs tracking-wide">
            {CATEGORY_LABELS[item.category]} / {item.id.toUpperCase()}
          </p>
          <h1 className="text-balance font-semibold text-3xl tracking-tight">
            {item.name}
          </h1>
          <p className="text-muted-foreground text-sm">
            适用性别：{GENDER_LABELS[item.gender]}
          </p>
        </div>

        {item.tags.length > 0 ? (
          <ul aria-label="标签" className="flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <li key={tag}>
                {/* 整页跳转，避免弹窗路由在软导航时保持打开 */}
                <Badge
                  className="h-8 px-3 text-sm"
                  render={
                    <a
                      href={`/?${new URLSearchParams({ c: item.category, t: tag })}`}
                    />
                  }
                  variant="outline"
                >
                  {tag}
                </Badge>
              </li>
            ))}
          </ul>
        ) : null}

        <PromptCard item={item} />
      </div>
    </div>
  );
}
