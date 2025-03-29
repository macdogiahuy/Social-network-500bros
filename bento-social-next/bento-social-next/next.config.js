/** @type {import('next').NextConfig} */
const nextConfig = {
  optimizeFonts: true,
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    optimizeCss: true,
  },
};

module.exports = nextConfig;