import type { Db } from "./index";
import { createDb } from "./index";

type Wrangler = typeof import("wrangler");
type DevProxy = Awaited<ReturnType<Wrangler["getPlatformProxy"]>>;

interface Bindings {
  BUCKET: R2Bucket;
  DB: D1Database;
}

let devProxy: Promise<DevProxy> | undefined;

// 绑定只能在请求时读取，不能在模块加载阶段解析。
// dev 分支必须内联在条件里：生产构建会把 NODE_ENV 替换成常量并裁掉整段，wrangler 不会被打进 Worker。
async function getBindings(): Promise<Bindings> {
  if (process.env.NODE_ENV === "development") {
    // rsbuild dev 跑在 Node 里，没有 Worker 绑定：通过 Wrangler 的平台代理连本地 D1 和本地模拟的 R2。
    // dev 的 SSR 代码跑在 vm 里，动态 import() 会报 ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING_FLAG，
    // 所以改用 createRequire 同步加载，打包器也不会去解析 wrangler。
    const { createRequire } = process.getBuiltinModule("node:module");
    const wrangler = createRequire(`${process.cwd()}/`)("wrangler") as Wrangler;
    devProxy ??= wrangler.getPlatformProxy();
    const proxy = await devProxy;
    return proxy.env as Bindings;
  }
  const { env } = await import("cloudflare:workers");
  return env;
}

export async function getDb(): Promise<Db> {
  return createDb((await getBindings()).DB);
}

// 素材图片所在的 R2 bucket，仅后台上传和替换图片时使用
export async function getBucket(): Promise<R2Bucket> {
  return (await getBindings()).BUCKET;
}
