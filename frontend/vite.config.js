import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/nox-dashboard/',
  plugins: [react()],
  esbuild: {
    loader: 'tsx',
    include: [
      'src/**/*.js',
      'src/**/*.jsx',
    ],
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist'
  }
})
