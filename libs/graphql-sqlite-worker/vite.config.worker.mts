/// <reference types='vitest' />
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import * as path from 'path';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import GraphqlLoader from 'vite-plugin-graphql-loader';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/libs/graphql-sqlite-worker',
  plugins: [
    nxViteTsPaths(),
    dts({
      entryRoot: 'src',
      tsconfigPath: path.join(import.meta.dirname, 'tsconfig.worker.json'),
      pathsToAliases: false,
    }),
    GraphqlLoader(),
    viteStaticCopy({
      targets: [
        {
          src: '../../node_modules/@sqlite.org/sqlite-wasm/sqlite-wasm/jswasm/sqlite3.wasm',
          dest: '.',
        },
        {
          src: '../../node_modules/@sqlite.org/sqlite-wasm/sqlite-wasm/jswasm/sqlite3-opfs-async-proxy.js',
          dest: '.',
        }
      ]
    })
  ],
  // Uncomment this if you are using workers.
  // worker: {
  //   plugins: () => [ nxViteTsPaths() ],
  // },
  // Configuration for building your library.
  // See: https://vite.dev/guide/build.html#library-mode
  build: {
    outDir: './dist/worker',
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      entry: {
        serviceWorker: 'src/worker/service-worker/index',
        dbWorker: 'src/worker/db-worker.worker',
      },
      name: 'graphql-sqlite-worker',
      formats: ['es' as const],
    },
    rollupOptions: {
      external: ['@fitness-recoder/structure'],
    },
  },
})
