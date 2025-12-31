import { z } from 'zod';

export const IFitnessMuscle = z.enum([
  'abdominals',
  'hamstrings',
  'calves',
  'shoulders',
  'adductors',
  'glutes',
  'quadriceps',
  'biceps',
  'forearms',
  'abductors',
  'triceps',
  'chest',
  'lower_back',
  'traps',
  'middle_back',
  'lats',
  'neck',
])

export const IFitnessForce = z.enum([
  'pull',
  'push',
  'static',
])

export const IFitnessLevel = z.enum([
  'beginner',
  'intermediate',
  'expert',
])

export const IFitnessMechanic = z.enum([
  'compound',
  'isolation',
])

export const IFitnessEquipment = z.enum([
  'body_only',
  'machine',
  'kettlebells',
  'dumbbell',
  'cable',
  'barbell',
  'bands',
  'medicine_ball',
  'exercise_ball',
  'e-z_curl_bar',
  'foam_roll',
  'other',
])

export const IFitnessCategory = z.enum([
  'strength',
  'stretching',
  'plyometrics',
  'strongman',
  'powerlifting',
  'cardio',
  'olympic_weightlifting',
  'crossfit',
  'weighted_bodyweight',
  'assisted_bodyweight',
])

export const IFitnessDBSchema = z.object({
  id: z.number(),
  name: z.string(),
  aliases: z.string().optional().or(z.null()),
  primaryMuscles: z.string(),
  secondaryMuscles: z.string(),
  force: IFitnessForce.optional().or(z.null()),
  level: IFitnessLevel,
  mechanic: IFitnessMechanic.optional().or(z.null()),
  equipment: IFitnessEquipment.optional().or(z.null()),
  category: IFitnessCategory,
  instructions: z.string(),
  description: z.string().optional().or(z.null()),
  tips: z.string().optional().or(z.null()),
})

export const IFitnessSchema = IFitnessDBSchema.transform((fitness) => ({
  ...fitness,
  description: fitness.description ?? '',
  equipment: fitness.equipment ?? 'other',
  aliases: JSON.parse(fitness.aliases ?? '[]') as string[],
  primaryMuscles: JSON.parse(fitness.primaryMuscles) as FitnessMuscle[],
  secondaryMuscles: JSON.parse(fitness.secondaryMuscles) as FitnessMuscle[],
  instructions: JSON.parse(fitness.instructions) as string[],
  tips: JSON.parse(fitness.tips ?? '[]') as string[],
}))

export const IFitnessSelected = IFitnessDBSchema.extend({
  selected: z.boolean()
})

export type FitnessMuscle = z.infer<typeof IFitnessMuscle>
export type FitnessForce = z.infer<typeof IFitnessForce>
export type FitnessLevel = z.infer<typeof IFitnessLevel>
export type FitnessMechanic = z.infer<typeof IFitnessMechanic>
export type FitnessEquipment = z.infer<typeof IFitnessEquipment>
export type FitnessCategory = z.infer<typeof IFitnessCategory>
export type Fitness = z.infer<typeof IFitnessSchema>
export type FitnessDB = z.infer<typeof IFitnessDBSchema>
export type FitnessSelected = z.infer<typeof IFitnessSelected>