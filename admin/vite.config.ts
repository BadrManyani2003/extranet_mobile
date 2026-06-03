import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
// @ts-ignore
import viteCompression from 'vite-plugin-compression'
// @ts-ignore
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
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
      port: parseInt(env.VITE_PORT) || 5173,
      strictPort: true
    },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
  };
});

