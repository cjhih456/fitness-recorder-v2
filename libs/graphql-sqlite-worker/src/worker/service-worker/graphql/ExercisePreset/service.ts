import { ExercisePresetData } from '@fitness-recoder/structure';
import {
  createExerciseByIds,
  createExerciseWithExercisePresetRelation,
  getExerciseByScheduleId
} from '../Exercise/repository';
import {
  createExercisePreset
} from './repository';

export const copyExercisePresetFromSchedule: ResponseBuilder<{ scheduleId: number, name: string }, ExercisePresetData | null> = async (context, { scheduleId, name }) => {
  const exercisePreset = await createExercisePreset(context, { exercisePreset: { name, deps: 0 } })
  if (!exercisePreset) return null
  const exerciseList = await getExerciseByScheduleId(context, { scheduleId })
  if (!exerciseList) return null
  const newExerciseList = await createExerciseByIds(context, { fitnessIds: exerciseList.map(v => v.fitnessId) })
  await createExerciseWithExercisePresetRelation(context, { exercisePresetId: exercisePreset.id, exerciseList: newExerciseList })

  return exercisePreset
}
