import path from "path"
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
// @ts-ignore
import viteCompression from 'vite-plugin-compression'
// @ts-ignore
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      vue(),
      viteCompression({ algorithm: 'brotliCompress' }),
      viteCompression({ algorithm: 'gzip' }),
      visualizer({ open: false, gzipSize: true, brotliSize: true })
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: parseInt(env.VITE_PORT) || 5174,
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
  };
});

