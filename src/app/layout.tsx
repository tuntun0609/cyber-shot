import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  description: "人物写真素材库：发型、身材、动作，附中英文提示词与参考图。",
  title: "cyber-shot",
};

export default function RootLayout({
  children,
  modal,
}: {
  children: ReactNode;
  modal: ReactNode;
}) {
  return (
    // next-themes 在水合前给 html 写入主题 class
    <html lang="zh-CN" suppressHydrationWarning>
      {/* 浏览器扩展可能在水合前向 body 注入 mpa-* 等属性。 */}
      <body suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          disableTransitionOnChange
          enableSystem
        >
          {children}
          {modal}
          <Toaster position="bottom-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
