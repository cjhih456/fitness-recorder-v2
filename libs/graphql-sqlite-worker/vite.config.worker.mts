/// <reference types='vitest' />
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import * as path from 'path';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import GraphqlLoader from 'vite-plugin-graphql-loader';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/libs/graphql-sqlite-worker',
  /**
   * 패키지 엔트리(`index.mjs`)는 sqlite3-worker1-promiser를 side-effect로 끌어옵니다.
   * 그 파일이 `new Worker(new URL('sqlite3-worker1.js', import.meta.url))`를 포함해
   * 라이브러리 빌드가 `/assets/sqlite3-worker1-*.js`를 심고, 앱의 `?worker&url`
   * 재번들이 `public/assets/sqlite3-worker1-*.js`를 찾지 못해 실패합니다.
   * DB Worker는 InitModule/OpfsDb만 쓰므로 sqlite3.mjs만 묶습니다.
   */
  resolve: {
    alias: [
      {
        find: /^@sqlite\.org\/sqlite-wasm$/,
        replacement: path.resolve(
          import.meta.dirname,
          '../../node_modules/@sqlite.org/sqlite-wasm/sqlite-wasm/jswasm/sqlite3.mjs',
        ),
      },
    ],
  },
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
        },
        {
          src: 'src/assets/seed.db',
          dest: '.',
        },
      ]
    })
  ],
  // Uncomment this if you are using workers.
  // worker: {
  //   plugins: () => [ nxViteTsPaths() ],
  // },
  // Configuration for building your library.
  // See: https://vite.dev/guide/build.html#library-mode
  assetsInclude: ['**/*.wasm'],
  build: {
    outDir: './dist/worker',
    reportCompressedSize: true,
    assetsInlineLimit: 0,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      entry: {
        serviceWorker: 'src/worker/service-worker/index',
        dbWorker: 'src/worker/db-worker.worker',
      },
      name: 'graphql-sqlite-worker',
      formats: ['es' as const, 'cjs' as const],
    },
    rollupOptions: {
      external: ['@fitness-recoder/structure'],
    },
  },
})
