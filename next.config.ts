import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  output: 'standalone', // OpenNext --skipNextBuild 需要 .next/standalone/ 目录
  images: {
    unoptimized: true, // Cloudflare 不支持 Next.js 图片优化
  },
};

export default withNextIntl(nextConfig);

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
