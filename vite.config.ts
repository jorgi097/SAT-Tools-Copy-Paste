import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { buildSync } from 'esbuild';
import { readdirSync, existsSync, rmSync } from 'fs';

function bundleContentScriptsPlugin(): Plugin {
  return {
    name: 'bundle-content-scripts',
    closeBundle() {
      const contentScriptsDir = resolve(__dirname, 'src/content-scripts');
      if (!existsSync(contentScriptsDir)) return;

      const files = readdirSync(contentScriptsDir).filter(
        file => file.endsWith('.ts') || file.endsWith('.js')
      );

      files.forEach(file => {
        const name = file.replace(/\.(ts|js)$/, '');
        buildSync({
          entryPoints: [resolve(contentScriptsDir, file)],
          outfile: resolve(__dirname, `dist/content-scripts/${name}.js`),
          bundle: true,
          minify: false,
          target: 'es2020',
          format: 'iife',
        });
      });

      // Eliminar chunks compartidos en dist/assets si existen (ya no son necesarios)
      const assetsDir = resolve(__dirname, 'dist/assets');
      if (existsSync(assetsDir)) {
        const assetFiles = readdirSync(assetsDir);
        assetFiles.forEach(asset => {
          if (asset.startsWith('dom-') && asset.endsWith('.js')) {
            rmSync(resolve(assetsDir, asset), { force: true });
          }
        });
      }
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    bundleContentScriptsPlugin(),
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
        'content-scripts/invoice-data': resolve(__dirname, 'src/content-scripts/invoice-data.ts'),
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
