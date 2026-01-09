/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import { vitePluginI18nextLanguagePackageLoader } from './src/vite-plugins/i18next-language-package';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(() => ({
  root: import.meta.dirname,
  cacheDir: '../../node_modules/.vite/app/web',
  server: {
    port: 3000,
    host: 'localhost',
  },
  preview: {
    port: 3000,
    host: 'localhost',
  },
  plugins: [react(), nxViteTsPaths(), nxCopyAssetsPlugin(['*.md']),
    vitePluginI18nextLanguagePackageLoader({
      excelFilePath: 'src/assets/i18n/languages.xlsx',
      outputDir: 'src/assets/i18n/languages',
      typeDir: 'src/assets/i18n/languages',
      useDts: true,
      defaultNS: 'common',
      langs: ['ko', 'en'],
    }),
    tailwindcss()
  ],
  // Uncomment this if you are using workers.
  // worker: {
  //   plugins: () => [ nxViteTsPaths() ],
  // },
  build: {
    outDir: '../../dist/app/web',
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  test: {
    name: 'web',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/app/web',
      provider: 'v8' as const,
    },
  },
}));
