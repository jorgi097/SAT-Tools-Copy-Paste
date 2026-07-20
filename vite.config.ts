import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react()
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        'popup/index': resolve(__dirname, 'src/popup/index.html'),
        background: resolve(__dirname, 'src/background/index.ts'),
        'content-scripts/autocomplete': resolve(__dirname, 'src/content-scripts/autocomplete.ts'),
        'content-scripts/constancia': resolve(__dirname, 'src/content-scripts/constancia.ts'),
        'content-scripts/hide': resolve(__dirname, 'src/content-scripts/hide.ts'),
        'content-scripts/no-frecuent': resolve(__dirname, 'src/content-scripts/no-frecuent.ts'),
        'content-scripts/paste': resolve(__dirname, 'src/content-scripts/paste.ts'),
        'content-scripts/reload': resolve(__dirname, 'src/content-scripts/reload.ts'),
        'content-scripts/csf-autocomplete': resolve(__dirname, 'src/content-scripts/csf-autocomplete.ts'),
        'content-scripts/utils': resolve(__dirname, 'src/content-scripts/utils.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background') {
            return 'background.js';
          }
          if (chunkInfo.name === 'popup/index') {
            return 'popup/index.js';
          }
          if (chunkInfo.name.startsWith('content-scripts/')) {
            return '[name].js';
          }
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css') && assetInfo.name.includes('index')) {
            return 'popup/index.css';
          }
          return 'assets/[name]-[hash].[ext]';
        }
      }
    }
  }
});
