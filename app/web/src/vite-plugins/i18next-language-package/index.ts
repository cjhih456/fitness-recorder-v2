import type { Plugin } from 'vite';
import * as fs from 'fs';
import {
  readExcelFile,
  excelToJson,
  writeJsonFile,
  writeDtsFile,
} from './fileUtils';

export interface Options {
  excelFilePath: string;
  outputDir: string;
  typeDir: string;
  useDts: boolean;
  defaultNS: string;
  langs: string[];
}

const VIRTUAL_PREFIX = 'virtual:i18n/';
const RESOLVED_VIRTUAL_PREFIX = '\0' + VIRTUAL_PREFIX;

export function vitePluginI18nextLanguagePackageLoader(
  options: Options
): Plugin {
  let languageData: Record<string, Record<string, string>> = {};
  let isProduction = false;

  // Excel 파일을 읽어서 언어별 데이터로 변환
  const loadLanguageData = () => {
    const workbook = readExcelFile(options.excelFilePath);
    languageData = excelToJson(workbook);
  };

  return {
    name: 'vite-plugin-i18next-language-package-loader',
    enforce: 'pre',

    configResolved(config) {
      isProduction = config.command === 'build';
    },

    // 개발 환경: virtual 파일 resolve
    resolveId(id) {
      if (id.startsWith(VIRTUAL_PREFIX)) {
        return '\0' + id
      }
      return null;
    },

    // 개발 환경: virtual 파일 로드
    load(id) {
      if (!id.startsWith(RESOLVED_VIRTUAL_PREFIX)) {
        return null;
      }
      const language = id.replace(RESOLVED_VIRTUAL_PREFIX, '');
      
      // Excel 파일이 변경되었을 수 있으므로 다시 로드
      if (fs.existsSync(options.excelFilePath)) {
        try {
          loadLanguageData();
        } catch (error) {
          console.warn(`Failed to reload Excel file: ${error}`);
        }
      }

      const data = languageData[language] || {};
      return `export default ${JSON.stringify(data, null, 2)};`;
    },

    // 프로덕션 환경: 실제 파일 생성
    buildStart() {
      if (!isProduction) { return; }

      // Excel 파일이 변경되었을 수 있으므로 다시 로드
      if (fs.existsSync(options.excelFilePath)) {
        try {
          loadLanguageData();
        } catch (error) {
          console.error(`Failed to load Excel file: ${error}`);
          throw error;
        }
      }

      // 각 언어별로 JSON 파일 생성
      for (const lang of options.langs) {
        const data = languageData[lang] || {};
        writeJsonFile(options.outputDir, lang, data);

        // useDts 옵션이 켜져있을 경우 d.ts 파일 생성
      }
      if (options.useDts) {
        writeDtsFile(options.outputDir, options.langs, options.defaultNS);
      }
    },

    // 개발 환경에서 Excel 파일 변경 감지
    configureServer(server) {
      if (!fs.existsSync(options.excelFilePath)) {
        console.error(`Excel file not found: ${options.excelFilePath}`);
        return;
      }
      fs.watchFile(
        options.excelFilePath,
        { interval: 1000 },
        () => {
          try {
            loadLanguageData();
            // virtual 모듈들을 무효화하여 다시 로드되도록 함
            for (const lang of options.langs) {
              const moduleId = `${VIRTUAL_PREFIX}${lang}`;
              const module = server.moduleGraph.getModuleById(moduleId);
              if (module) {
                server.moduleGraph.invalidateModule(module);
              }
            }
            // HMR 트리거
            server.ws.send({
              type: 'full-reload',
            });
          } catch (error) {
            console.warn(`Failed to reload Excel file: ${error}`);
          }
        }
      );

      // 서버 종료 시 watcher 정리
      server.httpServer?.once('close', () => {
        fs.unwatchFile(options.excelFilePath);
      });
    },
  };
}
