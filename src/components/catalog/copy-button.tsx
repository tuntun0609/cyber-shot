"use client";

import type { VariantProps } from "class-variance-authority";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button, type buttonVariants } from "@/components/ui/button";

export function useCopy() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1500);
      toast.success("已复制到剪贴板");
    } catch {
      // 剪贴板不可用时用户仍可手动选中文字复制
      toast.error("复制失败，请手动选中文字复制");
    }
  }, []);

  return { copied, copy };
}

export function CopyButton({
  className,
  copiedLabel = "已复制",
  label,
  size,
  text,
  variant = "outline",
}: VariantProps<typeof buttonVariants> & {
  className?: string;
  copiedLabel?: string;
  label: string;
  text: string;
}) {
  const { copied, copy } = useCopy();
  const handleClick = useCallback(() => copy(text), [copy, text]);
  const caption = copied ? copiedLabel : label;

  return (
    <Button
      className={className}
      data-copied={copied || undefined}
      onClick={handleClick}
      size={size}
      variant={variant}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
      <span aria-live="polite">{caption}</span>
    </Button>
  );
}
