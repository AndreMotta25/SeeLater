import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/vi/**',
      },
      {
        protocol: 'https',
        hostname: 'www.google.com',
        pathname: '/s2/favicons/**',
      },
      {
        protocol: 'https',
        hostname: '**', // Permite qualquer domínio https para thumbnails OG
      },
      {
        protocol: 'http',
        hostname: '**', // Permite qualquer domínio http (fallback)
      },
    ],
  },
  // Important: DON'T use COOP/COEP headers with PWA as they conflict
  // Transformers.js will work in single-threaded mode on Safari
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/img\.youtube\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "youtube-thumbnails",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
      },
    },
    {
      urlPattern: /^https:\/\/www\.google\.com\/s2\/favicons\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "favicons",
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
      },
    },
  ],
})(nextConfig);
