// Post-build script to copy static files
// This is a fallback if the Vite plugin doesn't work

import { copyFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');

const distDir = resolve(__dirname, 'dist');

// Copy manifest.json
const manifestSrc = resolve(__dirname, 'manifest.json');
const manifestDest = join(distDir, 'manifest.json');
if (existsSync(manifestSrc)) {
  copyFileSync(manifestSrc, manifestDest);
  console.log('✓ Copied manifest.json');
}

// Copy icons directory
function copyDirectory(src, dest) {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }
  
  const entries = readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

const iconsSrc = resolve(__dirname, 'icons');
const iconsDest = join(distDir, 'icons');
if (existsSync(iconsSrc)) {
  copyDirectory(iconsSrc, iconsDest);
  console.log('✓ Copied icons directory');
} else {
  console.warn('⚠ Icons directory not found. Please create icons in the icons/ folder.');
}

console.log('✓ Static files copied successfully');

