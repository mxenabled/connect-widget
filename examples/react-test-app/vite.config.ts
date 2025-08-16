import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@mxenabled/connect-widget': path.resolve(__dirname, '../../dist/index.es.js'),
    },
  },
})
