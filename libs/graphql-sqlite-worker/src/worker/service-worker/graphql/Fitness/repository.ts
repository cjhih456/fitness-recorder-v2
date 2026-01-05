import type { Fitness, FitnessDB } from '@fitness-recoder/structure'
import { IFitnessSchema } from '@fitness-recoder/structure'

export const getFitnessById: ResponseBuilder<{ id: number }, Fitness | null> = async ({ dbBus}, { id }) => {
  const result = await dbBus?.sendTransaction<FitnessDB>(
    'select',
    'select * from fitness where id=?',
    [id]
  )
  if (!result) return null
  return IFitnessSchema.parse(result)
}

