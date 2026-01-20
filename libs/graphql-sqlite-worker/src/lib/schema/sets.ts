import type { SQLiteWorker } from '../sqlite-worker';

const createSetsTableSql = `
  CREATE TABLE IF NOT EXISTS sets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exerciseId INTEGER REFERENCES exercise(id) ON DELETE CASCADE,
    repeat INTEGER NOT NULL,
    isDone INTEGER NOT NULL,
    weightUnit TEXT NOT NULL,
    weight REAL,
    duration INTEGER
  )
`;

/**
 * sets 테이블을 생성합니다.
 */
export async function createSetTable(worker: SQLiteWorker): Promise<void> {
  await worker.exec(createSetsTableSql);
}

/**
 * sets 테이블 재생성을 위한 SQL (마이그레이션용)
 */
export const recreateSetsTableSql = createSetsTableSql;
