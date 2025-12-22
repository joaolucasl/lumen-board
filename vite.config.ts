import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { copyFileSync } from 'fs';
import { visualizer } from 'rollup-plugin-visualizer';

// Plugin to copy CSS file during library build
const copyCssPlugin = () => ({
  name: 'copy-css',
  writeBundle() {
    copyFileSync(
      path.resolve(__dirname, 'src/styles/lumen-board.css'),
      path.resolve(__dirname, 'dist/lumen-board.css')
    );
  },
});

export default defineConfig(({ mode }) => {
  const _env = loadEnv(mode, '.', '');
  const isLibBuild = mode === 'lib';

  return {
    root: isLibBuild ? '.' : 'demo',
    server: {
      port: 3000,
      host: '0.0.0.0',
      fs: {
        allow: [
          path.resolve(__dirname, '.'),
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, 'demo'),
        ],
      },
    },
    plugins: [
      react(),
      isLibBuild && dts({ 
        include: ['src'],
        outDir: 'dist',
      }),
      isLibBuild && copyCssPlugin(),
      isLibBuild && visualizer({
        filename: 'dist/stats.html',
        gzipSize: true,
        brotliSize: true,
      }),
    ].filter(Boolean),
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: isLibBuild ? {
      lib: {
        entry: path.resolve(__dirname, 'src/index.ts'),
        formats: ['es', 'cjs'],
        fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
      },
      outDir: 'dist',
      rollupOptions: {
        external: ['react', 'react-dom', 'react/jsx-runtime'],
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
          },
        },
      },
      sourcemap: true,
    } : {
      outDir: path.resolve(__dirname, 'dist-demo'),
    },
  };
});
