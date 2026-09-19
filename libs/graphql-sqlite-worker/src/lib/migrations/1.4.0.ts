import type { MigrationScript } from '../migration';
import { recreateFitnessTableSql } from '../schema/fitness';

/**
 * 1.4.0 버전 마이그레이션
 * @fitness-recoder/structure 기준 DB 변경
 * - schedule.title 추가 (IScheduleSchema / IScheduleCreateSchema)
 * - fitness.equipment CHECK에 'other' 추가 (IFitnessEquipment)
 */
export const migration_1_4_0: MigrationScript = {
  version: 14,
  description: 'Align SQLite schema with structure: schedule.title and fitness equipment other',
  up: async (worker) => {
    await worker.exec(`ALTER TABLE schedule ADD COLUMN title TEXT NOT NULL DEFAULT ''`);

    await worker.exec('ALTER TABLE fitness RENAME TO fitness_old');
    await worker.exec(recreateFitnessTableSql);
    await worker.exec(`
      INSERT INTO fitness (
        id,
        name,
        aliases,
        primaryMuscles,
        secondaryMuscles,
        totalUseMuscles,
        force,
        level,
        mechanic,
        equipment,
        category,
        instructions,
        description,
        tips
      )
      SELECT
        id,
        name,
        aliases,
        primaryMuscles,
        secondaryMuscles,
        totalUseMuscles,
        force,
        level,
        mechanic,
        equipment,
        category,
        instructions,
        description,
        tips
      FROM fitness_old
    `);
    await worker.exec('DROP TABLE fitness_old');
  },
};
