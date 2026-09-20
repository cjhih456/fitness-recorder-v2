import type { SqlExecutor } from './types';
import { MigrationManager } from './migration';
import { getAllMigrations } from './migrations';
import {
  createVersionTable,
  createExerciseTable,
  createExercisePresetTable,
  createFitnessTable,
  createScheduleTable,
  createSetTable,
  checkFitnessDataLength,
  insertFitnessData,
  updateVersion,
  getVersion
} from './schema';

/**
 * 데이터베이스 초기화 옵션
 */
export interface DatabaseInitOptions {
  /** 앱 버전 (예: '1.5.0') */
  appVersion: string;
}

/**
 * 데이터베이스를 초기화합니다.
 * - 모든 테이블 생성
 * - 버전 확인 및 마이그레이션 실행
 * - Fitness 초기 데이터 삽입 (데이터가 없을 경우)
 */
export async function initializeDatabase(
  executor: SqlExecutor,
  options: DatabaseInitOptions
): Promise<void> {
  const { appVersion } = options;

  // 1. Version 테이블 생성
  await createVersionTable(executor);

  // 2. 현재 버전 확인
  const currentVersion = await getVersion(executor);

  // 3. 버전이 없으면 초기 버전 설정
  if (!currentVersion) {
    await updateVersion(executor, appVersion);
  }

  // 4. 모든 테이블 생성
  await createExerciseTable(executor);
  await createExercisePresetTable(executor);
  await createFitnessTable(executor);
  await createScheduleTable(executor);
  await createSetTable(executor);

  // 5. 마이그레이션 실행 (버전이 다른 경우)
  // MigrationManager가 _migrations 기준으로 이미 적용된 버전을 스킵한다.
  // appVersion(semver)과 migration.version(숫자)을 version-sort로 비교하면 누락이 생기므로 필터하지 않는다.
  if (currentVersion && currentVersion !== appVersion) {
    const migrations = getAllMigrations();
    const migrationManager = new MigrationManager(executor);
    await migrationManager.migrate(migrations);
    await updateVersion(executor, appVersion);
  }
}

/**
 * Fitness 초기 데이터를 삽입합니다. 자동으로 실행됩니다.
 * 시드 DB import 성공 시 COUNT > 0이라 INSERT를 건너뛴다 (fallback).
 * @param executor SqlExecutor
 */
export async function insertInitialFitnessData(executor: SqlExecutor): Promise<void> {
  const fitnessDataCount = await checkFitnessDataLength(executor);
  if (fitnessDataCount === 0) {
    await insertFitnessData(executor);
  }
}