import { z } from 'zod';
import { IWeightUnit } from './measure';
export const SetSchema = z.object({
  id: z.number(),
  exerciseId: z.number(),
  repeat: z.number(),
  isDone: z.boolean(),
  weightUnit: IWeightUnit,
  weight: z.number().optional(),
  duration: z.number().optional(),
})

export const ISetCreateSchema = SetSchema.omit({ id: true })

export type SetCreateType = z.infer<typeof ISetCreateSchema>
export type SetData = z.infer<typeof SetSchema>