import type { MigrationScript } from '../migration';
import sort from 'version-sort';
import { migration_0_1_0 } from './0.1.0';
import { migration_1_3_0 } from './1.3.0';

/**
 * 모든 마이그레이션 스크립트를 버전별로 정렬하여 반환합니다.
 */
export function getAllMigrations(): MigrationScript[] {
  const migrations = [migration_0_1_0, migration_1_3_0];
  // 버전별로 정렬 (version 숫자 기준)
  return sort(migrations, { ignore_stages: true, nested: false });
}
