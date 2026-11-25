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
        content: "人物写真素材库：发型、身材、动作，附中英文提示词与参考图。",
        name: "description",
      },
    ],
  }),
  notFoundComponent: NotFoundPage,
  shellComponent: RootDocument,
});

function NotFoundPage() {
  return (
    <main className="mx-auto grid max-w-6xl gap-4 px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold">找不到这个页面</h1>
      <Link className="w-fit underline" to="/">
        返回素材库
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
