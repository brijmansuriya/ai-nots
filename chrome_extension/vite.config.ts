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
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'index.html'),
        content: resolve(__dirname, 'src/content.tsx'),
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === 'content') return 'content.js'
          return 'assets/[name]-[hash].js'
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (asset) => {
          if (asset.name?.includes('content')) return 'content.css'
          return 'assets/[name]-[hash][extname]'
        },
        format: 'es', // ES modules work perfectly with Manifest V3
      },
    },
  },
})
