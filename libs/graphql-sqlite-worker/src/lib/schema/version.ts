import type { SQLiteWorker } from '../sqlite-worker';

/**
 * version 테이블을 생성합니다.
 */
export async function createVersionTable(worker: SQLiteWorker): Promise<void> {
  await worker.exec(`
    CREATE TABLE IF NOT EXISTS version (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      version TEXT NOT NULL
    )
  `);
}

/**
 * 현재 데이터베이스 버전을 조회합니다.
 */
export async function getVersion(worker: SQLiteWorker): Promise<string | undefined> {
  const result = await worker.query(
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
export async function updateVersion(worker: SQLiteWorker, version: string): Promise<void> {
  await worker.exec('INSERT INTO version (version) VALUES (?)', [version]);
}
