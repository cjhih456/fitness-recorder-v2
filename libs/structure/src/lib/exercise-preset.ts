import { z } from 'zod';
import { IExerciesSchema } from './exercise';

export const IExercisePresetSchema = z.object({
  id: z.number(),
  name: z.string(),
  deps: z.number(),
})

export const IExercisePresetCreateSchema = IExercisePresetSchema.omit({ id: true })

export const IExercisePresetWithExerciseListSchema = IExercisePresetSchema.extend({
  exerciseList: z.array(IExerciesSchema),
})

export type ExercisePresetData = z.infer<typeof IExercisePresetSchema>
export type ExercisePresetCreateType = z.infer<typeof IExercisePresetCreateSchema>
export type ExercisePresetWithExerciseList = z.infer<typeof IExercisePresetWithExerciseListSchema>