import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths()
  ],
  server: {
    port: 3000,
    host: '0.0.0.0', // Important for Docker
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://backend-dev:5000', // Use Docker service name
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react', 'react-hot-toast']
        }
      }
    }
  },
  define: {
    global: 'globalThis'
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@tanstack/react-query']
  },
  // Fix ESM issues in Docker
  esbuild: {
    target: 'node14'
  }
});
