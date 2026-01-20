import type { SQLiteWorker } from '../sqlite-worker';

/**
 * exercise 테이블을 생성합니다.
 */
export async function createExerciseTable(worker: SQLiteWorker): Promise<void> {
  await worker.exec(`
    CREATE TABLE IF NOT EXISTS exercise (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fitnessId INTEGER REFERENCES fitness(id),
      deps INTEGER
    )
  `);
}
