import type { SQLiteWorker } from '../sqlite-worker';

const createScheduleExerciseTableSql = `
  CREATE TABLE IF NOT EXISTS schedule_exercise (
    scheduleId INTEGER REFERENCES schedule(id) ON DELETE CASCADE,
    exerciseId INTEGER REFERENCES exercise(id) ON DELETE CASCADE
  )
`;

const deleteTriggerOnScheduleExercise = `
  CREATE TRIGGER IF NOT EXISTS delete_exercises_after_schedule_delete
  BEFORE DELETE ON schedule
  FOR EACH ROW
  BEGIN
      DELETE FROM exercise 
      WHERE id IN (
          SELECT exerciseId 
          FROM schedule_exercise 
          WHERE scheduleId = OLD.id
      );
  END;
`;

/**
 * schedule 테이블과 관련 테이블을 생성합니다.
 */
export async function createScheduleTable(worker: SQLiteWorker): Promise<void> {
  await worker.exec(`
    CREATE TABLE IF NOT EXISTS schedule (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      year INTEGER NOT NULL,
      month INTEGER NOT NULL,
      date INTEGER NOT NULL,
      start INTEGER NOT NULL,
      beforeTime INTEGER NOT NULL,
      breakTime INTEGER NOT NULL,
      workoutTimes INTEGER NOT NULL,
      type TEXT NOT NULL
    )
  `);
  await worker.exec(createScheduleExerciseTableSql);
  await worker.exec(deleteTriggerOnScheduleExercise);
}

/**
 * schedule_exercise 테이블 재생성을 위한 SQL (마이그레이션용)
 */
export const recreateScheduleExerciseTableSql = createScheduleExerciseTableSql;

/**
 * schedule_exercise 트리거 재생성을 위한 SQL (마이그레이션용)
 */
export const recreateScheduleExerciseTriggerSql = deleteTriggerOnScheduleExercise;
