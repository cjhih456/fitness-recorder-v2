import { create, windowedFiniteBatchScheduler, keyResolver } from "@yornaath/batshit";
import { SetData } from "@fitness-recoder/structure";
import { Set } from '../fragment';
import { gql, GraphQLClient } from "graphql-request";
import { useState } from "react";

const query = gql`
  query getSetByIds($ids: [Int!]) {
    getSetByIds(ids: $ids) {
      ...Set
    }
  }
  ${Set}
`

export const useSetQueryBatcher = (graphqlClient: GraphQLClient) => {
  const [setBatcher] = useState(() => create({
    name: 'set',
    fetcher: async (ids: number[]) => {
      const response = await graphqlClient.request<SetData[]>(query, { ids })
      return response
    },
    resolver: keyResolver<SetData[], number>('id', { indexed: true}),
    scheduler: windowedFiniteBatchScheduler({
      windowMs: 1000,
      maxBatchSize: 10,
    }),
  }))
  return setBatcher
}
