import type { ExerciseData, ExerciseHistoryData, ExerciseHistoryDBData } from '@fitness-recoder/structure';
import { IExerciesSchema, IHistorySchema } from '@fitness-recoder/structure'

function parseExercise(row: unknown): ExerciseData {
  return IExerciesSchema.parse(row)
}

export const createExerciseByIds: ResponseBuilder<{ fitnessIds: number[] | number }, ExerciseData[]> = async (
  { dbBus },
  { fitnessIds }
) => {
  const temp = Array.isArray(fitnessIds) ? fitnessIds : [fitnessIds]
  const tempQuestion = new Array(temp.length).fill('(?, 0)').join(',')
  const result = await dbBus?.sendTransaction<ExerciseData>(
    'insert',
    `insert into exercise (fitnessId, deps) values ${tempQuestion} RETURNING *`,
    temp
  )
  return (result ?? []).map(parseExercise)
}

export const createExerciseWithExercisePresetRelation: ResponseBuilder<{ exercisePresetId: number, exerciseList: ExerciseData[] }, void> = async (
  { dbBus },
  { exercisePresetId, exerciseList }
) => {
  const temp = Array(exerciseList.length).fill('(?,?)').join(',')
  const bindData = exerciseList.reduce((acc, v) => [...acc, exercisePresetId, v.id], [] as number[])
  await dbBus?.sendTransaction(
    'insert',
    `insert into exercisePreset_exercise (exercisePresetId, exerciseId) values ${temp}`,
    bindData
  )
}

export const createExerciseWithScheduleRelation: ResponseBuilder<{ scheduleId: number, exerciseList: ExerciseData[] }, void> = async (
  { dbBus },
  { scheduleId, exerciseList }
) => {
  const temp = Array(exerciseList.length).fill('(?,?)').join(',')
  const bindData = exerciseList.reduce((acc, v) => [...acc, scheduleId, v.id], [] as number[])
  await dbBus?.sendTransaction(
    'insert',
    `insert into schedule_exercise (scheduleId, exerciseId) values ${temp}`,
    bindData
  )
}

export const getExerciseByIds: ResponseBuilder<{ ids: number[] | number }, ExerciseData[]> = async (
  { dbBus },
  { ids }
) => {
  const temp = Array.isArray(ids) ? ids : [ids]
  const tempQuestion = new Array(temp.length).fill('?').join(',')
  const result = await dbBus?.sendTransaction<ExerciseData>(
    'selects',
    'select * from exercise where id in (' + tempQuestion + ')',
    temp
  )
  return (result ?? []).map(parseExercise)
}

export const getExerciseByExercisePresetId: ResponseBuilder<{ exercisePresetId: number }, ExerciseData[]> = async (
  { dbBus },
  { exercisePresetId }
) => {
  const result = await dbBus?.sendTransaction<ExerciseData>(
    'selects',
    'select * from exercise where id in (select exerciseId from exercisePreset_exercise where exercisePresetId = ?)',
    [exercisePresetId]
  )
  return (result ?? []).map(parseExercise)
}

export const getExerciseByScheduleId: ResponseBuilder<{ scheduleId: number }, ExerciseData[]> = async (
  { dbBus },
  { scheduleId }
) => {
  const result = await dbBus?.sendTransaction<ExerciseData>(
    'selects',
    'select * from exercise where id in (select exerciseId from schedule_exercise where scheduleId = ?)',
    [scheduleId]
  )
  return (result ?? []).map(parseExercise)
}

export const updateExercise: ResponseBuilder<{ id: number, fitnessId: number }, ExerciseData | null> = async (
  { dbBus },
  { id, fitnessId }
) => {
  const result = await dbBus?.sendTransaction<ExerciseData>(
    'update',
    'update exercise set fitnessId = ? where id = ? RETURNING *',
    [fitnessId, id]
  )
  return result?.[0] ? parseExercise(result[0]) : null
}

export const deleteExerciseByIds: ResponseBuilder<{ ids: number[] | number }, string> = async (
  { dbBus },
  { ids }
) => {
  const temp = Array.isArray(ids) ? ids : [ids]
  const tempQuestion = new Array(temp.length).fill('?').join(',')
  await dbBus?.sendTransaction(
    'delete',
    `delete from exercise where id in (${tempQuestion})`,
    temp
  )
  return `delete - exercise - ${temp.join(',')}`
}

export const getExerciseFinishHistory: ResponseBuilder<{ fitnessId: number }, ExerciseHistoryData[]> = async (
  { dbBus },
  { fitnessId }
) => {
  const result = await dbBus?.sendTransaction<ExerciseHistoryDBData>(
    'selects',
    `select
      e.id as id,
      e.fitnessId as fitnessId,
      sch.year,
      sch.month,
      sch.date,
      count(s.id) as cnt,
      SUM(
        CASE WHEN s.isDone > 0 THEN 1 ELSE 0 END
      ) as hasDone,
      group_concat(s.weight, ',') as weights,
      group_concat(s.repeat, ',') as repeats,
      s.weightUnit as weightUnit
    from exercise as e
    inner join 
      sets as s,
      schedule_exercise sche,
      schedule sch
      on
        e.id = s.exerciseId and
        sche.exerciseId = e.id and
        sch.id = sche.scheduleId
    where e.fitnessId=?
    group by s.exerciseId
    having cnt != 0 and hasDone = cnt
    order by e.id
    limit 10`,
    [fitnessId]
  )
  if (!result) return []
  return result.map(v => IHistorySchema.parse(v))
}
