import type { MigrationScript } from '../migration';
import { recreateExercisePresetExerciseTableSql, recreateExercisePresetExerciseTriggerSql } from '../schema/exercise-preset';
import { recreateScheduleExerciseTableSql, recreateScheduleExerciseTriggerSql } from '../schema/schedule';
import { recreateSetsTableSql } from '../schema/sets';

/**
 * 1.3.0 버전 마이그레이션
 * - Exercise 테이블 컬럼명 변경 (exercise -> fitnessId)
 * - ExercisePreset_exercise 테이블 재생성
 * - Schedule_exercise 테이블 재생성
 * - Sets 테이블 재생성
 * - 트리거 재생성
 */
export const migration_1_3_0: MigrationScript = {
  version: 13, // 1.3.0을 숫자로 변환
  description: 'Major refactoring: Column renaming and table recreation',
  up: async (worker) => {
    // Exercise 테이블 트리거 삭제
    await worker.exec('DROP TRIGGER IF EXISTS delete_exercises_after_exercisePreset_delete');
    await worker.exec('DROP TRIGGER IF EXISTS delete_exercises_after_schedule_delete');
    
    // Exercise 테이블 컬럼명 변경
    await worker.exec('ALTER TABLE exercise RENAME COLUMN exercise TO fitnessId');
    
    // ExercisePreset_exercise 테이블 재생성
    await worker.exec('ALTER TABLE exercisePreset_exercise RENAME TO exercisePreset_exercise_old');
    await worker.exec(recreateExercisePresetExerciseTableSql);
    await worker.exec(`
      INSERT INTO exercisePreset_exercise (exercisePresetId, exerciseId) 
      SELECT exercisePresetId, exerciseId FROM exercisePreset_exercise_old
    `);
    await worker.exec('DROP TABLE exercisePreset_exercise_old');
    await worker.exec(recreateExercisePresetExerciseTriggerSql);
    
    // Schedule_exercise 테이블 재생성
    await worker.exec('ALTER TABLE schedule_exercise RENAME TO schedule_exercise_old');
    await worker.exec(recreateScheduleExerciseTableSql);
    await worker.exec(`
      INSERT INTO schedule_exercise (scheduleId, exerciseId) 
      SELECT scheduleId, exerciseId FROM schedule_exercise_old
    `);
    await worker.exec('DROP TABLE schedule_exercise_old');
    await worker.exec(recreateScheduleExerciseTriggerSql);
    
    // Sets 테이블 재생성
    await worker.exec('ALTER TABLE sets RENAME TO sets_old');
    await worker.exec(recreateSetsTableSql);
    await worker.exec(`
      INSERT INTO sets (exerciseId, repeat, isDone, weightUnit, weight, duration) 
      SELECT exerciseId, repeat, isDone, weightUnit, weight, duration FROM sets_old
    `);
    await worker.exec('DROP TABLE sets_old');
  },
};
