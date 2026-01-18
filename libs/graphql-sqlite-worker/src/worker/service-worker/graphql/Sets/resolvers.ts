import type { SetData, SetCreateType } from '@fitness-recoder/structure';
import type { IResolvers, GraphQLResolveInfo } from '@graphql-tools/utils';
import { getSetByIds, getSetById, getSetListByExerciseId, createSet, updateSet, deleteSetById } from './service';

export default (): IResolvers<unknown, GraphQLResolveInfo> => {
  const getSetByIdsShell: ResponseResolver<{ ids: number[] }, SetData[]> = async (_, { ids }, context) => {
    return getSetByIds(context, { ids })
  }
  const getSetByIdShell: ResponseResolver<{ id: number }, SetData | null> = async (_, { id }, context) => {
    return getSetById(context, { id })
  }
  const getSetListByExerciseIdShell: ResponseResolver<{ id: number }, SetData[]> = async (_, { id }, context) => {
    return getSetListByExerciseId(context, { id })
  }
  const createSetShell: ResponseResolver<{ sets: SetCreateType }, SetData | null> = async (_, { sets }, context) => {
    return createSet(context, { sets })
  }
  const updateSetShell: ResponseResolver<{ sets: SetData }, SetData | null> = async (_, { sets }, context) => {
    return updateSet(context, { sets })
  }
  const deleteSetByIdShell: ResponseResolver<{ id: number }, string | null> = async (_, { id }, context) => {
    return deleteSetById(context, { id })
  }
  return {
    Query: {
      getSetByIds: getSetByIdsShell,
      getSetById: getSetByIdShell,
      getSetListByExerciseId: getSetListByExerciseIdShell
    },
    Mutation: {
      createSet: createSetShell,
      updateSet: updateSetShell,
      deleteSetById: deleteSetByIdShell
    }
  }
}