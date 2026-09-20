/**
 * SQLite DB Worker
 * 실제 Worker 코드는 sqlite-worker.ts에서 동적으로 생성됩니다.
 * 이 파일은 참조용입니다.
 */


import type { BindingSpec, Database } from '@sqlite.org/sqlite-wasm';
import Sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import sqlite3WasmUrl from '@sqlite.org/sqlite-wasm/sqlite3.wasm?url';

type Sqlite3InitModuleState = {
  wasmFilename?: string;
};

/**
 * sqlite-wasm 3.51+는 locateFile을 `new URL(filename, import.meta.url)`로 덮어씁니다.
 * Vite가 worker를 재작성하면 그 기준 URL이 앱 루트가 되어 `/sqlite3.wasm`을 HTML로 받게 됩니다.
 * 패키지 WASM URL을 절대 경로로 넘기면 locateFile이 올바른 application/wasm 응답을 받습니다.
 */
const sqlite3InitModuleState = (
  globalThis as typeof globalThis & {
    sqlite3InitModuleState?: Sqlite3InitModuleState;
  }
).sqlite3InitModuleState;
if (sqlite3InitModuleState) {
  sqlite3InitModuleState.wasmFilename = sqlite3WasmUrl;
}

let db: Database | null = null;
const broadcastChannel = new BroadcastChannel('graphql-sqlite-worker');
declare const self: Worker
interface WorkerMessage {
  id: string;
  type: string;
  payload?: {
    dbName?: string;
    initScript?: string;
    sql?: string;
    params?: BindingSpec;
  };
}

interface WorkerResponse {
  id: string;
  success: boolean;
  data?: unknown;
  error?: string;
}

/**
 * 메시지를 처리하고 응답을 전송합니다.
 */
async function handleMessage(
  message: WorkerMessage,
  postMessage: (response: WorkerResponse) => void
): Promise<void> {
  try {
    switch (message.type) {
      case 'init':
        await handleInit(message.payload as { dbName: string; });
        postMessage({ id: message.id, success: true });
        break;
      case 'query': {
        const queryResult = await handleQuery(message.payload as { sql: string; params: BindingSpec });
        postMessage({ id: message.id, success: true, data: queryResult });
        break;
      }
      case 'exec': {
        const execResult = await handleExec(message.payload as { sql: string; params: BindingSpec });
        postMessage({ id: message.id, success: true, data: execResult });
        break;
      }
      case 'insert':
      case 'update':
      case 'delete': {
        const execResult = await handleExec(message.payload as { sql: string; params: BindingSpec });
        // RETURNING * 결과 반환
        postMessage({ id: message.id, success: true, data: execResult });
        break;
      }
      case 'select': {
        const queryResult = await handleQuery(message.payload as { sql: string; params: BindingSpec });
        // 단일 결과 반환
        postMessage({ id: message.id, success: true, data: queryResult && queryResult.length > 0 ? queryResult[0] : null });
        break;
      }
      case 'selects': {
        const queryResult = await handleQuery(message.payload as { sql: string; params: BindingSpec });
        // 배열 결과 반환
        postMessage({ id: message.id, success: true, data: queryResult || [] });
        break;
      }
      case 'close':
        await handleClose();
        postMessage({ id: message.id, success: true });
        break;
      default:
        postMessage({
          id: message.id,
          success: false,
          error: `Unknown message type: ${message.type}`,
        });
    }
  } catch (error) {
    postMessage({
      id: message.id,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

broadcastChannel.onmessage = async (event: MessageEvent) => {
  await handleMessage(event.data, (response) => {
    broadcastChannel.postMessage(response);
  });
};

self.onmessage = async (event: MessageEvent) => {
  await handleMessage(event.data, (response) => {
    self.postMessage(response);
  });
};

async function handleInit(payload: {
  dbName: string;
}) {
  const initState = (
    globalThis as typeof globalThis & {
      sqlite3InitModuleState?: Sqlite3InitModuleState;
    }
  ).sqlite3InitModuleState;
  if (initState) {
    initState.wasmFilename = sqlite3WasmUrl;
  }

  const sqlite3Module = await Sqlite3InitModule({
    print: console.log,
    printErr: console.error
  })
  const dbName = payload.dbName || 'worker.sqlite3'
  db = sqlite3Module.oo1.OpfsDb
    ? new sqlite3Module.oo1.OpfsDb(dbName)
    : new sqlite3Module.oo1.DB(dbName, 'c')
}

async function handleQuery(payload: { sql: string; params: BindingSpec }) {
  if(!db) {
    throw new Error('Database not initialized');
  }
  const stmt = db.selectObjects(payload.sql, payload.params);

  return stmt;
}

async function handleExec(payload: { sql: string; params: BindingSpec }) {
  if(!db) {
    throw new Error('Database not initialized');
  }
  return db.exec(payload.sql, { bind: payload.params, returnValue: 'resultRows', rowMode: 'object'});
}

async function handleClose() {
  if (db) {
    db.close();
    db = null;
  }
}

