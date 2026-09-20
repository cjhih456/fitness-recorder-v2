import { describe, expect, it } from 'vitest';
import XLSX from 'xlsx';
import { excelToJson, unflatten } from './fileUtils';

describe('excelToJson', () => {
  it('parses namespace/code language columns', () => {
    const sheet = XLSX.utils.aoa_to_sheet([
      ['namespace', 'code', 'en', 'ko'],
      ['nav', 'home', 'Home', '홈'],
      ['error', 'wrong.schedule', 'Missing schedule', '잘못된 접근입니다.'],
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, 'Sheet1');

    expect(excelToJson(workbook)).toEqual({
      en: {
        'nav.home': 'Home',
        'error.wrong.schedule': 'Missing schedule',
      },
      ko: {
        'nav.home': '홈',
        'error.wrong.schedule': '잘못된 접근입니다.',
      },
    });
  });

  it('parses legacy language-row sheets', () => {
    const sheet = XLSX.utils.aoa_to_sheet([
      ['', 'home', 'close'],
      ['en', 'Home', 'Close'],
      ['ko', '홈', '닫기'],
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, 'Sheet1');

    expect(excelToJson(workbook)).toEqual({
      en: { home: 'Home', close: 'Close' },
      ko: { home: '홈', close: '닫기' },
    });
  });
});

describe('unflatten', () => {
  it('nests dotted keys', () => {
    expect(
      unflatten({
        'nav.home': '홈',
        'error.wrong.schedule': '잘못된 접근입니다.',
      }),
    ).toEqual({
      nav: { home: '홈' },
      error: { wrong: { schedule: '잘못된 접근입니다.' } },
    });
  });
});
