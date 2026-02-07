import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    emptyOutDir: false, // Don't delete popup build
    rollupOptions: {
      input: {
        content: resolve(__dirname, 'src/content.tsx'),
      },
      output: {
        format: 'iife',
        inlineDynamicImports: true,
        entryFileNames: 'content.js',
      },
    },
  }
})
