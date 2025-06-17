import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // Cho phép truy cập từ bên ngoài
    allowedHosts: [
      'localhost',
      '127.0.0.1'
    ],
    // strictPort: false, // Cho phép tự động chọn port khác nếu 5173 bị chiếm
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
