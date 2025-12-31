import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

/**
 * Excel 파일을 읽어서 Workbook 객체를 반환합니다.
 */
export function readExcelFile(filePath: string): XLSX.WorkBook {
  const workbook = XLSX.readFile(filePath);
  return workbook;
}

/**
 * Excel Workbook을 언어별 JSON 객체로 변환합니다.
 * 첫 번째 행은 키, 첫 번째 열은 언어 코드로 가정합니다.
 */
export function excelToJson(workbook: XLSX.WorkBook): Record<string, Record<string, string>> {
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

  if (data.length === 0) {
    return {};
  }

  // 첫 번째 행은 키 (첫 번째 셀은 빈 값이거나 헤더)
  const keys = data[0].slice(1); // 첫 번째 열 제외
  const languages: Record<string, Record<string, string>> = {};

  // 첫 번째 열은 언어 코드
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const langCode = row[0]?.toString().trim();
    if (!langCode) continue;

    const langData: Record<string, string> = {};
    for (let j = 1; j < row.length; j++) {
      const key = keys[j - 1]?.toString().trim();
      if (key) {
        langData[key] = row[j]?.toString() || '';
      }
    }

    languages[langCode] = langData;
  }

  return languages;
}

/**
 * 디렉토리가 존재하지 않으면 생성합니다.
 */
export function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * JSON 파일을 작성합니다.
 * 형식: {outputDir}/{language}.json
 */
export function writeJsonFile(
  outputDir: string,
  language: string,
  data: Record<string, string>
): void {
  ensureDirectoryExists(outputDir);
  const filePath = path.join(outputDir, `${language}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * TypeScript 타입 정의 파일을 생성합니다.
 * 형식: {outputDir}/{language}.d.ts
 * i18next를 확장하여 JSON 파일의 타입을 import합니다.
 */
export function writeDtsFile(
  outputDir: string,
  languages: string[],
  defaultNS: string
): void {
  ensureDirectoryExists(outputDir);
  const filePath = path.join(outputDir, `index.d.ts`);

  // JSON 파일 경로 (상대 경로)
  const importPaths = languages.map(language => `import type ${language} from './${language}.json';`);
  const resourcePaths = languages.map(language => `${language}: typeof ${language};`);

  const dtsContent = `import 'i18next';
${importPaths.join('\n')}

declare module 'i18next' {
interface CustomTypeOptions {
defaultNS: '${defaultNS}';
resources: {
${resourcePaths.join('\n')}
};
}}`;

  fs.writeFileSync(filePath, dtsContent, 'utf-8');
}
