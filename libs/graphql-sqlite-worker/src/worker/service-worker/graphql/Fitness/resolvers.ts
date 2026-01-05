import type { IResolvers } from '@graphql-tools/utils';
import { getFitnessById, getFitnessByIds, getFitnessListByKeywords } from './service';
import { Fitness } from '@fitness-recoder/structure';
interface GetFitnessByIdArgs { id: number }
interface GetFitnessByIdsArgs { ids: number[] }
interface GetFitnessListByKeywordsArgs {
  name: string,
  category: string[],
  muscle: string[],
  limit: number,
  offset: number
}

const fitnessResolver = (): IResolvers<any, { client: string }> => {
  const getFitnessByIdShell: ResponseResolver<GetFitnessByIdArgs, Fitness | null> = async (_, { id }, context) => {
    return getFitnessById(context, { id })
  }
  const getFitnessbyIdsShell: ResponseResolver<GetFitnessByIdsArgs, Fitness[] | null> = async (_, { ids }, context) => {
    return getFitnessByIds(context, { ids })
  }
  const getFitnessListByKeywordsShell: ResponseResolver<GetFitnessListByKeywordsArgs, Fitness[] | null> = async (_, { name, category = [], muscle = [], limit, offset }, context) => {
    return getFitnessListByKeywords(context, { name, category, muscle, limit, offset })
  }
  return {
    Query: {
      getFitnessById: getFitnessByIdShell,
      getFitnessListByIds: getFitnessbyIdsShell,
      getFitnessListByKeywords: getFitnessListByKeywordsShell
    }
  }
}
export default fitnessResolver