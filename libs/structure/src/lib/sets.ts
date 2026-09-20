import { z } from 'zod';
import { IWeightUnit } from './measure';

/** SQLite INTEGER 0|1 또는 boolean을 boolean으로 수렴 */
const IBooleanFromSqlite = z.union([z.boolean(), z.literal(0), z.literal(1)]).transform(
  (value) => value === true || value === 1,
)

export const SetSchema = z.object({
  id: z.number(),
  exerciseId: z.number(),
  repeat: z.number(),
  isDone: IBooleanFromSqlite,
  weightUnit: IWeightUnit,
  weight: z.number().nullish(),
  duration: z.number().nullish(),
})

export const ISetCreateSchema = SetSchema.omit({ id: true }).extend({
  weight: z.number().optional(),
  duration: z.number().optional(),
})

export type SetCreateType = z.infer<typeof ISetCreateSchema>
export type SetData = z.infer<typeof SetSchema>