import type { SQLiteWorker } from './sqlite-worker';

/**
 * 마이그레이션 스크립트 인터페이스
 */
export interface MigrationScript {
  version: number;
  up?: string | ((worker: SQLiteWorker) => Promise<void>); // 마이그레이션 SQL 또는 함수
  down?: string | ((worker: SQLiteWorker) => Promise<void>); // 롤백 SQL 또는 함수 (선택사항)
  description?: string;
}

/**
 * 마이그레이션 히스토리 레코드
 */
export interface MigrationHistory {
  version: number;
  applied_at: string;
  description?: string;
}

/**
 * 마이그레이션 관리 클래스
 */
export class MigrationManager {
  private worker: SQLiteWorker;
  private migrationsTable = '_migrations';

  constructor(worker: SQLiteWorker) {
    this.worker = worker;
  }

  /**
   * 마이그레이션 테이블을 초기화합니다.
   */
  async initMigrationTable(): Promise<void> {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS ${this.migrationsTable} (
        version INTEGER PRIMARY KEY,
        applied_at TEXT NOT NULL DEFAULT (datetime('now')),
        up TEXT,
        down TEXT,
        description TEXT
      )
    `;
    await this.worker.exec(createTableSQL);
  }

  /**
   * 적용된 마이그레이션 버전 목록을 가져옵니다.
   */
  async getAppliedMigrations(): Promise<MigrationHistory[]> {
    await this.initMigrationTable();
    const result = await this.worker.query(
      `SELECT version, applied_at, description FROM ${this.migrationsTable} ORDER BY version ASC`
    );

    return result.map((row) => ({
      version: row['version'] as number,
      applied_at: row['applied_at'] as string,
      description: (row['description'] as string) || undefined,
    }));
  }

  /**
   * 현재 데이터베이스 버전을 가져옵니다.
   */
  async getCurrentVersion(): Promise<number> {
    const migrations = await this.getAppliedMigrations();
    if (migrations.length === 0) {
      return 0;
    }
    return Math.max(...migrations.map((m) => m.version));
  }

  /**
   * 마이그레이션을 실행합니다.
   */
  async migrate(migrations: MigrationScript[]): Promise<void> {
    await this.initMigrationTable();
    const appliedMigrations = await this.getAppliedMigrations();
    const appliedVersions = new Set(appliedMigrations.map((m) => m.version));

    // 정렬된 마이그레이션 목록
    const sortedMigrations = [...migrations].sort((a, b) => a.version - b.version);

    for (const migration of sortedMigrations) {
      if (appliedVersions.has(migration.version)) {
        continue; // 이미 적용된 마이그레이션은 스킵
      }

      try {
        // 트랜잭션 시작
        await this.worker.exec('BEGIN TRANSACTION');
        // 마이그레이션 실행
        if (migration.up) {
          if (typeof migration.up === 'string') {
            await this.worker.exec(migration.up);
          } else {
            await migration.up(this.worker);
          }
        }
        // 마이그레이션 히스토리 기록
        await this.worker.exec(
          `INSERT INTO ${this.migrationsTable} (version, description) VALUES (?, ?)`,
          [migration.version, migration.description || '']
        );

        // 트랜잭션 커밋
        await this.worker.exec('COMMIT');
      } catch (error) {
        // 롤백
        await this.worker.exec('ROLLBACK');
        throw new Error(
          `Migration ${migration.version} failed: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  }

  /**
   * 마이그레이션을 롤백합니다.
   */
  async rollback(targetVersion: number): Promise<void> {
    await this.initMigrationTable();
    const appliedMigrations = await this.getAppliedMigrations();
    const currentVersion = await this.getCurrentVersion();

    if (targetVersion >= currentVersion) {
      throw new Error(`Cannot rollback to version ${targetVersion}. Current version is ${currentVersion}`);
    }

    // 역순으로 정렬 (최신 버전부터 롤백)
    const migrationsToRollback = appliedMigrations
      .filter((m) => m.version > targetVersion)
      .sort((a, b) => b.version - a.version);

    // 롤백할 마이그레이션 스크립트가 필요하므로, 이는 외부에서 제공되어야 합니다.
    // 여기서는 히스토리만 삭제하는 것으로 처리합니다.
    for (const migration of migrationsToRollback) {
      try {
        await this.worker.exec('BEGIN TRANSACTION');
        // 롤백 SQL이 있으면 실행 (실제 구현에서는 마이그레이션 스크립트 객체가 필요)
        await this.worker.exec(
          `DELETE FROM ${this.migrationsTable} WHERE version = ?`,
          [migration.version]
        );
        await this.worker.exec('COMMIT');
      } catch (error) {
        await this.worker.exec('ROLLBACK');
        throw new Error(
          `Rollback failed for version ${migration.version}: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }
  }

  /**
   * 특정 버전의 마이그레이션을 롤백합니다 (down 스크립트 사용).
   */
  async rollbackMigration(migration: MigrationScript): Promise<void> {
    if (!migration.down) {
      throw new Error(`Migration ${migration.version} does not have a rollback script`);
    }

    await this.initMigrationTable();
    const appliedMigrations = await this.getAppliedMigrations();
    const isApplied = appliedMigrations.some((m) => m.version === migration.version);

    if (!isApplied) {
      throw new Error(`Migration ${migration.version} is not applied`);
    }

    try {
      await this.worker.exec('BEGIN TRANSACTION');
      if (typeof migration.down === 'string') {
        await this.worker.exec(migration.down);
      } else if (migration.down) {
        await migration.down(this.worker);
      }
      await this.worker.exec(`DELETE FROM ${this.migrationsTable} WHERE version = ?`, [
        migration.version,
      ]);
      await this.worker.exec('COMMIT');
    } catch (error) {
      await this.worker.exec('ROLLBACK');
      throw new Error(
        `Rollback failed for version ${migration.version}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 마이그레이션 상태를 확인합니다.
   */
  async getMigrationStatus(migrations: MigrationScript[]): Promise<{
    currentVersion: number;
    targetVersion: number;
    pending: MigrationScript[];
    applied: MigrationScript[];
  }> {
    const currentVersion = await this.getCurrentVersion();
    const appliedMigrations = await this.getAppliedMigrations();
    const appliedVersions = new Set(appliedMigrations.map((m) => m.version));

    const sortedMigrations = [...migrations].sort((a, b) => a.version - b.version);
    const targetVersion =
      sortedMigrations.length > 0
        ? Math.max(...sortedMigrations.map((m) => m.version))
        : currentVersion;

    const pending = sortedMigrations.filter((m) => !appliedVersions.has(m.version));
    const applied = sortedMigrations.filter((m) => appliedVersions.has(m.version));

    return {
      currentVersion,
      targetVersion,
      pending,
      applied,
    };
  }
}


