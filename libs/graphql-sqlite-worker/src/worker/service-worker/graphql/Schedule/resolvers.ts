import type { ScheduleCreateType, ScheduleData } from '@fitness-recoder/structure';
import type { IResolvers } from '@graphql-tools/utils';
import { getExerciseByScheduleId, createExerciseWithScheduleRelation, getExerciseByExercisePresetId } from '../Exercise/repository';
import { cloneExerciseList } from '../Exercise/service';
import {
  createSchedule,
  deleteSchedule,
  getScheduleByDate,
  getScheduleById,
  getScheduleStatusByMonth,
  updateSchedule
} from './repository';

export default (): IResolvers<unknown, GraphqlContext> => {
  const getScheduleByIdShell: ResponseResolver<{ id: number }, ScheduleData | null> = async (_, { id }, context) => {
    return getScheduleById(context, { id })
  }
  const getScheduleByDateShell: ResponseResolver<{ year: number, month: number, date: number }, ScheduleData[] | null> = async (_, { year, month, date }, context) => {
    return getScheduleByDate(context, { year, month, date })
  }
  const getScheduleStatusByMonthShell: ResponseResolver<{ year: number, month: number }, string[][] | null> = async (_, { year, month }, context) => {
    return getScheduleStatusByMonth(context, { year, month })
  }
  const createScheduleShell: ResponseResolver<{ schedule: ScheduleCreateType }, ScheduleCreateType | null> = async (_, { schedule }, context) => {
    return createSchedule(context, { schedule })
  }
  const updateScheduleShell: ResponseResolver<{ schedule: ScheduleData }, ScheduleData | null> = async (_, { schedule }, context) => {
    return updateSchedule(context, { schedule })
  }
  const deleteScheduleShell: ResponseResolver<{ id: number }, string | null> = async (_, { id }, context) => {
    return deleteSchedule(context, { id })
  }
  const cloneScheduleShell: ResponseResolver<{ id: number, targetDate: ScheduleCreateType }, ScheduleData | null> = async (_, { id, targetDate }, context) => {
    const originalSchedule = await getScheduleById(context, { id })
    if (!originalSchedule) {
      throw new Error('Cannot find Schedule')
    }
    const newSchedule = await createSchedule(context, {
      schedule: {
        year: targetDate.year,
        month: targetDate.month,
        date: targetDate.date,
        type: 'SCHEDULED'
      }
    })
    if (!newSchedule) {
      throw new Error('Cannot create Schedule')
    }
    const exercises = await getExerciseByScheduleId(
      context,
      { scheduleId: originalSchedule.id }
    )
    if (exercises && exercises.length > 0) {
      const newExerciseList = await cloneExerciseList(context, { exerciseList: exercises })
      await createExerciseWithScheduleRelation(
        context,
        {
          scheduleId: newSchedule.id,
          exerciseList: newExerciseList
        }
      )
    }
    return newSchedule
  }
  const cloneScheduleFromPresetShell: ResponseResolver<{ presetId: number, targetDate: ScheduleCreateType }, ScheduleData | null> = async (_, { presetId, targetDate }, context) => {
    const newSchedule = await createSchedule(context, {
      schedule: {
        year: targetDate.year,
        month: targetDate.month,
        date: targetDate.date,
        type: 'SCHEDULED'
      }
    })
    if (!newSchedule) {
      throw new Error('Cannot create Schedule')
    }
    const exerciseList = await getExerciseByExercisePresetId(context, { exercisePresetId: presetId })
    if (exerciseList && exerciseList.length > 0) {
      const newExerciseList = await cloneExerciseList(context, { exerciseList })
      await createExerciseWithScheduleRelation(
        context,
        {
          scheduleId: newSchedule.id,
          exerciseList: newExerciseList
        }
      )
    }
    return newSchedule
  }
  return {
    Query: {
      getScheduleById: getScheduleByIdShell,
      getScheduleByDate: getScheduleByDateShell,
      getScheduleStatusByMonth: getScheduleStatusByMonthShell,
    },
    Mutation: {
      createSchedule: createScheduleShell,
      updateSchedule: updateScheduleShell,
      deleteSchedule: deleteScheduleShell,
      cloneSchedule: cloneScheduleShell,
      cloneScheduleFromPreset: cloneScheduleFromPresetShell
    }
  }
}
