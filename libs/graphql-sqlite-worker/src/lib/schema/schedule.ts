import type { SqlExecutor } from '../types';

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
export async function createScheduleTable(executor: SqlExecutor): Promise<void> {
  await executor.exec(`
    CREATE TABLE IF NOT EXISTS schedule (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      year INTEGER NOT NULL,
      month INTEGER NOT NULL,
      date INTEGER NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      start INTEGER NOT NULL,
      beforeTime INTEGER NOT NULL,
      breakTime INTEGER NOT NULL,
      workoutTimes INTEGER NOT NULL,
      type TEXT NOT NULL
    )
  `);
  await ensureScheduleTitleColumn(executor);
  await executor.exec(createScheduleExerciseTableSql);
  await executor.exec(deleteTriggerOnScheduleExercise);
}

/**
 * 기존 DB에 title 컬럼이 없으면 추가합니다 (CREATE IF NOT EXISTS만으로는 보강되지 않음).
 */
export async function ensureScheduleTitleColumn(executor: SqlExecutor): Promise<void> {
  const columns = await executor.query(`PRAGMA table_info(schedule)`);
  const hasTitle = columns.some((column) => column['name'] === 'title');
  if (!hasTitle) {
    await executor.exec(`ALTER TABLE schedule ADD COLUMN title TEXT NOT NULL DEFAULT ''`);
  }
}

/**
 * schedule_exercise 테이블 재생성을 위한 SQL (마이그레이션용)
 */
export const recreateScheduleExerciseTableSql = createScheduleExerciseTableSql;

/**
 * schedule_exercise 트리거 재생성을 위한 SQL (마이그레이션용)
 */
export const recreateScheduleExerciseTriggerSql = deleteTriggerOnScheduleExercise;
