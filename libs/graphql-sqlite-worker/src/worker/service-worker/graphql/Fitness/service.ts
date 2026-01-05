import type { Fitness, FitnessDB } from '@fitness-recoder/structure'
import { IFitnessSchema } from '@fitness-recoder/structure'

interface GetFitnessByIdArgs { id: number }
interface GetFitnessByIdsArgs { ids: number[] }
interface GetFitnessListByKeywordsArgs {
  name: string,
  category: string[],
  muscle: string[],
  limit: number,
  offset: number
}

export const getFitnessById: ResponseBuilder<GetFitnessByIdArgs, Fitness | null> = async ({ client, dbBus}, { id }) => {
  const result = await dbBus?.sendTransaction<FitnessDB>(
    client,
    'select',
    'select * from fitness where id=?',
    [id]
  )
  if (!result) return null
  return IFitnessSchema.parse(result)
}

export const getFitnessByIds: ResponseBuilder<GetFitnessByIdsArgs, Fitness[] | null> = async ({ client, dbBus}, { ids }) => {
  const temp = new Array(ids.length).fill('?').join(', ')
  const result = await dbBus?.sendTransaction<FitnessDB[]>(
    client,
    'selects',
    `select * from fitness where id in (${temp})`,
    ids
  )
  if (!result) return null
  return result.map(res => IFitnessSchema.parse(res))
}

export const getFitnessListByKeywords: ResponseBuilder<GetFitnessListByKeywordsArgs, Fitness[] | null> = async ({ client, dbBus}, { name, category = [], muscle = [], limit, offset }) => {
  const whereQuery = []
  const argsQuery = []
  if (name) {
    whereQuery.push('name like ?')
    argsQuery.push(`%${name}%`)
  }
  if (category.length) {
    const temp1 = new Array(category.length).fill('?')
    whereQuery.push(`category in (${temp1.join(', ')})`)
    argsQuery.push(...category)
  }
  if (muscle.length) {
    muscle.forEach((m) => {
      whereQuery.push('totalUseMuscles like ?')
      argsQuery.push(`%${m}%`)
    })
  }
  const query = `select * from fitness ${whereQuery.length ? 'where ' + whereQuery.join(' and ') : ''} limit ?,?`
  const result = await dbBus?.sendTransaction<FitnessDB>(
    client,
    'selects',
    query,
    [...argsQuery, offset, limit]
  )
  if (!result) return []
  return result.map(res => IFitnessSchema.parse(res))
}