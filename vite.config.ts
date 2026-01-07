import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: false,
      filename: 'build-stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]___[hash:base64:5]',
    },
    devSourcemap: true,
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',

    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },

    cssCodeSplit: true,
    chunkSizeWarningLimit: 1500,

    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'antd-vendor': ['antd', '@ant-design/icons'],
          'ui-vendor': ['lucide-react'],
          'chart-vendor': ['recharts'],
          'inventory': [
            './src/components/InventoryAnalytics.tsx',
            './src/components/InventoryDashboard.tsx',
            './src/components/ConsumptionInventory.tsx',
            './src/components/BudgetAnalysis.tsx',
            './src/components/ManageItems.tsx',
            './src/components/ManageCategories.tsx',
          ],
        },

        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) {
            return `assets/[name]-[hash][extname]`
          }

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

    commonjsOptions: {
      include: [/node_modules/],
    },
  },

  server: {
    port: 3000,
    open: true,
    cors: true,
    proxy: {
      // Proxy for IoT Sensor API (port 8085)
      '/api/cafeteria': {
        target: 'http://localhost:8085',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          // These logs appear in YOUR TERMINAL, not browser console
          proxy.on('error', (err, _req, _res) => {
            console.log('\n❌ [Proxy Error]', err.message);
          });
          
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            const timestamp = new Date().toLocaleTimeString();
            console.log(`\n🔵 [${timestamp}] Proxying Request:`);
            console.log(`   ${req.method} ${req.url}`);
            console.log(`   → http://localhost:8085${req.url}`);
          });
          
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            const timestamp = new Date().toLocaleTimeString();
            const statusColor = proxyRes.statusCode === 200 ? '✅' : '❌';
            console.log(`${statusColor} [${timestamp}] Response:`);
            console.log(`   ${req.url}`);
            console.log(`   Status: ${proxyRes.statusCode} ${proxyRes.statusMessage}`);
            console.log(`   Content-Type: ${proxyRes.headers['content-type']}`);
            console.log('');
          });
        },
      },
      // Proxy for other APIs
      '/api/auth': {
        target: 'http://localhost:8084',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log(`🔐 [Auth API] ${req.method} ${req.url} → http://localhost:8084${req.url}`);
          });
        },
      },
      '/api/assets': {
        target: 'http://localhost:8088',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log(`📦 [Asset API] ${req.method} ${req.url} → http://localhost:8088${req.url}`);
          });
        },
      },
    },
  },

  preview: {
    port: 4173,
    open: true,
  },
})