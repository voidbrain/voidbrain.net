import { defineConfig } from 'vite';

export default defineConfig({
  ssr: {
    noExternal: ['xterm'],
    external: []
  },
  optimizeDeps: {
    exclude: ['xterm']
  }
});
