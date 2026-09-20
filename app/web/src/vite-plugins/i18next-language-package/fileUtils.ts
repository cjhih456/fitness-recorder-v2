import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';

/**
 * Excel 파일을 읽어서 Workbook 객체를 반환합니다.
 */
export function readExcelFile(filePath: string): XLSX.WorkBook {
  const workbook = XLSX.readFile(filePath);
  return workbook;
}

function cellText(value: unknown): string {
  if (value === undefined || value === null) return '';
  return value.toString().trim();
}

/**
 * `namespace.code` 평탄 키를 중첩 객체로 변환합니다.
 */
export function unflatten(
  flat: Record<string, string>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split('.').filter(Boolean);
    if (parts.length === 0) continue;

    let current: Record<string, unknown> = result;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      const next = current[part];
      if (typeof next !== 'object' || next === null) {
        current[part] = {};
      }
      current = current[part] as Record<string, unknown>;
    }
    current[parts[parts.length - 1]] = value;
  }

  return result;
}

function excelNamespaceCodeToJson(
  data: unknown[][]
): Record<string, Record<string, string>> {
  const header = (data[0] ?? []).map(cellText);
  const langCodes = header.slice(2).filter(Boolean);
  const languages: Record<string, Record<string, string>> = {};

  for (const lang of langCodes) {
    languages[lang] = {};
  }

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const namespace = cellText(row[0]);
    const code = cellText(row[1]);
    if (!namespace || !code) continue;

    const key = `${namespace}.${code}`;
    langCodes.forEach((lang, index) => {
      languages[lang][key] = cellText(row[index + 2]);
    });
  }

  return languages;
}

function excelLanguageRowToJson(
  data: unknown[][]
): Record<string, Record<string, string>> {
  const keys = (data[0] ?? []).slice(1).map(cellText);
  const languages: Record<string, Record<string, string>> = {};

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;

    const langCode = cellText(row[0]);
    if (!langCode) continue;

    const langData: Record<string, string> = {};
    for (let j = 1; j < row.length; j++) {
      const key = keys[j - 1];
      if (key) {
        langData[key] = cellText(row[j]);
      }
    }
    languages[langCode] = langData;
  }

  return languages;
}

/**
 * Excel Workbook을 언어별 JSON 객체로 변환합니다.
 * - `namespace | code | en | ko` 형식
 * - 또는 첫 행이 키, 첫 열이 언어 코드인 레거시 형식
 */
export function excelToJson(
  workbook: XLSX.WorkBook
): Record<string, Record<string, string>> {
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];

  if (data.length === 0) {
    return {};
  }

  const header = (data[0] ?? []).map(cellText);
  if (header[0] === 'namespace' && header[1] === 'code') {
    return excelNamespaceCodeToJson(data);
  }

  return excelLanguageRowToJson(data);
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
  fs.writeFileSync(
    filePath,
    `${JSON.stringify(unflatten(data), null, 2)}\n`,
    'utf-8'
  );
}

/**
 * TypeScript 타입 정의 파일을 생성합니다.
 * 기본 언어(첫 번째 langs) JSON을 i18next namespace 타입으로 연결합니다.
 */
export function writeDtsFile(
  outputDir: string,
  languages: string[],
  defaultNS: string
): void {
  ensureDirectoryExists(outputDir);
  const filePath = path.join(outputDir, `index.d.ts`);
  const defaultLang = languages[0] ?? 'ko';

  const dtsContent = `import 'i18next';
import type ${defaultLang} from './${defaultLang}.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: '${defaultNS}';
    resources: {
      ${defaultNS}: typeof ${defaultLang};
    };
  }
}
`;

  fs.writeFileSync(filePath, dtsContent, 'utf-8');
}
