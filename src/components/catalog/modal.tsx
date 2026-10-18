"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

export function Modal({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  const router = useRouter();

  // Esc、遮罩和关闭按钮都回到上一个路由
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        router.back();
      }
    },
    [router]
  );

  return (
    <Dialog defaultOpen onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92svh] w-[min(68rem,94vw)] overflow-y-auto overscroll-contain p-4 sm:max-w-none sm:p-6">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">
          素材详情，可复制提示词和下载参考图
        </DialogDescription>
        <div className="pt-8 sm:pt-4">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
