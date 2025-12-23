import { z } from 'zod';

export const IMeasureFields = z.enum(['reps', 'time', 'distance', 'weight'])

export const IWeightModifier = z.enum(['positive', 'negative'])

export const IWeightUnit = z.enum(['kg', 'lbs'])

export const IDistanceUnit = z.enum(['km', 'miles'])

export const MeasureSchema = z.object({
  requiredFields: z.array(IMeasureFields),
  optionalFields: z.array(IMeasureFields).optional(),
  weightModifier: IWeightModifier.optional(),
  weightUnit: IWeightUnit.optional(),
  distanceUnit: IDistanceUnit.optional(),
})
export type WeightModifier = z.infer<typeof IWeightModifier>
export type WeightUnit = z.infer<typeof IWeightUnit>
export type DistanceUnit = z.infer<typeof IDistanceUnit>
export type IFields = z.infer<typeof IMeasureFields>
export type Measure = z.infer<typeof MeasureSchema>
