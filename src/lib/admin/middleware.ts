import { createMiddleware } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { requireAdmin } from "./auth.server";

// 每个后台接口独立鉴权，不能依赖页面的 beforeLoad。
export const adminMiddleware = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    setResponseHeader("Cache-Control", "private, no-store");
    await requireAdmin();
    return next();
  }
);
