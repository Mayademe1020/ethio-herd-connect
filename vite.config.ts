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
        // Group common dependencies into shared chunks
        manualChunks: (id) => {
          // Core vendor libraries (smallest bundle)
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') || 
              id.includes('node_modules/react-router-dom')) {
            return 'vendor-core';
          }
          
          // UI components library
          if (id.includes('node_modules/@radix-ui') || 
              id.includes('node_modules/lucide-react')) {
            return 'vendor-ui';
          }
          
          // Form libraries
          if (id.includes('node_modules/react-hook-form') || 
              id.includes('node_modules/zod')) {
            return 'vendor-forms';
          }
          
          // Data management
          if (id.includes('node_modules/@tanstack/react-query') ||
              id.includes('node_modules/@supabase')) {
            return 'vendor-data';
          }
          
          // Date utilities
          if (id.includes('node_modules/date-fns')) {
            return 'vendor-date';
          }
          
          // Charts and visualization (heavy - separate chunk)
          if (id.includes('node_modules/recharts') || 
              id.includes('node_modules/d3')) {
            return 'vendor-charts';
          }
          
          // Other node_modules
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
