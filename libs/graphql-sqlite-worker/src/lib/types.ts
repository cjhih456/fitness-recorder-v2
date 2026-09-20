/**
 * SQLite Worker 관련 타입 정의
 */
import type { SqlValue } from '@sqlite.org/sqlite-wasm';

/**
 * query/exec만 노출하는 실행기.
 * 브라우저 SQLiteWorker와 Node 시드 생성기가 동일 스키마/시드 로직을 공유한다.
 */
export interface SqlExecutor {
  query(sql: string, params?: unknown[]): Promise<QueryResult>;
  exec(sql: string, params?: unknown[]): Promise<void>;
}

export interface SQLiteWorkerConfig {
  /** 데이터베이스 파일 이름 */
  dbName: string;
  /** 초기화 시 실행할 SQL 스크립트 */
  initScript?: string;
  /** 앱 버전 (예: '1.5.0') */
  appVersion: string;
  /** DB Worker URL */
  dbWorkerUrl: string;
  /** 빌드 시 생성된 시드 DB URL (빈 OPFS에만 import) */
  seedDbUrl?: string;
}

export interface SQLiteWorkerMessage {
  id: string;
  type: 'query' | 'exec' | 'close' | 'init' | 'connect-port';
  payload?: unknown;
}

export interface SQLiteWorkerResponse {
  id: string;
  success: boolean;
  data?: unknown;
  error?: string;
}

export type QueryResult = Record<string, SqlValue>[];

