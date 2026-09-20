import type { SqlExecutor } from '../types';

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
export async function createExerciseTable(executor: SqlExecutor): Promise<void> {
  await executor.exec(createExerciseTableSql);
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
