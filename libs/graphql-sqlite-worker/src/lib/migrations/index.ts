import type { MigrationScript } from '../migration';
import { migration_0_1_0 } from './0.1.0';
import { migration_1_3_0 } from './1.3.0';
import { migration_1_4_0 } from './1.4.0';
import { migration_1_5_0 } from './1.5.0';

/**
 * 모든 마이그레이션 스크립트를 버전별로 정렬하여 반환합니다.
 */
export function getAllMigrations(): MigrationScript[] {
  const migrations = [migration_0_1_0, migration_1_3_0, migration_1_4_0, migration_1_5_0];
  return [...migrations].sort((a, b) => a.version - b.version);
}
