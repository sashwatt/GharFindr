// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
// });

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',
    port: 5173,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'ssl/localhost-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'ssl/localhost.pem')),
    },
    proxy: {
      '/api': {
        target: 'https://localhost:3001', // Backend URL (make sure backend is also running on HTTPS)
        changeOrigin: true,
        secure: false, // Accept self-signed certificates from backend
      },
    },
  },
});
