import { z } from "zod";

// 所有服务端环境变量集中在这里；新增变量只需在 schema 中加一行
const schema = z.object({
  CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  IMAGE_BASE_URL: z.union([z.url(), z.literal("")]).optional(),
});

export type Env = z.infer<typeof schema>;

// 惰性读取：Worker 在请求时才能拿到 process.env，不能在模块加载阶段解析
export function getEnv(): Env {
  return schema.parse(process.env);
}
