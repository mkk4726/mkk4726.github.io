import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only use static export for production builds
  ...(process.env.NODE_ENV === 'production' && {
    output: 'export',
    trailingSlash: true,
    images: {
      unoptimized: true,
    },
  }),
  // 한글 URL 지원을 위한 설정
  experimental: {
    urlImports: ['https://themer.sanity.io'],
  },
};

export default nextConfig;
