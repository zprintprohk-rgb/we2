import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // OpenNext 自行处理输出格式，不使用 Next.js standalone 模式
  images: {
    unoptimized: true, // Cloudflare 不支持 Next.js 图片优化
  },
};

export default withNextIntl(nextConfig);

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
