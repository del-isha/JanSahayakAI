import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins:[react()],
  css: { postcss: {} },
  server:{
    proxy:{
      '/api': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true
      },
      '/docs': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true
      },
      '/redoc': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true
      },
      '/openapi.json': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true
      }
    },
    port: 5173
  }
});

