import { fileURLToPath, URL } from 'node:url';
import WindiCSS from 'vite-plugin-windicss';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  root: fileURLToPath(new URL('./src/renderer', import.meta.url)),
  base: './',
  plugins: [WindiCSS(), vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src/renderer/src', import.meta.url)),
    },
  },
  build: {
    outDir: fileURLToPath(new URL('./dist/renderer', import.meta.url)),
  },
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          'arcoblue-6': '#48b0f1',
        },
        javascriptEnabled: true,
      },
    },
  },
});
