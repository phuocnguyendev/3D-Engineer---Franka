import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  assetsInclude: ['**/*.glb'],
  optimizeDeps: {
    include: [
      'three',
      'three/addons/lines/Line2.js',
      'three/addons/lines/LineGeometry.js',
      'three/addons/lines/LineMaterial.js',
      '@react-three/fiber',
      '@react-three/drei',
    ],
  },
})
