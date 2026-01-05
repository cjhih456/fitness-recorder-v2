import type { SetData, SetCreateType } from '@fitness-recoder/structure'

export const getSetByIds: ResponseBuilder<{ ids: number[] }, SetData[]> = async (
  { dbBus },
  { ids }
) => {
  const temp = new Array(ids.length).fill('?').join(', ')
  const setList = await dbBus?.sendTransaction<SetData>(
    'selects', `select * from sets where id in (${temp})`,
    ids
  )
  return setList || []
}
export const getSetById: ResponseBuilder<{ id: number }, SetData | null> = async (
  { dbBus },
  { id }
) => {
  const set = await dbBus?.sendTransaction<SetData>(
    'select', 'select * from sets where id=?',
    [id]
  )
  return set[0] || null
}
export const getSetListByExerciseId: ResponseBuilder<{ id: number }, SetData[]> = async (
  { dbBus },
  { id }
) => {
  const setList = await dbBus?.sendTransaction<SetData>(
    'selects', 'select * from sets where exerciseId=?',
    [id]
  )
  return setList || []
}
export const createSet: ResponseBuilder<{ sets: SetCreateType }, SetData | null> = async (
  { dbBus },
  { sets }
) => {
  const result = await dbBus?.sendTransaction<SetData>(
    'insert', 'insert into sets (repeat, isDone, weightUnit, weight, duration, exerciseId) values (?,?,?,?,?,?)',
    [sets.repeat, sets.isDone ? 1 : 0, sets.weightUnit, sets.weight, sets.duration, sets.exerciseId]
  )
  return result ? result[0] : null
}

export const cloneListByExerciseId: ResponseBuilder<{ exerciseId: number, newExerciseId: number }, SetData[]> = async (
  
  { dbBus },
  { exerciseId, newExerciseId }
) => {
  const result = await dbBus?.sendTransaction<SetData>(
    'insert',
    'insert into sets (repeat, isDone, weightUnit, weight, duration, exerciseId) select repeat, 0, weightUnit, weight, duration, ? from sets where exerciseId=?',
    [
      newExerciseId,
      exerciseId
    ]
  )
  return result ? result : []
}

export const updateSet: ResponseBuilder<{ sets: SetData }, SetData | null> = async (
  { dbBus },
  { sets }
) => {
  const result = await dbBus?.sendTransaction<SetData>(
    'update', 'update sets set repeat=?, isDone=?, weightUnit=?, weight=?, duration=? where id=?',
    [sets.repeat, sets.isDone ? 1 : 0, sets.weightUnit, sets.weight, sets.duration, sets.id]
  )
  return result ? result[0] : null
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