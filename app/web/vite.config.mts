/// <reference types='vitest' />
import { defineConfig } from 'vite';
import type { PreRenderedChunk } from 'rollup';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import { vitePluginI18nextLanguagePackageLoader } from './src/vite-plugins/i18next-language-package';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

function isServiceWorkerChunk(chunkInfo: PreRenderedChunk): boolean {
  const id = chunkInfo.facadeModuleId ?? '';
  return (
    /serviceWorker/i.test(chunkInfo.name) ||
    /service-worker/i.test(chunkInfo.name) ||
    /serviceWorker/i.test(id) ||
    /service-worker/i.test(id)
  );
}

export default defineConfig(() => {
  const corsObj = {
    cors: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'cross-origin',
      'Cross-Origin-Embedder-Policy': 'credentialless',
      'Service-Worker-Allowed': '/'
    }
  }
  return {
    root: import.meta.dirname,
    base: process.env.VITE_BASE_PATH || '/',
    cacheDir: '../../node_modules/.vite/app/web',
    server: {
      port: 3000,
      host: 'localhost',
      ...corsObj
    },
    preview: {
      port: 3000,
      host: 'localhost',
      ...corsObj
    },
    plugins: [
      react(),
      nxViteTsPaths(),
      nxCopyAssetsPlugin([
        '*.md',
      ]),
      vitePluginI18nextLanguagePackageLoader({
        excelFilePath: path.join(import.meta.dirname, './src/assets/i18n/languages.xlsx'),
        outputDir: path.join(import.meta.dirname, 'src/assets/i18n/languages'),
        typeDir: path.join(import.meta.dirname, 'src/assets/i18n/languages'),
        useDts: true,
        defaultNS: 'translation',
        langs: ['ko', 'en'],
      }),
      tailwindcss(),
    ],
    optimizeDeps: {
      exclude: ['@fitness-recoder/graphql-sqlite-worker'],
    },
    assetsInclude: ['**/*.db'],
    /**
     * GitHub Pages는 Service-Worker-Allowed 헤더를 내려주지 않으므로
     * SW 스크립트가 assets/ 아래에 있으면 앱 루트 scope 등록이 거부됩니다.
     * Service Worker만 dist 루트에 출력합니다.
     */
    worker: {
      rollupOptions: {
        output: {
          entryFileNames: (chunkInfo) =>
            isServiceWorkerChunk(chunkInfo)
              ? '[name]-[hash].js'
              : 'assets/[name]-[hash].js',
        },
      },
    },
    build: {
      outDir: '../../dist/app/web',
      emptyOutDir: true,
      reportCompressedSize: true,
      commonjsOptions: {
        transformMixedEsModules: true,
      }
    },
    test: {
      name: 'web',
      watch: false,
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      reporters: ['default'],
      coverage: {
        reportsDirectory: '../../coverage/app/web',
        provider: 'v8' as const,
      },
    },
  }
});
