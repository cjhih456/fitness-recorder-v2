import type { SQLiteWorkerConfig, SQLiteWorkerMessage, SQLiteWorkerResponse, QueryResult } from './types';
import { initializeDatabase } from './init';
/**
 * OPFS 지원 여부를 확인합니다.
 */
export type { SQLiteWorkerConfig } from './types';


/**
 * SQLite Worker를 초기화하고 관리하는 클래스
 */
export class SQLiteWorker {
  private worker: Worker | null = null;
  private config: SQLiteWorkerConfig;
  private messageHandlers: Map<string, (response: SQLiteWorkerResponse) => void> = new Map();
  private initialized = false;

  constructor(config: SQLiteWorkerConfig) {
    this.config = config;
  }

  /**
   * Worker를 초기화합니다.
   */
  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }
  
    this.worker = new Worker(this.config.dbWorkerUrl, {
      name: 'db-worker',
      type: 'module'
    })

    const initMessageId = this.generateId();
    // 메시지 핸들러 설정
    this.worker.onmessage = (event: MessageEvent<SQLiteWorkerResponse>) => {
      const response = event.data;
      const handler = this.messageHandlers.get(response.id);
      if (handler) {
        handler(response);
        this.messageHandlers.delete(response.id);
      }
    };

    this.worker.onerror = (error) => {
      console.error('SQLite Worker error:', error);
    };
    // 초기화 메시지 전송
    await this.sendMessage({
      id: initMessageId,
      type: 'init',
      payload: {
        dbName: this.config.dbName,
      },
    }).then(async () => {
      await initializeDatabase(this, { appVersion: '1.3.0', insertInitialData: true })
      this.initialized = true;
    });
  }

  /**
   * SQL 쿼리를 실행합니다.
   */
  async query(sql: string, params: unknown[] = []): Promise<QueryResult> {

    return this.sendMessage<QueryResult>({
      id: this.generateId(),
      type: 'query',
      payload: { sql, params },
    });
  }

  /**
   * SQL 명령을 실행합니다 (INSERT, UPDATE, DELETE 등).
   */
  async exec(sql: string, params: unknown[] = []): Promise<void> {

    await this.sendMessage({
      id: this.generateId(),
      type: 'exec',
      payload: { sql, params },
    });
  }

  /**
   * Worker를 종료합니다.
   */
  async close(): Promise<void> {
    if (this.worker) {
      await this.sendMessage({
        id: this.generateId(),
        type: 'close',
      });
      this.worker.terminate();
      this.worker = null;
      this.initialized = false;
    }
  }

  /**
   * Worker에 메시지를 전송하고 응답을 기다립니다.
   */
  private sendMessage<T = unknown>(message: SQLiteWorkerMessage): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        reject(new Error('Worker is not initialized'));
        return;
      }

      const handler = (response: SQLiteWorkerResponse) => {
        if (response.success) {
          resolve(response.data as T);
        } else {
          reject(new Error(response.error || 'Unknown error'));
        }
      };

      this.messageHandlers.set(message.id, handler);
      this.worker.postMessage(message);

      // 타임아웃 설정 (30초)
      setTimeout(() => {
        if (this.messageHandlers.has(message.id)) {
          this.messageHandlers.delete(message.id);
          reject(new Error('Worker message timeout'));
        }
      }, 30000);
    });
  }

  /**
   * 고유 ID를 생성합니다.
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}


