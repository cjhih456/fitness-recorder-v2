import type { ExercisePresetData, ExercisePresetCreateType } from '@fitness-recoder/structure';

export const getExercisePresetWithListById: ResponseBuilder<{ id: number }, ExercisePresetData | null> = async ({ dbBus}, { id }) => {
  if (!dbBus) return null
  const result = await dbBus.sendTransaction<ExercisePresetData>('select', 'select * from exercisePreset where id = ?', [id])
  return result ? result[0] : null
}

export const getExercisePresetWithListByIds: ResponseBuilder<{ ids: number[] }, ExercisePresetData[] | null> = async ({ dbBus}, { ids }) => {
  if (!dbBus) return null
  const temp = new Array(ids.length).fill('?').join(', ')
  const result = await dbBus.sendTransaction<ExercisePresetData>('selects', `select * from exercisePreset where id in (${temp})`, ids)
  return result ?? []
}

export const getExercisePresetWithListByOffset: ResponseBuilder<{ offset: number, size: number }, ExercisePresetData[] | null> = async ({ dbBus}, { offset, size }) => {
  if (!dbBus) return null
  const result = await dbBus.sendTransaction<ExercisePresetData>('selects', 'select * from exercisePreset limit ?, ?', [offset, size])
  return result ?? []
}

export const createExercisePreset: ResponseBuilder<{ exercisePreset: ExercisePresetCreateType }, ExercisePresetData | null> = async ({ dbBus}, { exercisePreset }) => {
  if (!dbBus) return null
  const result = await dbBus.sendTransaction<ExercisePresetData>(
    'insert',
    'insert into exercisePreset (name, deps) values (?, ?)',
    [exercisePreset.name, exercisePreset.deps]
  )
  return result ? result[0] : null
}

export const updateExercisePreset: ResponseBuilder<{ exercisePreset: ExercisePresetData }, ExercisePresetData | null> = async ({ dbBus}, { exercisePreset }) => {
  if (!dbBus) return null
  const result = await dbBus.sendTransaction<ExercisePresetData>(
    'update',
    'update exercisePreset set name = ?, deps = ? where id = ?',
    [exercisePreset.name, exercisePreset.deps, exercisePreset.id]
  )
  return result ? result[0] : null
}

export const deleteExercisePreset: ResponseBuilder<{ id: number }, string | null> = async ({ dbBus}, { id }) => {
  if (!dbBus) return null
  const result = await dbBus.sendTransaction('delete', 'delete from exercisePreset where id = ?', [id])
  return result ? `delete - exercisePreset - ${id}` : null
}
