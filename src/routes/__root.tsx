import {
  createRootRoute,
  HeadContent,
  Link,
  Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "@/styles/globals.css";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { content: "width=device-width, initial-scale=1", name: "viewport" },
      { title: "cyber-shot" },
      {
        content: "人物写真素材库：发型与姿势，附中英文提示词与参考图。",
        name: "description",
      },
      { content: "website", property: "og:type" },
      { content: "cyber-shot", property: "og:site_name" },
      { content: "cyber-shot · 人物写真素材库", property: "og:title" },
      {
        content:
          "发型与姿势素材，每条都带中英文提示词与参考图，浏览、复制、下载。",
        property: "og:description",
      },
      { content: "zh_CN", property: "og:locale" },
      { content: "summary", name: "twitter:card" },
    ],
    links: [{ href: "/logo.svg", rel: "icon", type: "image/svg+xml" }],
  }),
  notFoundComponent: NotFoundPage,
  shellComponent: RootDocument,
});

function NotFoundPage() {
  return (
    <main className="mx-auto grid max-w-6xl gap-4 px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold">找不到这个页面</h1>
      <Link className="w-fit underline" to="/">
        返回首页
      </Link>
    </main>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          {children}
          <Toaster position="bottom-center" />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
