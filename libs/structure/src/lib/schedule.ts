import { z } from 'zod';
import { IExerciesSchema } from './exercise';

export const IScheduleTypeSchema = z.enum(['BREAK', 'SCHEDULED', 'STARTED', 'PAUSED', 'FINISH'])

export const IScheduleSchema = z.object({
  id: z.number(),
  year: z.number(),
  month: z.number(),
  date: z.number(),
  type: IScheduleTypeSchema,
  start: z.number(),
  beforeTime: z.number(),
  breakTime: z.number(),
  workoutTimes: z.number(),
})

export const IScheduleCreateSchema = IScheduleSchema.pick({
  year: true,
  month: true,
  date: true,
  type: true
})

export const IScheduleWithExerciseListSchema = IScheduleSchema.extend({
  exerciseList: z.array(IExerciesSchema),
})
export type ScheduleType = z.infer<typeof IScheduleTypeSchema>
export type ScheduleCreateType = z.infer<typeof IScheduleCreateSchema>
export type ScheduleData = z.infer<typeof IScheduleSchema>
export type ScheduleWithExerciseList = z.infer<typeof IScheduleWithExerciseListSchema>