import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/',
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'pwa-icon-192.png', 'pwa-icon-512.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'FishingRadar',
        short_name: 'FishingRadar',
        description: 'Your fishing companion app',
        theme_color: '#1a73e8',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          { src: '/pwa-icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        importScripts: ['/sw-push.js'],
        navigateFallbackDenylist: [/^\/~oauth/],
      },
    }),
  ].filter(Boolean),
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['framer-motion', '@radix-ui/react-dialog', '@radix-ui/react-popover', '@radix-ui/react-select'],
          'vendor-charts': ['recharts'],
          'vendor-map': ['leaflet', 'react-leaflet'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-icons': ['lucide-react'],
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
    },
    target: 'es2020',
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime"],
  },
  optimizeDeps: {
    force: true,
    include: ["react", "react-dom", "react-dom/client", "react/jsx-runtime", "react-router-dom"],
  },
}));
