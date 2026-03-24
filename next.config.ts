import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/vi/**",
      },
      {
        protocol: "https",
        hostname: "www.google.com",
        pathname: "/s2/favicons/**",
      },
      {
        protocol: "https",
        hostname: "**", // Permite qualquer domínio https para thumbnails OG
      },
      {
        protocol: "http",
        hostname: "**", // Permite qualquer domínio http (fallback)
      },
    ],
  },
  // Important: DON'T use COOP/COEP headers with PWA as they conflict
  // Transformers.js will work in single-threaded mode on Safari
};

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  // Fallback offline para páginas não cacheadas
  fallbacks: {
    document: "/~offline",
  },
  workboxOptions: {
    runtimeCaching: [
      // Cache static assets (JS, CSS, fonts) with StaleWhileRevalidate
      {
        urlPattern: /\.(?:js|css|woff|woff2|ttf|otf)$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "static-assets",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
          },
        },
      },
      // Cache images with CacheFirst
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "images",
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
          },
        },
      },
      // API routes - NetworkFirst with fallback to cache
      {
        urlPattern: /^https:\/\/.*\/api\/.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-cache",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24, // 1 day
          },
        },
      },
      // IMPORTANT: DO NOT cache Hugging Face/Transformers.js model files
      // Transformers.js needs to manage its own Cache API for offline functionality
      {
        urlPattern: /^https:\/\/huggingface\.co\/.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "huggingface-models",
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
          },
        },
      },
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
  },
})(nextConfig);
