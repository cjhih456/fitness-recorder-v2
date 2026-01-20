import type { SQLiteWorker } from './sqlite-worker';
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
import { isNewVersion } from './version';

/**
 * 데이터베이스 초기화 옵션
 */
export interface DatabaseInitOptions {
  /** 앱 버전 (예: '1.3.0') */
  appVersion: string;
}

/**
 * 데이터베이스를 초기화합니다.
 * - 모든 테이블 생성
 * - 버전 확인 및 마이그레이션 실행
 * - Fitness 초기 데이터 삽입 (데이터가 없을 경우)
 */
export async function initializeDatabase(
  worker: SQLiteWorker,
  options: DatabaseInitOptions
): Promise<void> {
  const { appVersion } = options;

  // 1. Version 테이블 생성
  await createVersionTable(worker);

  // 2. 현재 버전 확인
  const currentVersion = await getVersion(worker);

  // 3. 버전이 없으면 초기 버전 설정
  if (!currentVersion) {
    await updateVersion(worker, appVersion);
  }

  // 4. 모든 테이블 생성
  await createExerciseTable(worker);
  await createExercisePresetTable(worker);
  await createFitnessTable(worker);
  await createScheduleTable(worker);
  await createSetTable(worker);

  // 5. 마이그레이션 실행 (버전이 다른 경우)
  if (currentVersion && currentVersion !== appVersion) {
    const migrations = getAllMigrations();
    const migrationManager = new MigrationManager(worker);
    
    // 현재 버전보다 높은 버전의 마이그레이션만 필터링
    const applicableMigrations = migrations.filter((migration) => {
      // 마이그레이션 버전을 문자열로 변환 (간단한 변환)
      const migrationVersion = migration.version.toString();
      return isNewVersion(currentVersion, migrationVersion);
    });

    if (applicableMigrations.length > 0) {
      await migrationManager.migrate(applicableMigrations);
      await updateVersion(worker, appVersion);
    }
  }
}

/**
 * Fitness 초기 데이터를 삽입합니다. 자동으로 실행됩니다.
 * @param worker SQLiteWorker
 */
export async function insertInitialFitnessData(worker: SQLiteWorker): Promise<void> {
  const fitnessDataCount = await checkFitnessDataLength(worker);
  if (fitnessDataCount === 0) {
    await insertFitnessData(worker);
  }
}