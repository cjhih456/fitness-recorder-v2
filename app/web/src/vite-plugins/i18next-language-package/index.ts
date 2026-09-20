import type { Plugin } from 'vite';
import * as fs from 'fs';
import {
  readExcelFile,
  excelToJson,
  writeJsonFile,
  writeDtsFile,
  unflatten,
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

  const loadLanguageData = () => {
    const workbook = readExcelFile(options.excelFilePath);
    languageData = excelToJson(workbook);
  };

  const writeLanguageFiles = () => {
    if (!fs.existsSync(options.excelFilePath)) {
      return;
    }
    loadLanguageData();
    for (const lang of options.langs) {
      writeJsonFile(options.outputDir, lang, languageData[lang] || {});
    }
    if (options.useDts) {
      writeDtsFile(options.outputDir, options.langs, options.defaultNS);
    }
  };

  return {
    name: 'vite-plugin-i18next-language-package-loader',
    enforce: 'pre',

    buildStart() {
      writeLanguageFiles();
    },

    resolveId(id) {
      if (id.startsWith(VIRTUAL_PREFIX)) {
        return '\0' + id;
      }
      return null;
    },

    load(id) {
      if (!id.startsWith(RESOLVED_VIRTUAL_PREFIX)) {
        return null;
      }
      const language = id.replace(RESOLVED_VIRTUAL_PREFIX, '');

      if (fs.existsSync(options.excelFilePath)) {
        try {
          loadLanguageData();
        } catch (error) {
          console.warn(`Failed to reload Excel file: ${error}`);
        }
      }

      const data = unflatten(languageData[language] || {});
      return `export default ${JSON.stringify(data, null, 2)};`;
    },

    configureServer(server) {
      if (!fs.existsSync(options.excelFilePath)) {
        console.error(`Excel file not found: ${options.excelFilePath}`);
        return;
      }
      try {
        writeLanguageFiles();
      } catch (error) {
        console.warn(`Failed to load Excel file: ${error}`);
      }
      fs.watchFile(
        options.excelFilePath,
        { interval: 1000 },
        () => {
          try {
            writeLanguageFiles();
            for (const lang of options.langs) {
              const moduleId = `${VIRTUAL_PREFIX}${lang}`;
              const module = server.moduleGraph.getModuleById(moduleId);
              if (module) {
                server.moduleGraph.invalidateModule(module);
              }
            }
            server.ws.send({
              type: 'full-reload',
            });
          } catch (error) {
            console.warn(`Failed to reload Excel file: ${error}`);
          }
        }
      );

      server.httpServer?.once('close', () => {
        fs.unwatchFile(options.excelFilePath);
      });
    },
  };
}
