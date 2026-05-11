import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
// @ts-ignore
import viteCompression from 'vite-plugin-compression'
// @ts-ignore
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    viteCompression({ algorithm: 'brotliCompress' }),
    viteCompression({ algorithm: 'gzip' }),
    visualizer({ open: false, gzipSize: true, brotliSize: true })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    port: 5175,
    strictPort: true
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('vue') || id.includes('keycloak-js')) {
              return 'vendor';
            }
            if (id.includes('lucide-vue-next') || id.includes('reka-ui') || id.includes('class-variance-authority')) {
              return 'ui';
            }
            return 'libs';
          }
        }
      }
    }
  }
})
