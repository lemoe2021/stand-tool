import { fileURLToPath, URL } from 'node:url';
import WindiCSS from 'vite-plugin-windicss';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  base: fileURLToPath(new URL('./dist', import.meta.url)),
  plugins: [WindiCSS(), vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
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
