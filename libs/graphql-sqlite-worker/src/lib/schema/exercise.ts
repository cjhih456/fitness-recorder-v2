import type { SQLiteWorker } from '../sqlite-worker';

const createExerciseTableSql = `
  CREATE TABLE IF NOT EXISTS exercise (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fitnessId INTEGER REFERENCES fitness(id),
    deps INTEGER NOT NULL DEFAULT 0
  )
`;

/**
 * exercise 테이블을 생성합니다.
 */
export async function createExerciseTable(worker: SQLiteWorker): Promise<void> {
  await worker.exec(createExerciseTableSql);
}

/**
 * exercise 테이블 재생성을 위한 SQL (마이그레이션용)
 */
export const recreateExerciseTableSql = `
  CREATE TABLE IF NOT EXISTS exercise (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fitnessId INTEGER REFERENCES fitness(id),
    deps INTEGER NOT NULL DEFAULT 0
  )
`;
