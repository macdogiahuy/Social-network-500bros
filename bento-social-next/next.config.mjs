/** @type {import('next').NextConfig} */
const nextConfig = {
  optimizeFonts: true,
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    optimizeCss: false,
  },
  images: {
    domains: [
      'plus.unsplash.com',
      'images.unsplash.com',
      'i.pinimg.com',
      'i.pravatar.cc',
      'localhost',
      'dns.bento.showcase.200lab.io',
      'statics.cdn.200lab.io',
    ],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '**.onrender.com',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
