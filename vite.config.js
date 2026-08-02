import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        /*
          three + drei are ~1MB and change only when the dependency is upgraded,
          while app code changes constantly. Splitting them keeps that megabyte
          in a chunk browsers can reuse across deploys instead of re-downloading
          it whenever a component is edited.
        */
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('three-stdlib') || /node_modules[\\/]three[\\/]/.test(id)) {
            return 'three';
          }
          if (id.includes('@react-three')) return 'react-three';
          if (id.includes('@tsparticles')) return 'tsparticles';
        },
      },
    },
  },
});
