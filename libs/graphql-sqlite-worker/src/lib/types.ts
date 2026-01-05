/**
 * SQLite Worker 관련 타입 정의
 */
import type { SqlValue } from '@sqlite.org/sqlite-wasm';
export interface SQLiteWorkerConfig {
  /** 데이터베이스 파일 이름 */
  dbName: string;
  /** OPFS 사용 여부 (자동 감지되지만 강제 설정 가능) */
  useOPFS?: boolean;
  /** 초기화 시 실행할 SQL 스크립트 */
  initScript?: string;
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

export interface OPFSSupport {
  supported: boolean;
  directory?: FileSystemDirectoryHandle;
}


