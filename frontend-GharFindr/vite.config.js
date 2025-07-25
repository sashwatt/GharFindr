import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'ssl/localhost-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'ssl/localhost.pem')),
    },
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://localhost:3000', // Backend URL (make sure backend is also running on HTTPS)
        changeOrigin: true,
        secure: false, // Accept self-signed certificates from backend
      },
    },
  },
});
