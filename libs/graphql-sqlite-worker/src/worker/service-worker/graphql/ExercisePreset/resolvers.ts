import type { ExercisePresetWithExerciseList, ExercisePresetCreateType, ExercisePresetData } from '@fitness-recoder/structure';
import type { IResolvers } from '@graphql-tools/utils';
import {
  getExerciseByExercisePresetId
} from '../Exercise/repository';
import { loadFitnessByExerciseList } from '../Exercise/service';
import {
  getExercisePresetWithListById,
  getExercisePresetWithListByIds,
  getExercisePresetWithListByOffset,
  createExercisePreset,
  updateExercisePreset,
  deleteExercisePreset,
} from './repository';
import {
  copyExercisePresetFromSchedule
} from './service';

export default (): IResolvers<unknown, GraphqlContext> => {
  const getExercisePresetWithListByIdShell: ResponseResolver<{ id: number }, ExercisePresetWithExerciseList | null> = async (_, { id }, context) => {
    const result = await getExercisePresetWithListById(context, { id })
    if (!result) return null
    const exerciseList = await getExerciseByExercisePresetId(context, { exercisePresetId: result.id })
    return Object.assign(result, {
      exerciseList: await loadFitnessByExerciseList(context, { exerciseList })
    })
  }
  const getExercisePresetWithListByIdsShell: ResponseResolver<{ ids: number[] }, ExercisePresetWithExerciseList[] | null> = async (_, { ids }, context) => {
    const result = await getExercisePresetWithListByIds(context, { ids })
    if (!result) return null

    return await Promise.all(result.map(async (obj) => {
      const exerciseList = await getExerciseByExercisePresetId(context, { exercisePresetId: obj.id })
      return Object.assign(obj, {
        exerciseList: await loadFitnessByExerciseList(context, { exerciseList })
      })
    }))
  }
  const getExercisePresetWithListByOffsetShell: ResponseResolver<{ offset: number, size: number }, ExercisePresetWithExerciseList[] | null> = async (_, { offset, size }, context) => {
    const result = await getExercisePresetWithListByOffset(context, { offset, size })
    if (!result) return null
    return await Promise.all(result.map(async (obj) => {
      const exerciseList = await getExerciseByExercisePresetId(context, { exercisePresetId: obj.id })
      return Object.assign(obj, {
        exerciseList: await loadFitnessByExerciseList(context, { exerciseList })
      })
    }))
  }
  const createExercisePresetShell: ResponseResolver<{ exercisePreset: ExercisePresetCreateType }, ExercisePresetWithExerciseList | null> = async (_, { exercisePreset }, context) => {
    const result = await createExercisePreset(context, { exercisePreset })
    if (!result) return null
    return Object.assign(result, {
      exerciseList: await getExerciseByExercisePresetId(context, { exercisePresetId: result.id })
    })
  }
  const updateExercisePresetShell: ResponseResolver<{ exercisePreset: ExercisePresetData }, ExercisePresetWithExerciseList | null> = async (_, { exercisePreset }, context) => {
    const result = await updateExercisePreset(context, { exercisePreset })
    if (!result) return null
    return Object.assign(result, {
      exerciseList: await getExerciseByExercisePresetId(context, { exercisePresetId: result.id })
    })
  }
  const deleteExercisePresetShell: ResponseResolver<{ id: number }, string | null> = async (_, { id }, context) => {
    return deleteExercisePreset(context, { id })
  }
  const copyExercisePresetFromScheduleShell: ResponseResolver<{ scheduleId: number, name: string }, ExercisePresetWithExerciseList | null> = async (_, { scheduleId, name }, context) => {
    const result = await copyExercisePresetFromSchedule(context, { scheduleId, name })
    if (!result) return null
    return Object.assign(result, {
      exerciseList: await getExerciseByExercisePresetId(context, { exercisePresetId: result.id })
    })
  }
  return {
    Query: {
      getExercisePresetWithListById: getExercisePresetWithListByIdShell,
      getExercisePresetWithListByIds: getExercisePresetWithListByIdsShell,
      getExercisePresetWithListByOffset: getExercisePresetWithListByOffsetShell,
    },
    Mutation: {
      createExercisePreset: createExercisePresetShell,
      updateExercisePreset: updateExercisePresetShell,
      deleteExercisePreset: deleteExercisePresetShell,
      copyExercisePresetFromSchedule: copyExercisePresetFromScheduleShell,
    }
  }
}
