import { mergeTypeDefs } from '@graphql-tools/merge';
import { makeExecutableSchema } from '@graphql-tools/schema';
import FitnessSchema from '../Fitness/query.gql'
import ExerciseSchema from './query.gql'
import resolvers from './resolvers';

export default function init() {
  return makeExecutableSchema({
    typeDefs: mergeTypeDefs([FitnessSchema, ExerciseSchema]),
    resolvers: resolvers()
  })
}
