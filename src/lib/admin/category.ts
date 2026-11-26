import { notFound } from "@tanstack/react-router";
import type { Category } from "../catalog/view";
import { isCategory } from "../catalog/view";

// 路径里的类别不合法时按 404 处理
export function requireCategory(value: string): Category {
  if (!isCategory(value)) {
    throw notFound();
  }
  return value;
}
