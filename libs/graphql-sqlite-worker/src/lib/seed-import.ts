/**
 * 빈 OPFS에 빌드 시드 DB를 심기 위한 헬퍼.
 * db-worker와 단위 테스트에서 공유한다.
 */

export type OpfsImportDb = {
  importDb: (filename: string, data: Uint8Array) => Promise<number>;
};

/**
 * OPFS에 대상 DB 파일이 이미 있는지 확인합니다.
 */
export async function opfsDatabaseExists(dbName: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.storage?.getDirectory) {
    return false;
  }
  try {
    const root = await navigator.storage.getDirectory();
    await root.getFileHandle(dbName, { create: false });
    return true;
  } catch {
    return false;
  }
}

/**
 * 시드 DB를 fetch 후 OPFS에 import합니다. 성공 시 true.
 * 기존 파일이 있을 때는 호출하지 않는 것이 호출자의 책임이다.
 */
export async function importSeedDatabase(
  OpfsDb: OpfsImportDb,
  dbName: string,
  seedDbUrl: string
): Promise<boolean> {
  try {
    const response = await fetch(seedDbUrl);
    if (!response.ok) {
      console.warn(`[db-worker] seed fetch failed: ${response.status} ${seedDbUrl}`);
      return false;
    }
    const buffer = await response.arrayBuffer();
    await OpfsDb.importDb(dbName, new Uint8Array(buffer));
    return true;
  } catch (error) {
    console.warn('[db-worker] seed import failed, falling back to empty DB:', error);
    return false;
  }
}

/**
 * OPFS가 비어 있을 때만 시드를 import한다. 기존 DB는 절대 덮어쓰지 않는다.
 * @returns import를 시도했고 성공했으면 true
 */
export async function maybeImportSeedDatabase(
  OpfsDb: OpfsImportDb,
  dbName: string,
  seedDbUrl: string | undefined
): Promise<boolean> {
  if (!seedDbUrl) {
    return false;
  }
  const exists = await opfsDatabaseExists(dbName);
  if (exists) {
    return false;
  }
  return importSeedDatabase(OpfsDb, dbName, seedDbUrl);
}
