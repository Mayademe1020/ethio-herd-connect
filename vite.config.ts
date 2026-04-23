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
          // Lenient CSP for development
          return html.replace(
            '<meta name="viewport"',
            '<meta http-equiv="Content-Security-Policy" content="default-src \'self\' \'unsafe-eval\' \'unsafe-inline\'; script-src \'self\' \'unsafe-eval\' \'unsafe-inline\'; style-src \'self\' \'unsafe-inline\' https://fonts.googleapis.com; font-src \'self\' data: https://fonts.gstatic.com; connect-src \'self\' ws: wss: https://pbtaolycccmmqmwurinp.supabase.co; img-src \'self\' data: https: blob:;">\n    <meta name="viewport"'
          );
        }
        // Strict CSP for production
        return html.replace(
          '<meta name="viewport"',
          '<meta http-equiv="Content-Security-Policy" content="default-src \'self\'; script-src \'self\' \'unsafe-inline\'; style-src \'self\' \'unsafe-inline\' https://fonts.googleapis.com; font-src \'self\' data: https://fonts.gstatic.com; img-src \'self\' data: https: blob:; connect-src \'self\' https://pbtaolycccmmqmwurinp.supabase.co; frame-src \'none\'; object-src \'none\'; base-uri \'self\'; form-action \'self\';">\n    <meta name="viewport"'
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
    // TARGET: <300KB initial load total
    chunkSizeWarningLimit: 250, // Reduced from 500KB to 250KB per chunk
    rollupOptions: {
      output: {
        // Customize chunk filenames
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        // Simple chunking - only heavy libraries that should be lazy loaded
        manualChunks: (id) => {
          // ML models - lazy load, don't block initial render
          if (id.includes('node_modules/@tensorflow')) {
            return 'vendor-ml';
          }
          // Charts - lazy load
          if (id.includes('node_modules/recharts') || id.includes('node_modules/chart.js')) {
            return 'vendor-charts';
          }
        }
      },
      // Tree shaking - disable aggressive mode that removes needed code
      treeshake: {
        moduleSideEffects: true,
        propertyReadSideEffects: true
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
    // Report compressed sizes
    reportCompressedSize: true,
    // Asset inlining threshold (inline small assets)
    assetsInlineLimit: 4096, // 4KB
  },
  // Optimize for low-end devices in Ethiopia
  optimizeDeps: {
    // Include dependencies that should be pre-bundled
    include: ['react', 'react-dom', 'react-router-dom']
  }
}));
