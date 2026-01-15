import type { ExerciseData, ExerciseHistoryData } from '@fitness-recoder/structure'
import type { IResolvers,  } from '@graphql-tools/utils';
import {
  getExerciseByIds,
  getExerciseByScheduleId,
  getExerciseByExercisePresetId,
  createExerciseByIds,
  createExerciseWithScheduleRelation,
  deleteExerciseByIds,
  updateExercise,
  createExerciseWithExercisePresetRelation,
  getExerciseFinishHistory,
} from './repository';
import {
  loadFitnessByExerciseList,
  loadFitnessByExercise,
} from './service';

export default (): IResolvers<unknown, GraphqlContext> => {
  const getExerciseByIdShell: ResponseResolver<{ id: number }, ExerciseData | null> = async (_, { id }, context) => {
    const data = await getExerciseByIds(context, { ids: id })
    if (!data) return null
    return loadFitnessByExercise(context, { exercise: data[0] })
  }
  const getExerciseListByIdsShell: ResponseResolver<{ ids: number[] }, ExerciseData[]> = async (_, { ids }, context) => {
    const result = await getExerciseByIds(context, { ids })
    return await loadFitnessByExerciseList(context, { exerciseList: result })
  }
  const getExerciseListByScheduleIdShell: ResponseResolver<{ scheduleId: number }, ExerciseData[]> = async (_, { scheduleId }, context) => {
    const result = await getExerciseByScheduleId(context, { scheduleId })
    return await loadFitnessByExerciseList(context, { exerciseList: result })
  }
  const getExerciseListByExercisePresetIdShell: ResponseResolver<{ exercisePresetId: number }, ExerciseData[]> = async (_, { exercisePresetId }, context) => {
    const result = await getExerciseByExercisePresetId(context, { exercisePresetId })
    return await loadFitnessByExerciseList(context, { exerciseList: result })
  }
  const getExerciseFinishHistoryShell: ResponseResolver<{ exerciseId: number }, ExerciseHistoryData[]> = async (_, { exerciseId }, context) => {
    return await getExerciseFinishHistory(context, { exerciseId })
  }
  const createExerciseByScheduleShell: ResponseResolver<{
    exercise: {
      scheduleId: number,
      fitnessIds: number[]
    }
  }, ExerciseData[] | null> = async (_, { exercise }, context) => {
    const { scheduleId, fitnessIds } = exercise
    const newExerciseList = await createExerciseByIds(
      context,
      { fitnessIds }
    )
    await createExerciseWithScheduleRelation(
      context,
      { scheduleId, exerciseList: newExerciseList }
    )
    return await loadFitnessByExerciseList(context, { exerciseList: newExerciseList })
  }

  const createExerciseByExercisePresetShell: ResponseResolver<{
    exercise: {
      exercisePresetId: number,
      fitnessIds: number[]
    }
  }, ExerciseData[] | null> = async (_, { exercise }, context) => {
    const { exercisePresetId, fitnessIds } = exercise
    const newExerciseList = await createExerciseByIds(
      context,
      { fitnessIds }
    )
    await createExerciseWithExercisePresetRelation(
      context,
      { exercisePresetId, exerciseList: newExerciseList }
    )
    return await loadFitnessByExerciseList(context, { exerciseList: newExerciseList })
  }

  const updateExerciseShell: ResponseResolver<{ exercise: { id: number, fitnessId: number } }, ExerciseData | null> = async (_, { exercise }, context) => {
    return await updateExercise(context, exercise)
  }
  const deleteExerciseByIdShell: ResponseResolver<{ id: number }, string> = async (_, { id }, context) => {
    return await deleteExerciseByIds(context, { ids: [id] })
  }
  const deleteExerciseByIdsShell: ResponseResolver<{ ids: number[] }, string> = async (_, { ids }, context) => {
    return await deleteExerciseByIds(context, { ids })
  }
  return {
    Query: {
      getExerciseById: getExerciseByIdShell,
      getExerciseListByIds: getExerciseListByIdsShell,
      getExerciseListByScheduleId: getExerciseListByScheduleIdShell,
      getExerciseListByExercisePresetId: getExerciseListByExercisePresetIdShell,
      getExerciseFinishHistory: getExerciseFinishHistoryShell
    },
    Mutation: {
      createExerciseBySchedule: createExerciseByScheduleShell,
      createExerciseByExercisePreset: createExerciseByExercisePresetShell,
      updateExercise: updateExerciseShell,
      deleteExerciseById: deleteExerciseByIdShell,
      deleteExerciseByIds: deleteExerciseByIdsShell
    }
  }
}