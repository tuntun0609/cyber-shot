import { createFileRoute } from "@tanstack/react-router";
import { requireCategory } from "@/lib/admin/category";

// 类别由路径决定，子路由通过 context.category 读取已校验的值
export const Route = createFileRoute("/admin/$category")({
  beforeLoad: ({ params }) => ({ category: requireCategory(params.category) }),
});
