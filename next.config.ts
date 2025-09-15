import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsHmrCache: true,
    ...(isDev && { allowDevelopmentBuild: true }),
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    dangerouslyAllowSVG: true,
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hz9t4nphtm.ufs.sh',
        port: '/f/*',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/photos/**',
      },
    ],
  },
  productionBrowserSourceMaps: true,
  env: {
    AUTH_TRUST_HOST: 'true',
  },
};

export default nextConfig;
