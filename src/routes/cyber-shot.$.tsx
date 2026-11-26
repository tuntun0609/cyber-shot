import { createFileRoute } from "@tanstack/react-router";
import { getBucket } from "@/db/client";

// 仅本地开发使用：未配置 IMAGE_BASE_URL 时，imageUrl() 会回退到 /cyber-shot/<key>，
// 这里从本地模拟的 R2 读取。非 development 环境一律 404，生产构建会把整段判断裁成常量。
const notFound = () => new Response("Not Found", { status: 404 });

export const Route = createFileRoute("/cyber-shot/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        if (process.env.NODE_ENV !== "development") {
          return notFound();
        }
        const object = await (await getBucket()).get(
          `cyber-shot/${params._splat ?? ""}`
        );
        if (!object) {
          return notFound();
        }
        return new Response(object.body as unknown as BodyInit, {
          headers: {
            "cache-control": "no-store",
            "content-type":
              object.httpMetadata?.contentType ?? "application/octet-stream",
          },
        });
      },
    },
  },
});
