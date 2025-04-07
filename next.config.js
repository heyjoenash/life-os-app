/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Increase serverActions timeout for potentially longer API calls
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

module.exports = nextConfig;
