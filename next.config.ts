import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // Only use static export for production builds
  ...(process.env.NODE_ENV === 'production' && {
    trailingSlash: true,
    images: {
      unoptimized: true,
    },
  }),
};

export default nextConfig;
