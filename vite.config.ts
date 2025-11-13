import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    // Bundle analyzer - generates stats.html
    mode === 'production' && visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
    // CSP configuration for development and production
    {
      name: 'html-transform-csp',
      transformIndexHtml(html: string) {
        if (mode === 'development') {
          // Lenient CSP for development (allows HMR, DevTools, and external resources)
          return html.replace(
            '<meta name="viewport"',
            `<meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-eval' 'unsafe-inline'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' ws: wss: https://pbtaolycccmmqmwurinp.supabase.co; img-src 'self' data: https: blob:;">
    <meta name="viewport"`
          );
        }
        // Strict CSP for production (no unsafe-eval, but allows Google Fonts)
        return html.replace(
          '<meta name="viewport"',
          `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://pbtaolycccmmqmwurinp.supabase.co; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self';">
    <meta name="viewport"`
        );
      }
    },
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Enable brotli compression for smaller file sizes
    brotliSize: true,
    // Optimize chunk size for Ethiopian low-bandwidth conditions
    chunkSizeWarningLimit: 500, // Target < 500KB per chunk
    rollupOptions: {
      output: {
        // Customize chunk filenames
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        // Group common dependencies into shared chunks - optimized for Ethiopian farmers
        manualChunks: (id) => {
          // Core React libraries (keep small)
          if (id.includes('node_modules/react') ||
              id.includes('node_modules/react-dom')) {
            return 'vendor-core';
          }

          // Routing (separate for better caching)
          if (id.includes('node_modules/react-router-dom')) {
            return 'vendor-router';
          }

          // UI components (Radix UI is heavy, separate it)
          if (id.includes('node_modules/@radix-ui')) {
            return 'vendor-radix';
          }

          // Icons (small, can stay with UI)
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }

          // Forms (separate chunk)
          if (id.includes('node_modules/react-hook-form') ||
              id.includes('node_modules/zod')) {
            return 'vendor-forms';
          }

          // Supabase (large, separate chunk)
          if (id.includes('node_modules/@supabase')) {
            return 'vendor-supabase';
          }

          // React Query (separate for caching strategies)
          if (id.includes('node_modules/@tanstack/react-query')) {
            return 'vendor-query';
          }

          // Date utilities (can be lazy loaded)
          if (id.includes('node_modules/date-fns')) {
            return 'vendor-date';
          }

          // Utility libraries (split further)
          if (id.includes('node_modules/uuid') ||
              id.includes('node_modules/crypto-js') ||
              id.includes('node_modules/dompurify')) {
            return 'vendor-utils';
          }

          // Everything else goes to misc (should be smaller now)
          if (id.includes('node_modules')) {
            return 'vendor-misc';
          }
        }
      }
    },
    // Minimize for production
    minify: mode === 'production' ? 'esbuild' : false,
    // Target older browsers for better compatibility in rural Ethiopia
    target: 'es2015',
    // Source maps for debugging (disabled in production for smaller size)
    sourcemap: mode === 'development',
    // CSS code splitting
    cssCodeSplit: true,
  },
  // Optimize for low-end devices in Ethiopia
  optimizeDeps: {
    // Include dependencies that should be pre-bundled
    include: ['react', 'react-dom', 'react-router-dom']
  }
}));
