import type { SqlExecutor } from '../types';

/**
 * version 테이블을 생성합니다.
 */
export async function createVersionTable(executor: SqlExecutor): Promise<void> {
  await executor.exec(`
    CREATE TABLE IF NOT EXISTS version (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      version TEXT NOT NULL
    )
  `);
}

/**
 * 현재 데이터베이스 버전을 조회합니다.
 */
export async function getVersion(executor: SqlExecutor): Promise<string | undefined> {
  const result = await executor.query(
    'SELECT version FROM version ORDER BY id DESC LIMIT 1'
  );
  if (result.length === 0) {
    return undefined;
  }
  return result[0]['version'] as string | undefined;
}

/**
 * 새로운 버전을 데이터베이스에 추가합니다.
 */
export async function updateVersion(executor: SqlExecutor, version: string): Promise<void> {
  await executor.exec('INSERT INTO version (version) VALUES (?)', [version]);
}
