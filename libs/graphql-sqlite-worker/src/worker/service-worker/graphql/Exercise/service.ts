import type { ExerciseData } from '@fitness-recoder/structure'
import { getFitnessById, getFitnessByIds } from '../Fitness/service'
import { cloneListByExerciseId } from '../Sets/service'
import { createExerciseByIds } from './repository'

export const loadFitnessByExercise: ResponseBuilder<{ exercise: ExerciseData }, ExerciseData> = async (
  context,
  { exercise }
) => {
  const fitness = await getFitnessById(context, { id: exercise.fitnessId })
  return Object.assign(exercise, {
    fitness: fitness
  })
}

export const loadFitnessByExerciseList: ResponseBuilder<{ exerciseList: ExerciseData[] }, ExerciseData[]> = async (
  context,
  { exerciseList }
) => {
  const fitnessList = await getFitnessByIds(context, { ids: exerciseList.map(v => v.fitnessId) })
  return exerciseList.map(v => ({
    ...v,
    fitness: fitnessList?.find(f => f.id === v.fitnessId)
  }))
}

export const cloneExerciseList: ResponseBuilder<{ exerciseList: ExerciseData[] }, ExerciseData[]> = async (
  context,
  { exerciseList }
) => {
  const newExerciseList = await createExerciseByIds(context, { fitnessIds: exerciseList.map(v => v.fitnessId) })
  return await Promise.all(newExerciseList.map(async (newExercise, idx) => {
    await cloneListByExerciseId(context, { exerciseId: exerciseList[idx].id, newExerciseId: newExercise.id })
    return newExercise
  }))
}
