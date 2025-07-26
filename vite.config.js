import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'recordCollector',
      filename: 'remoteEntry.js',
      exposes: {
        './RecordCollectorCard': './src/components/RecordCollectorCard.jsx',
      },
      shared: ['react', 'react-dom'],
      dev: {
        enabled: true,
      },
    }),
  ],
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
  server: {
    port: 4176,
    fs: {
      allow: ['..']
    }
  },
  preview: {
    port: 4176,
  },
})
