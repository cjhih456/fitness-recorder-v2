import { mergeTypeDefs } from '@graphql-tools/merge';
import { makeExecutableSchema } from '@graphql-tools/schema';
import ExerciseSchema from '../Exercise/query.gql'
import FitnessSchema from '../Fitness/query.gql'
import ExercisePresetSchema from './query.gql'
import resolvers from './resolvers';

export default function init() {
  return makeExecutableSchema({
    typeDefs: mergeTypeDefs([FitnessSchema, ExerciseSchema, ExercisePresetSchema]),
    resolvers: resolvers()
  })
}
