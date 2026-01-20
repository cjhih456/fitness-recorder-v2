import type { SQLiteWorker } from '../sqlite-worker';

const createExercisePresetExerciseTableSql = `
  CREATE TABLE IF NOT EXISTS exercisePreset_exercise (
    exercisePresetId INTEGER REFERENCES exercisePreset(id) ON DELETE CASCADE,
    exerciseId INTEGER REFERENCES exercise(id) ON DELETE CASCADE
  )
`;

const deleteTriggerOnExercisePresetExercise = `
  CREATE TRIGGER IF NOT EXISTS delete_exercises_after_exercisePreset_delete
  BEFORE DELETE ON exercisePreset
  FOR EACH ROW
  BEGIN
      DELETE FROM exercise 
      WHERE id IN (
          SELECT exerciseId 
          FROM exercisePreset_exercise 
          WHERE exercisePresetId = OLD.id
      );
  END;
`;

/**
 * exercisePreset 테이블과 관련 테이블을 생성합니다.
 */
export async function createExercisePresetTable(worker: SQLiteWorker): Promise<void> {
  await worker.exec(`
    CREATE TABLE IF NOT EXISTS exercisePreset (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      deps INTEGER NOT NULL
    )
  `);
  await worker.exec(createExercisePresetExerciseTableSql);
  await worker.exec(deleteTriggerOnExercisePresetExercise);
}

/**
 * exercisePreset_exercise 테이블 재생성을 위한 SQL (마이그레이션용)
 */
export const recreateExercisePresetExerciseTableSql = createExercisePresetExerciseTableSql;

/**
 * exercisePreset_exercise 트리거 재생성을 위한 SQL (마이그레이션용)
 */
export const recreateExercisePresetExerciseTriggerSql = deleteTriggerOnExercisePresetExercise;
