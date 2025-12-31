import { z } from 'zod';
import { IFitnessSchema } from './fitness';
import { IWeightUnit } from './measure';
export const IExerciesSchema = z.object({
  id: z.number(),
  fitnessId: z.number(),
  fitness: IFitnessSchema.optional(),
  deps: z.number(),
})

export const IHistoryDBSchema = z.object({
  id: z.number(),
  year: z.number(),
  month: z.number(),
  date: z.number(),
  exercise: z.number(),
  cnt: z.number(),
  weights: z.string(),
  repeats: z.string(),
  weightUnit: IWeightUnit,
})

export const IHistorySchema = IHistoryDBSchema.transform((data) => {
  const {
    weights,
    repeats,
    cnt,
    ...rest
  } = data
  const numWeights = weights.split(',').map(Number)
  const numRepeats = repeats.split(',').map(Number)
  const historyList = Array(cnt).fill(0).map((_, idx) => ({
    weight: numWeights[idx],
    repeat: numRepeats[idx],
  }))
  return {
    ...rest,
    historyList
  }
})
export type ExerciseData = z.infer<typeof IExerciesSchema>
export type ExerciseHistoryData = z.infer<typeof IHistorySchema>
export type ExerciseHistoryDBData = z.infer<typeof IHistoryDBSchema>
