import type { SQLiteWorkerConfig, SQLiteWorkerMessage, SQLiteWorkerResponse, QueryResult, OPFSSupport } from './types';
import DBWorker from '../worker/db-worker.worker.ts?worker';
/**
 * OPFS 지원 여부를 확인합니다.
 */
export type { SQLiteWorkerConfig } from './types';

export async function checkOPFSSupport(): Promise<OPFSSupport> {
  if (
    typeof navigator !== 'undefined' &&
    'storage' in navigator &&
    'getDirectory' in navigator.storage
  ) {
    try {
      const directory = await navigator.storage.getDirectory();
      return {
        supported: true,
        directory,
      };
    } catch (error) {
      console.warn('OPFS is not available:', error);
      return { supported: false };
    }
  }
  return { supported: false };
}

/**
 * SQLite Worker를 초기화하고 관리하는 클래스
 */
export class SQLiteWorker {
  private worker: Worker | null = null;
  private config: SQLiteWorkerConfig;
  private messageHandlers: Map<string, (response: SQLiteWorkerResponse) => void> = new Map();
  private opfsSupport: OPFSSupport | null = null;
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

    // OPFS 지원 확인
    this.opfsSupport = await checkOPFSSupport();
    const useOPFS = this.config.useOPFS ?? this.opfsSupport.supported;

    this.worker = new DBWorker()

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
      id: this.generateId(),
      type: 'init',
      payload: {
        dbName: this.config.dbName,
        useOPFS,
        initScript: this.config.initScript,
      },
    });

    this.initialized = true;
  }

  /**
   * SQL 쿼리를 실행합니다.
   */
  async query(sql: string, params: unknown[] = []): Promise<QueryResult> {
    if (!this.initialized) {
      await this.init();
    }

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
    if (!this.initialized) {
      await this.init();
    }

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
   * OPFS 지원 여부를 반환합니다.
   */
  getOPFSSupport(): OPFSSupport | null {
    return this.opfsSupport;
  }

  /**
   * Service Worker와 DB Worker 간 통신을 위한 MessageChannel을 생성합니다.
   * @returns Service Worker에 전달할 MessagePort
   */
  async createMessageChannel(): Promise<MessagePort> {
    if (!this.initialized) {
      await this.init();
    }

    if (!this.worker) {
      throw new Error('Worker is not initialized');
    }

    const channel = new MessageChannel();
    const port1 = channel.port1;
    const port2 = channel.port2;

    // DB Worker에 port2 전달
    this.worker.postMessage(
      {
        id: this.generateId(),
        type: 'connect-port',
        payload: { port: port2 },
      },
      [port2]
    );

    return port1;
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


