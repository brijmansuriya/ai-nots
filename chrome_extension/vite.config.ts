import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync, existsSync } from 'node:fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-manifest',
      closeBundle() {
        // Copy manifest.json to dist
        try {
          copyFileSync(
            resolve(__dirname, 'public/manifest.json'),
            resolve(__dirname, 'dist/manifest.json')
          )
          console.log('✓ Copied manifest.json')
        } catch (err) {
          console.error('Failed to copy manifest.json:', err)
        }

        // Copy vite.svg icon to dist if it doesn't exist
        try {
          const viteSvgSource = resolve(__dirname, 'public/vite.svg')
          const viteSvgDest = resolve(__dirname, 'dist/vite.svg')
          if (existsSync(viteSvgSource) && !existsSync(viteSvgDest)) {
            copyFileSync(viteSvgSource, viteSvgDest)
            console.log('✓ Copied vite.svg icon')
          }
        } catch (err) {
          console.error('Failed to copy vite.svg:', err)
        }
      },
    },
  ],
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'index.html'),
      },
      output: {
        format: 'iife', // 👈 IMPORTANT
        inlineDynamicImports: true, // 👈 VERY IMPORTANT
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  }
})
