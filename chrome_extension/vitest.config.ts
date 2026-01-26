/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: [], // Add setup file here if you need global mocks
        include: ['tests/**/*.test.{ts,tsx}'],
    },
});
