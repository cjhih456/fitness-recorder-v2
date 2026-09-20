import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import initSqlJs from 'sql.js';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSqlJsDatabase, SqlJsExecutor } from '../../scripts/sqljs-executor';
import { APP_VERSION } from './app-version';
import { initializeDatabase, insertInitialFitnessData } from './init';
import {
  importSeedDatabase,
  maybeImportSeedDatabase,
  opfsDatabaseExists,
} from './seed-import';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SEED_PATH = join(__dirname, '../assets/seed.db');

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('generate-seed-db output', () => {
  it('creates seed.db with expected version, tables, and fitness rows', async () => {
    expect(existsSync(SEED_PATH)).toBe(true);

    const SQL = await initSqlJs();
    const db = new SQL.Database(readFileSync(SEED_PATH));

    const version = db.exec('SELECT version FROM version ORDER BY id DESC LIMIT 1');
    expect(String(version[0]?.values[0]?.[0])).toBe(APP_VERSION);

    const fitnessCount = Number(
      db.exec('SELECT COUNT(*) FROM fitness')[0]?.values[0]?.[0] ?? 0
    );
    expect(fitnessCount).toBeGreaterThan(0);

    const tables = db
      .exec(
        `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`
      )[0]
      ?.values.map((row) => String(row[0])) ?? [];

    for (const table of [
      'version',
      'fitness',
      'exercise',
      'exercisePreset',
      'exercisePreset_exercise',
      'schedule',
      'schedule_exercise',
      'sets',
    ]) {
      expect(tables).toContain(table);
    }

    const triggers = db
      .exec(`SELECT name FROM sqlite_master WHERE type='trigger'`)[0]
      ?.values.map((row) => String(row[0])) ?? [];
    expect(triggers).toContain('delete_exercises_after_exercisePreset_delete');
    expect(triggers).toContain('delete_exercises_after_schedule_delete');

    db.close();
  });
});

describe('insertInitialFitnessData fallback', () => {
  it('inserts fitness when table is empty', async () => {
    const db = await createSqlJsDatabase();
    const executor = new SqlJsExecutor(db);
    await initializeDatabase(executor, { appVersion: APP_VERSION });

    const before = await executor.query('SELECT COUNT(*) as count FROM fitness');
    expect(before[0]?.['count']).toBe(0);

    await insertInitialFitnessData(executor);

    const after = await executor.query('SELECT COUNT(*) as count FROM fitness');
    expect(Number(after[0]?.['count'])).toBeGreaterThan(0);
    db.close();
  });

  it('skips insert when fitness already has rows', async () => {
    const db = await createSqlJsDatabase();
    const executor = new SqlJsExecutor(db);
    await initializeDatabase(executor, { appVersion: APP_VERSION });
    await insertInitialFitnessData(executor);
    const first = Number(
      (await executor.query('SELECT COUNT(*) as count FROM fitness'))[0]?.['count']
    );

    await insertInitialFitnessData(executor);
    const second = Number(
      (await executor.query('SELECT COUNT(*) as count FROM fitness'))[0]?.['count']
    );
    expect(second).toBe(first);
    db.close();
  });
});

describe('maybeImportSeedDatabase (non-destructive)', () => {
  it('does not import when OPFS file already exists', async () => {
    const getFileHandle = vi.fn().mockResolvedValue({});
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: {
        storage: {
          getDirectory: async () => ({ getFileHandle }),
        },
      },
    });

    const importDb = vi.fn();
    const imported = await maybeImportSeedDatabase(
      { importDb },
      'fitness.db',
      'https://example.com/seed.db'
    );

    expect(imported).toBe(false);
    expect(importDb).not.toHaveBeenCalled();
    expect(getFileHandle).toHaveBeenCalledWith('fitness.db', { create: false });
  });

  it('imports when OPFS file is missing', async () => {
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: {
        storage: {
          getDirectory: async () => ({
            getFileHandle: async () => {
              throw new Error('NotFoundError');
            },
          }),
        },
      },
    });

    const bytes = new Uint8Array([1, 2, 3]);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: async () => bytes.buffer,
      })
    );

    const importDb = vi.fn().mockResolvedValue(bytes.length);
    const imported = await maybeImportSeedDatabase(
      { importDb },
      'fitness.db',
      'https://example.com/seed.db'
    );

    expect(imported).toBe(true);
    expect(importDb).toHaveBeenCalledWith('fitness.db', expect.any(Uint8Array));
  });

  it('opfsDatabaseExists returns false without storage API', async () => {
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: {},
    });
    expect(await opfsDatabaseExists('fitness.db')).toBe(false);
  });

  it('importSeedDatabase returns false on fetch failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 404 })
    );
    const importDb = vi.fn();
    const ok = await importSeedDatabase(
      { importDb },
      'fitness.db',
      'https://example.com/missing.db'
    );
    expect(ok).toBe(false);
    expect(importDb).not.toHaveBeenCalled();
  });
});
