import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // CSS Optimization
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]___[hash:base64:5]',
    },
    devSourcemap: true,
  },

  // Build Optimization
  build: {
    // Output directory
    outDir: 'dist',
    
    // Generate source maps for debugging (disable in production if not needed)
    sourcemap: false,
    
    // Minify CSS and JS
    minify: 'terser',
    
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },

    // CSS code splitting
    cssCodeSplit: true,
    
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    
    rollupOptions: {
      output: {
        // Manual chunks for better caching
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['antd', 'lucide-react'],
          'chart-vendor': ['recharts'],
          
          // Split by route
          'inventory': [
            './src/components/InventoryAnalytics.tsx',
            './src/components/InventoryDashboard.tsx',
            './src/components/ConsumptionInventory.tsx',
            './src/components/BudgetAnalysis.tsx',
            './src/components/ManageItems.tsx',
            './src/components/ManageCategories.tsx'
          ],
        },
        
        // Asset file naming
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          const ext = info[info.length - 1]
          
          if (/\.(css)$/.test(assetInfo.name)) {
            return `assets/css/[name]-[hash][extname]`
          }
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
            return `assets/images/[name]-[hash][extname]`
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return `assets/fonts/[name]-[hash][extname]`
          }
          
          return `assets/[name]-[hash][extname]`
        },
        
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },

    // Optimize deps
    commonjsOptions: {
      include: [/node_modules/],
    },
  },

  // Development server
  server: {
    port: 3000,
    open: true,
    // Fix CORS issues in development
    cors: true,
  },

  // Preview server (for testing production build)
  preview: {
    port: 4173,
    open: true,
  },
})