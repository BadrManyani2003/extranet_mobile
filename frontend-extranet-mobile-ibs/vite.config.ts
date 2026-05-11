import path from "path"
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
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
