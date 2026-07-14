import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      'html2pdf.js': 'html2pdf.js/dist/html2pdf.min.js',
    },
  },
  plugins: [react()],
})
