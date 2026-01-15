import * as path from 'path';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import GraphqlLoader from 'vite-plugin-graphql-loader';
import viteWasmPlugin from 'vite-plugin-wasm';

export default defineConfig({
  plugins: [
    viteWasmPlugin(),
    GraphqlLoader(),
  ],
  worker: {
    format: 'iife' as const,
    plugins: () => [
      nxViteTsPaths(),
      dts({
        entryRoot: 'src',
        tsconfigPath: path.join(import.meta.dirname, 'tsconfig.worker.json'),
        pathsToAliases: false,
      }),
      GraphqlLoader(),
      viteWasmPlugin(),
    ]
  },
  optimizeDeps: {
    exclude: [
      '@sqlite.org/sqlite-wasm',
      'crypto',
      'os',
      'zlib'
    ]
  },
})