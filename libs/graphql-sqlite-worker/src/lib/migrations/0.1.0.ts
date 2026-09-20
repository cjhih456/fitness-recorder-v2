import type { MigrationScript } from '../migration';
import { insertFitnessData } from '../schema/fitness';

/**
 * 0.1.0 버전 마이그레이션
 * - Exercise 테이블 컬럼 변경 (exercise -> exercise+1)
 * - Fitness 초기 데이터 삽입
 *
 * 최신 스키마(fitnessId 등)에는 구 컬럼이 없을 수 있으므로 멱등하게 처리한다.
 */
export const migration_0_1_0: MigrationScript = {
  version: 1, // 0.1.0을 숫자로 변환 (간단하게 1로 시작)
  description: 'Initial migration: Exercise column update and Fitness data insertion',
  up: async (worker) => {
    const columns = await worker.query('PRAGMA table_info(exercise)');
    const hasLegacyExerciseColumn = columns.some(
      (row) => String(row['name']) === 'exercise'
    );
    if (hasLegacyExerciseColumn) {
      await worker.exec('UPDATE exercise SET exercise = exercise + 1');
    }

    const countRows = await worker.query(
      'SELECT COUNT(*) AS count FROM fitness'
    );
    const fitnessCount = Number(countRows[0]?.['count'] ?? 0);
    if (fitnessCount === 0) {
      await insertFitnessData(worker);
    }
  },
};
