/**
 * SQLite DB Worker
 * 실제 Worker 코드는 sqlite-worker.ts에서 동적으로 생성됩니다.
 * 이 파일은 참조용입니다.
 */


import Sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import type { BindingSpec, Database } from '@sqlite.org/sqlite-wasm';
let db: Database | null = null;
let useOPFS = false;

self.onmessage = async (event: MessageEvent) => {
  const message = event.data;

  try {
    switch (message.type) {
      case 'init':
        await handleInit(message.payload);
        self.postMessage({ id: message.id, success: true });
        break;
      case 'query': {
        const queryResult = await handleQuery(message.payload);
        self.postMessage({ id: message.id, success: true, data: queryResult });
        break;
      }
      case 'exec':
        await handleExec(message.payload);
        self.postMessage({ id: message.id, success: true });
        break;
      case 'close':
        await handleClose();
        self.postMessage({ id: message.id, success: true });
        break;
      default:
        self.postMessage({
          id: message.id,
          success: false,
          error: `Unknown message type: ${message.type}`,
        });
    }
  } catch (error) {
    self.postMessage({
      id: message.id,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

async function handleInit(payload: {
  dbName: string;
  useOPFS: boolean;
  initScript?: string;
}) {
  useOPFS = payload.useOPFS;
  const sqlite3 = await Sqlite3InitModule();

  if (useOPFS && 'getDirectory' in navigator.storage) {
    // const directory = await navigator.storage.getDirectory();
    // const dbFile = await directory.getFileHandle(payload.dbName, { create: true });
    // const dbAccessHandle = await dbFile.createSyncAccessHandle();
    db = new sqlite3.oo1.OpfsDb(payload.dbName);
  } else {
    db = new sqlite3.oo1.DB(payload.dbName);
  }

  if (payload.initScript) {
    db.exec(payload.initScript);
  }
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
  db.exec(payload.sql, { bind: payload.params });
}

async function handleClose() {
  if (db) {
    db.close();
    db = null;
  }
}

