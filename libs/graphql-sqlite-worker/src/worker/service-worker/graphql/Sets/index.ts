import { makeExecutableSchema } from '@graphql-tools/schema'
import SetsSchema from './query.gql'
import resolvers from './resolvers'

export default function init() {
  return makeExecutableSchema({
    typeDefs: SetsSchema,
    resolvers: resolvers()
  })
}
