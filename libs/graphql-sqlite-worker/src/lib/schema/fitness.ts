import type { SQLiteWorker } from '../sqlite-worker';

/**
 * fitness 테이블을 생성합니다.
 */
export async function createFitnessTable(worker: SQLiteWorker): Promise<void> {
  await worker.exec(`
    CREATE TABLE IF NOT EXISTS fitness (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      aliases TEXT CHECK( json_valid(aliases) AND json_type(aliases) = 'array' ),
      primaryMuscles TEXT CHECK( json_valid(primaryMuscles) AND json_type(primaryMuscles) = 'array' ),
      secondaryMuscles TEXT CHECK( json_valid(secondaryMuscles) AND json_type(secondaryMuscles) = 'array' ),
      totalUseMuscles TEXT CHECK( json_valid(totalUseMuscles) AND json_type(totalUseMuscles) = 'array' ),
      force TEXT CHECK( force IN (NULL, 'pull','push','static') ),
      level TEXT CHECK( level IN ('beginner','intermediate','expert') ) NOT NULL,
      mechanic TEXT CHECK( mechanic IN (NULL, 'compound','isolation') ),
      equipment TEXT CHECK( equipment IN (NULL, 'body_only','machine','kettlebells','dumbbell','cable','barbell','bands','medicine_ball','exercise_ball','e-z_curl_bar','foam_roll') ),
      category TEXT CHECK( category IN ('strength','stretching','plyometrics','strongman','powerlifting','cardio','olympic_weightlifting','crossfit','weighted_bodyweight','assisted_bodyweight') ) NOT NULL,
      instructions TEXT CHECK( json_valid(instructions) AND json_type(instructions) = 'array' ) NOT NULL,
      description TEXT,
      tips TEXT CHECK( json_valid(tips) AND json_type(tips) = 'array' )
    )
  `);
}

/**
 * fitness 테이블의 데이터 개수를 확인합니다.
 */
export async function checkFitnessDataLength(worker: SQLiteWorker): Promise<number> {
  const result = await worker.query('SELECT COUNT(*) as count FROM fitness');
  return result.length > 0 ? (result[0]['count'] as number) : 0;
}

/**
 * fitness 초기 데이터를 삽입합니다.
 */
export async function insertFitnessData(worker: SQLiteWorker): Promise<void> {
  const { fitnessData } = await import('../fitness-datas/fitness-flat-data');
  
  if (!fitnessData || fitnessData.length === 0) {
    return;
  }

  const placeholders = Array(13).fill('(?,?,?,?,?,?,?,?,?,?,?,?,?)').join(',');
  const sql = `
    INSERT INTO fitness (
      name,
      aliases,
      primaryMuscles,
      secondaryMuscles,
      totalUseMuscles,
      force,
      level,
      mechanic,
      equipment,
      category,
      instructions,
      description,
      tips
    ) VALUES ${placeholders}
  `;
  
  await worker.exec(sql, fitnessData);
}
