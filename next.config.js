/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
   swcMinify: true,
  experimental: {
    forceSwcTransforms: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
