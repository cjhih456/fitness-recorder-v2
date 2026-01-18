/**
 * SQLite Worker 관련 타입 정의
 */
import type { SqlValue } from '@sqlite.org/sqlite-wasm';
export interface SQLiteWorkerConfig {
  /** 데이터베이스 파일 이름 */
  dbName: string;
  /** 초기화 시 실행할 SQL 스크립트 */
  initScript?: string;
  /** 앱 버전 (예: '1.3.0') */
  appVersion?: string;
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

