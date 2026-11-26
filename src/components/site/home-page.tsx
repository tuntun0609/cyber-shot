import { Link } from "@tanstack/react-router";
import {
  ArrowRightIcon,
  ClipboardCopyIcon,
  DownloadIcon,
  LanguagesIcon,
} from "lucide-react";
import type { ComponentType } from "react";
import { ItemImage } from "@/components/catalog/item-image";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import type { HomeSection } from "@/lib/catalog/home.functions";
import { cn } from "@/lib/utils";

interface HomeData {
  hair: HomeSection;
  pose: HomeSection;
}

const FEATURES: {
  description: string;
  icon: ComponentType<{ className?: string }>;
  title: string;
}[] = [
  {
    description: "每条素材都附中文和英文提示词，贴进你常用的工具即可。",
    icon: LanguagesIcon,
    title: "中英文提示词",
  },
  {
    description: "卡片上直接复制提示词，不用点进详情，也不用手动选中。",
    icon: ClipboardCopyIcon,
    title: "一键复制",
  },
  {
    description: "发型是三视图，姿势是黑线白底白模，原图可直接下载。",
    icon: DownloadIcon,
    title: "参考图下载",
  },
];

function EntryCard({
  description,
  section,
  title,
  to,
  verb,
}: {
  description: string;
  section: HomeSection;
  title: string;
  to: "/hair" | "/pose";
  verb: string;
}) {
  return (
    <Link
      className="bg-card can-hover:hover:ring-foreground/20 can-hover:hover:-translate-y-0.5 ring-foreground/10 grid content-start gap-5 rounded-2xl p-5 ring-1 transition duration-200"
      to={to}
    >
      <ul className="grid grid-cols-4 gap-2">
        {section.items.map((item) => {
          const ratio = item.thumbAspectRatio ?? 3 / 4;
          return (
            <li
              className="bg-muted ring-foreground/10 relative aspect-3/4 overflow-hidden rounded-lg ring-1"
              key={item.id}
            >
              <ItemImage
                alt={item.name}
                aspectRatio={ratio}
                className={cn(
                  item.category === "pose"
                    ? "bg-white object-contain"
                    : "object-cover"
                )}
                sizes="(min-width: 1024px) 12vw, (min-width: 640px) 20vw, 20vw"
                src={item.thumbSrc}
              />
            </li>
          );
        })}
      </ul>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <span className="text-muted-foreground font-mono text-xs tabular-nums">
          {section.count} 款
        </span>
      </div>
      <p className="text-muted-foreground -mt-2 text-sm">{description}</p>
      <ul aria-label="常用标签" className="flex flex-wrap gap-1.5">
        {section.tags.map((tag) => (
          <li key={tag}>
            <Badge variant="outline">{tag}</Badge>
          </li>
        ))}
      </ul>
      <span className="inline-flex items-center gap-1.5 text-sm font-medium">
        {verb}
        <ArrowRightIcon className="size-4" />
      </span>
    </Link>
  );
}

export function HomePage({ data }: { data: HomeData }) {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-6xl px-4 pt-12 pb-10 text-center sm:px-6 sm:pt-20 sm:pb-14">
          <Badge className="mb-5" variant="outline">
            人物写真素材库
          </Badge>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
            为人物写真，
            <br />
            备好发型与姿势
          </h1>
          <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-balance sm:text-lg">
            每条素材都带中英文提示词与参考图，浏览、复制、下载，一步到位。
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link className={buttonVariants({ size: "lg" })} to="/hair">
              浏览发型
              <ArrowRightIcon />
            </Link>
            <Link
              className={buttonVariants({ size: "lg", variant: "outline" })}
              to="/pose"
            >
              浏览姿势
              <ArrowRightIcon />
            </Link>
          </div>
          <p className="text-muted-foreground mt-5 text-xs">
            不生成图片 · 无需登录 · 免费使用
          </p>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
          <div className="grid gap-5 md:grid-cols-2">
            <EntryCard
              description="披发、短发、卷发，女生男生都有，每款附三视图参考。"
              section={data.hair}
              title="发型库"
              to="/hair"
              verb="浏览发型"
            />
            <EntryCard
              description="坐姿、站姿、近景，黑线白底白模，直接当动作参考。"
              section={data.pose}
              title="姿势库"
              to="/pose"
              verb="浏览姿势"
            />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pt-6 pb-16 sm:px-6">
          <h2 className="text-center text-2xl font-semibold tracking-tight">
            拿来就能用
          </h2>
          <p className="text-muted-foreground mt-2 mb-8 text-center">
            只做素材库：不生成图片，不需要登录，不收费。
          </p>
          <ul className="grid gap-5 md:grid-cols-3">
            {FEATURES.map(({ description, icon: Icon, title }) => (
              <li
                className="bg-card ring-foreground/10 rounded-xl p-5 ring-1"
                key={title}
              >
                <span className="bg-primary text-primary-foreground mb-3 grid size-9 place-items-center rounded-lg">
                  <Icon className="size-4" />
                </span>
                <h3 className="mb-1 font-medium">{title}</h3>
                <p className="text-muted-foreground text-sm">{description}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
