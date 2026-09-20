import type { MigrationScript } from '../migration';
import { recreateExerciseTableSql } from '../schema/exercise';
import { ensureScheduleTitleColumn } from '../schema/schedule';

/**
 * 1.5.0 버전 마이그레이션
 * @fitness-recoder/structure 기준
 * - exercise.deps NOT NULL DEFAULT 0
 * - schedule.title 보강 (1.4.0 미적용 DB 대비)
 */
export const migration_1_5_0: MigrationScript = {
  version: 15,
  description: 'Align exercise.deps with structure; ensure schedule.title',
  up: async (worker) => {
    await ensureScheduleTitleColumn(worker);

    await worker.exec('PRAGMA foreign_keys=OFF');
    await worker.exec('ALTER TABLE exercise RENAME TO exercise_old');
    await worker.exec(recreateExerciseTableSql);
    await worker.exec(`
      INSERT INTO exercise (id, fitnessId, deps)
      SELECT id, fitnessId, COALESCE(deps, 0) FROM exercise_old
    `);
    await worker.exec('DROP TABLE exercise_old');
    await worker.exec('PRAGMA foreign_keys=ON');
  },
};
