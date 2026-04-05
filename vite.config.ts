import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  build: {
    chunkSizeWarningLimit: 650,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('react-leaflet') || id.includes('leaflet')) return 'map'
          if (id.includes('@tanstack/react-query') || id.includes('@tanstack/react-virtual')) return 'query'
          if (id.includes('react-router-dom') || id.includes('react-dom') || id.includes('/react/')) return 'react'
          if (id.includes('boneyard-js')) return 'skeleton'
          return undefined
        },
      },
    },
  },
})
