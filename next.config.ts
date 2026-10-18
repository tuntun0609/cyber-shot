import type { NextConfig } from "next";

// 图片域名来自环境变量，切换 r2.dev 和自定义域名时不用改代码
function imageRemotePatterns(): NonNullable<
  NextConfig["images"]
>["remotePatterns"] {
  const base = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;
  if (!base) {
    return [];
  }
  const url = new URL(base);
  const prefix = url.pathname === "/" ? "" : url.pathname;
  return [
    {
      hostname: url.hostname,
      pathname: `${prefix}/**`,
      port: url.port,
      protocol: url.protocol === "http:" ? "http" : "https",
      search: "",
    },
  ];
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: imageRemotePatterns(),
  },
};

export default nextConfig;
