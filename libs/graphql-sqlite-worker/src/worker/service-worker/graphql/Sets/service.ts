import type { SetData, SetCreateType } from '@fitness-recoder/structure'
import { SetSchema } from '@fitness-recoder/structure'

function parseSet(row: unknown): SetData {
  return SetSchema.parse(row)
}

export const getSetByIds: ResponseBuilder<{ ids: number[] }, SetData[]> = async (
  { dbBus },
  { ids }
) => {
  const temp = new Array(ids.length).fill('?').join(', ')
  const setList = await dbBus?.sendTransaction<SetData>(
    'selects', `select * from sets where id in (${temp})`,
    ids
  )
  return (setList || []).map(parseSet)
}
export const getSetById: ResponseBuilder<{ id: number }, SetData | null> = async (
  { dbBus },
  { id }
) => {
  const set = await dbBus?.sendTransaction<SetData>(
    'select', 'select * from sets where id=?',
    [id]
  )
  return set?.[0] ? parseSet(set[0]) : null
}
export const getSetListByExerciseId: ResponseBuilder<{ id: number, offset?: number, size?: number }, SetData[]> = async (
  { dbBus },
  { id, offset, size }
) => {
  const hasPaging = size !== undefined
  const setList = await dbBus?.sendTransaction<SetData>(
    'selects',
    hasPaging
      ? 'select * from sets where exerciseId=? order by id limit ?, ?'
      : 'select * from sets where exerciseId=?',
    hasPaging ? [id, offset ?? 0, size] : [id]
  )
  return (setList || []).map(parseSet)
}
export const createSet: ResponseBuilder<{ sets: SetCreateType }, SetData | null> = async (
  { dbBus },
  { sets }
) => {
  const result = await dbBus?.sendTransaction<SetData>(
    'insert', 'insert into sets (repeat, isDone, weightUnit, weight, duration, exerciseId) values (?,?,?,?,?,?) RETURNING *',
    [sets.repeat, sets.isDone ? 1 : 0, sets.weightUnit, sets.weight, sets.duration, sets.exerciseId]
  )
  return result?.[0] ? parseSet(result[0]) : null
}

export const cloneListByExerciseId: ResponseBuilder<{ exerciseId: number, newExerciseId: number }, SetData[]> = async (
  
  { dbBus },
  { exerciseId, newExerciseId }
) => {
  const result = await dbBus?.sendTransaction<SetData>(
    'insert',
    'insert into sets (repeat, isDone, weightUnit, weight, duration, exerciseId) select repeat, 0, weightUnit, weight, duration, ? from sets where exerciseId=? RETURNING *',
    [
      newExerciseId,
      exerciseId
    ]
  )
  return (result ?? []).map(parseSet)
}

export const updateSet: ResponseBuilder<{ sets: SetData }, SetData | null> = async (
  { dbBus },
  { sets }
) => {
  const result = await dbBus?.sendTransaction<SetData>(
    'update', 'update sets set repeat=?, isDone=?, weightUnit=?, weight=?, duration=? where id=? RETURNING *',
    [sets.repeat, sets.isDone ? 1 : 0, sets.weightUnit, sets.weight, sets.duration, sets.id]
  )
  return result?.[0] ? parseSet(result[0]) : null
}
export const deleteSetById: ResponseBuilder<{ id: number }, string | null> = async (
  { dbBus },
  { id }
) => {
  const result = await dbBus?.sendTransaction<SetData>(
    'delete', 'delete from sets where id=?',
    [id]
  )
  return result ? `delete - sets - ${id}` : null
}
