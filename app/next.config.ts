import type { NextConfig } from "next";

// 把所有 /api/* 反代到后端,让浏览器视角下前后端同源,Set-Cookie 才能落地。
// 生产建议在反向代理层完成(Nginx / Caddy)。
const apiTarget = process.env.API_BASE;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    if (!apiTarget) return [];
    return [
      {
        source: "/api/:path*",
        destination: `${apiTarget.replace(/\/$/, "")}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
