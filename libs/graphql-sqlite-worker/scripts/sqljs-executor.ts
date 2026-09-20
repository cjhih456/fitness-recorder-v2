import initSqlJs, { type Database, type SqlValue as SqlJsValue } from 'sql.js';
import type { QueryResult, SqlExecutor } from '../src/lib/types';

/**
 * sql.js 기반 SqlExecutor. 시드 DB 생성 스크립트 전용.
 */
export class SqlJsExecutor implements SqlExecutor {
  constructor(private readonly db: Database) {}

  async query(sql: string, params: unknown[] = []): Promise<QueryResult> {
    const stmt = this.db.prepare(sql);
    try {
      if (params.length > 0) {
        stmt.bind(params as SqlJsValue[]);
      }
      const rows: QueryResult = [];
      while (stmt.step()) {
        rows.push(stmt.getAsObject() as QueryResult[number]);
      }
      return rows;
    } finally {
      stmt.free();
    }
  }

  async exec(sql: string, params: unknown[] = []): Promise<void> {
    if (params.length === 0) {
      this.db.run(sql);
      return;
    }
    this.db.run(sql, params as SqlJsValue[]);
  }
}

export async function createSqlJsDatabase(): Promise<Database> {
  const SQL = await initSqlJs();
  return new SQL.Database();
}
