import type { MigrationScript } from '../migration';
import { insertFitnessData } from '../schema/fitness';

/**
 * 0.1.0 버전 마이그레이션
 * - Exercise 테이블 컬럼 변경 (exercise -> exercise+1)
 * - Fitness 초기 데이터 삽입
 */
export const migration_0_1_0: MigrationScript = {
  version: 1, // 0.1.0을 숫자로 변환 (간단하게 1로 시작)
  description: 'Initial migration: Exercise column update and Fitness data insertion',
  up: async (worker) => {
    // Exercise 컬럼 업데이트
    await worker.exec('UPDATE exercise SET exercise = exercise + 1');
    
    // Fitness 데이터 삽입
    await insertFitnessData(worker);
  },
};
