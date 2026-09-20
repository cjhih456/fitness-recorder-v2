import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { APP_VERSION } from '../src/lib/app-version';
import { initializeDatabase, insertInitialFitnessData } from '../src/lib/init';
import { createSqlJsDatabase, SqlJsExecutor } from './sqljs-executor';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = join(__dirname, '../src/assets/seed.db');

async function main(): Promise<void> {
  const db = await createSqlJsDatabase();
  const executor = new SqlJsExecutor(db);

  await initializeDatabase(executor, { appVersion: APP_VERSION });
  await insertInitialFitnessData(executor);

  db.run('VACUUM');

  const data = db.export();
  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, Buffer.from(data));

  const countRow = db.exec('SELECT COUNT(*) AS count FROM fitness');
  const fitnessCount = Number(countRow[0]?.values[0]?.[0] ?? 0);
  const versionRow = db.exec('SELECT version FROM version ORDER BY id DESC LIMIT 1');
  const version = String(versionRow[0]?.values[0]?.[0] ?? '');

  console.log(
    `[generate-seed-db] wrote ${OUTPUT_PATH} (version=${version}, fitness=${fitnessCount}, bytes=${data.length})`
  );

  db.close();
}

main().catch((error) => {
  console.error('[generate-seed-db] failed:', error);
  process.exit(1);
});
